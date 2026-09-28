// Contexto do app: guarda o progresso, calcula tudo o que as telas precisam
// e oferece as ações (marcar, realocar, editar...). Toda ação pode ser desfeita.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import planoJson from '../dados/plano.json'
import { montarCalendario, semanaDaData, type Calendario, type Semana } from '../nucleo/calendario'
import { hojeISO, somarDias } from '../nucleo/datas'
import { montarItens, type Item } from '../nucleo/itens'
import type { Data, Disciplina, Evento, Leitura, Nivel, Plano, Progresso } from '../nucleo/tipos'
import { carregar, estadoInicial, limpar, salvar } from './armazenamento'

const plano = planoJson as unknown as Plano

export interface Aviso { id: number; texto: string; desfazer?: () => void }

interface Ctx {
  plano: Plano
  prog: Progresso
  cal: Calendario
  hoje: Data
  semanaAtual: Semana | undefined
  numeroSemanaAtual: number
  itens: Item[]
  eventos: Evento[]
  leituras: Leitura[]
  disciplina: (id?: string) => Disciplina | undefined
  avisos: Aviso[]
  fecharAviso: (id: number) => void
  // ações
  alternarItem: (i: Item) => void
  alternarLeitura: (id: string) => void
  alternarEvento: (id: string) => void
  adicionarExtra: (dia: Data, titulo: string) => void
  removerExtra: (id: string) => void
  editarMeta: (id: string, texto: string) => void
  editarTitulo: (id: string, texto: string) => void
  removerTarefa: (id: string) => void
  realocar: (chaves: string[], para: Data) => void
  desfazerRealocacao: (chave: string) => void
  estenderSemana: (semana: number, dias: number) => void
  desfazerExtensao: () => void
  definirNivel: (topicoId: string, nivel: Nivel) => void
  adicionarPrazo: (e: Omit<Evento, 'id'>) => void
  removerPrazoNovo: (id: string) => void
  adicionarLeitura: (l: Omit<Leitura, 'id'>) => void
  removerLeituraNova: (id: string) => void
  alternarPrioridade: (l: Leitura) => void
  atualizarTrabalho: (fn: (t: Progresso['trabalho']) => Progresso['trabalho'], aviso?: string) => void
  restaurar: (p: Progresso) => void
  resetar: () => void
  marcarBackup: () => void
}

const Contexto = createContext<Ctx | null>(null)

export function useEstudos(): Ctx {
  const c = useContext(Contexto)
  if (!c) throw new Error('useEstudos precisa estar dentro do EstudosProvider')
  return c
}

let contadorAviso = 1
const novoId = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function EstudosProvider({ children }: { children: ReactNode }) {
  const [prog, setProg] = useState<Progresso>(carregar)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const progRef = useRef(prog)
  progRef.current = prog
  const [hoje, setHoje] = useState(hojeISO)

  useEffect(() => salvar(prog), [prog])
  // Se o app ficar aberto de um dia para o outro, atualiza o "hoje".
  useEffect(() => {
    const t = setInterval(() => setHoje(hojeISO()), 60_000)
    return () => clearInterval(t)
  }, [])

  const fecharAviso = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), [])

  /** Aplica uma mudança e, se houver texto, mostra um aviso com "Desfazer" (volta ao estado anterior). */
  const mudar = useCallback((fn: (p: Progresso) => Progresso, texto?: string) => {
    const antes = progRef.current
    const depois = fn(antes)
    setProg(depois)
    if (texto) {
      const id = contadorAviso++
      setAvisos((a) => [...a.slice(-2), { id, texto, desfazer: () => setProg(antes) }])
      setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 7000)
    }
  }, [])

  const cal = useMemo(() => montarCalendario(plano, prog.extensoes), [prog.extensoes])
  const itens = useMemo(() => montarItens(plano, prog, cal), [prog, cal])
  const eventos = useMemo(() => [...plano.eventos, ...prog.prazosNovos], [prog.prazosNovos])
  const leituras = useMemo(() => [...plano.leituras, ...prog.leiturasNovas], [prog.leiturasNovas])
  const semanaAtual = useMemo(() => semanaDaData(cal, hoje), [cal, hoje])
  const numeroSemanaAtual = semanaAtual?.n ?? (hoje < plano.inicio ? 1 : plano.totalSemanas)

  const disciplina = useCallback((id?: string) => plano.disciplinas.find((d) => d.id === id), [])

  const acoes = useMemo(() => {
    const agora = () => hojeISO()
    return {
      alternarItem: (i: Item) => {
        mudar((p) => {
          const n = { ...p }
          const marcar = !i.feito
          if (i.tipo === 'extra') {
            n.extras = p.extras.map((x) => (x.id === i.id ? { ...x, feito: marcar } : x))
          } else if (i.leituraIds.length) {
            // Marcar a tarefa marca as leituras (e vice-versa): uma fonte só.
            const l = { ...p.leiturasFeitas }
            i.leituraIds.forEach((id) => (marcar ? (l[id] = agora()) : delete l[id]))
            n.leiturasFeitas = l
          } else {
            const t = { ...p.tarefasFeitas }
            if (marcar) t[i.id] = agora(); else delete t[i.id]
            n.tarefasFeitas = t
          }
          return n
        }, i.feito ? undefined : 'Marcado como feito')
      },
      alternarLeitura: (id: string) => {
        mudar((p) => {
          const l = { ...p.leiturasFeitas }
          if (l[id]) delete l[id]; else l[id] = agora()
          return { ...p, leiturasFeitas: l }
        }, progRef.current.leiturasFeitas[id] ? undefined : 'Leitura marcada como feita')
      },
      alternarEvento: (id: string) => {
        mudar((p) => {
          const e = { ...p.eventosFeitos }
          if (e[id]) delete e[id]; else e[id] = agora()
          return { ...p, eventosFeitos: e }
        })
      },
      adicionarExtra: (dia: Data, titulo: string) => {
        const t = titulo.trim()
        if (!t) return
        mudar((p) => ({ ...p, extras: [...p.extras, { id: novoId('x'), dia, titulo: t, feito: false }] }))
      },
      removerExtra: (id: string) => {
        mudar((p) => {
          const r = { ...p.realocacoes }
          delete r[`x:${id}`]
          return { ...p, extras: p.extras.filter((x) => x.id !== id), realocacoes: r }
        }, 'Tarefa extra removida')
      },
      editarMeta: (id: string, texto: string) => {
        mudar((p) => {
          const m = { ...p.metasEditadas }
          const t = texto.trim()
          const original = plano.metas.find((x) => x.id === id)?.titulo
          if (!t || t === original) delete m[id]; else m[id] = t
          return { ...p, metasEditadas: m }
        })
      },
      editarTitulo: (id: string, texto: string) => {
        mudar((p) => {
          const m = { ...p.titulosEditados }
          const t = texto.trim()
          const original = plano.tarefas.find((x) => x.id === id)?.titulo
          if (!t || t === original) delete m[id]; else m[id] = t
          return { ...p, titulosEditados: m }
        })
      },
      removerTarefa: (id: string) => {
        mudar((p) => ({ ...p, removidas: { ...p.removidas, [id]: true } }), 'Tarefa removida do dia')
      },
      realocar: (chaves: string[], para: Data) => {
        mudar((p) => {
          const r = { ...p.realocacoes }
          for (const c of chaves) {
            const original = r[c]?.de ?? itens.find((i) => i.chave === c)?.dataOriginal ?? para
            r[c] = { de: original, para }
          }
          return { ...p, realocacoes: r }
        }, chaves.length > 1 ? `${chaves.length} itens realocados` : 'Item realocado')
      },
      desfazerRealocacao: (chave: string) => {
        mudar((p) => {
          const r = { ...p.realocacoes }
          delete r[chave]
          return { ...p, realocacoes: r }
        })
      },
      estenderSemana: (semana: number, dias: number) => {
        mudar((p) => ({
          ...p,
          extensoes: { ...p.extensoes, [semana]: (p.extensoes[semana] ?? 0) + dias },
          historicoExtensoes: [...p.historicoExtensoes, ...Array(dias).fill(semana)],
        }), `Semana ${semana} estendida em ${dias} dia${dias > 1 ? 's' : ''}`)
      },
      desfazerExtensao: () => {
        mudar((p) => {
          const h = [...p.historicoExtensoes]
          const s = h.pop()
          if (s === undefined) return p
          const ext = { ...p.extensoes, [s]: (p.extensoes[s] ?? 1) - 1 }
          if (ext[s] <= 0) delete ext[s]
          return { ...p, extensoes: ext, historicoExtensoes: h }
        })
      },
      definirNivel: (topicoId: string, nivel: Nivel) => {
        mudar((p) => ({ ...p, dominio: { ...p.dominio, [topicoId]: nivel } }))
      },
      adicionarPrazo: (e: Omit<Evento, 'id'>) => {
        mudar((p) => ({ ...p, prazosNovos: [...p.prazosNovos, { ...e, id: novoId('e-novo') }] }), 'Prazo adicionado')
      },
      removerPrazoNovo: (id: string) => {
        mudar((p) => ({ ...p, prazosNovos: p.prazosNovos.filter((e) => e.id !== id) }), 'Prazo removido')
      },
      adicionarLeitura: (l: Omit<Leitura, 'id'>) => {
        mudar((p) => ({ ...p, leiturasNovas: [...p.leiturasNovas, { ...l, id: novoId('l-nova') }] }), 'Leitura adicionada')
      },
      removerLeituraNova: (id: string) => {
        mudar((p) => ({ ...p, leiturasNovas: p.leiturasNovas.filter((l) => l.id !== id) }), 'Leitura removida')
      },
      alternarPrioridade: (l: Leitura) => {
        mudar((p) => ({ ...p, prioritarias: { ...p.prioritarias, [l.id]: !(p.prioritarias[l.id] ?? l.prioritaria ?? false) } }))
      },
      atualizarTrabalho: (fn: (t: Progresso['trabalho']) => Progresso['trabalho'], aviso?: string) => {
        mudar((p) => ({ ...p, trabalho: fn(p.trabalho) }), aviso)
      },
      restaurar: (p: Progresso) => setProg(p),
      resetar: () => { limpar(); setProg(estadoInicial()) },
      marcarBackup: () => mudar((p) => ({ ...p, ultimoBackup: new Date().toISOString() })),
    }
  }, [mudar, itens])

  const valor: Ctx = {
    plano, prog, cal, hoje, semanaAtual, numeroSemanaAtual, itens, eventos, leituras, disciplina, avisos, fecharAviso, ...acoes,
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/** Atalho: 'amanhã' a partir de hoje. */
export const amanha = (hoje: Data) => somarDias(hoje, 1)
