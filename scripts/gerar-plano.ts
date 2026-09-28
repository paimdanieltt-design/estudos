// Gera src/dados/plano.json a partir de fonte.ts + replanejamento.ts.
// Uso: npm run plano
//
// Ideia central: a "meta da semana" é feita das tarefas dos dias.
//  1) cada leitura/trabalho vira tarefas com conteúdo real;
//  2) cada tarefa é colocada num dia que ainda tem tempo livre;
//  3) as metas da semana nascem juntando as tarefas de um mesmo assunto.
import { writeFileSync } from 'node:fs'
import * as F from '../src/dados/fonte'
import { replanejamento as R } from '../src/dados/replanejamento'
import type { Meta, Plano, Tarefa } from '../src/nucleo/tipos'
import { diasEntre, diaDaSemana, somarDias, fmtDiaMes } from '../src/nucleo/datas'

const CAP_UTIL = 75
const CAP_FIM = 120

const limite = (a: string, b: string) => (a < b ? b : a)
const semanaDe = (d: string) => Math.floor(diasEntre(F.INICIO, d) / 7) + 1
const dowDe = (d: string) => diaDaSemana(d)

// ---------------------------------------------------------------- capacidade
const usado: Record<string, number> = {}
const capacidade = (d: string) => R.capacidadePorData[d] ?? (dowDe(d) >= 5 ? CAP_FIM : CAP_UTIL)
const livre = (d: string) => capacidade(d) - (usado[d] ?? 0)

/** Escolhe o dia da janela com mais tempo livre (empate: o mais perto do prazo). */
function escolherDia(de: string, ate: string, minutos: number): string {
  let a = limite(de, F.DIA_INICIAL_APP)
  let b = ate < F.FIM ? ate : F.FIM
  if (b < a) b = a
  if (a > b) a = b
  let melhor = a
  for (let d = a; d <= b; d = somarDias(d, 1)) if (livre(d) >= livre(melhor)) melhor = d
  usado[melhor] = (usado[melhor] ?? 0) + minutos
  return melhor
}

// ---------------------------------------------------------------- montagem
const tarefas: Tarefa[] = []
const metas = new Map<string, Meta>()
const disc = (id: string) => F.disciplinas.find((d) => d.id === id)!

function adicionar(t: Omit<Tarefa, 'semana' | 'dow'>, dia: string, metaTitulo?: string, metaChave?: string) {
  const semana = semanaDe(dia)
  let metaId: string | undefined
  if (metaTitulo && metaChave) {
    metaId = `m-${semana}-${metaChave}`
    if (!metas.has(metaId)) metas.set(metaId, { id: metaId, semana, titulo: metaTitulo, disciplinaId: t.disciplinaId! })
  }
  tarefas.push({ ...t, semana, dow: dowDe(dia), ...(metaId ? { metaId } : {}) })
}

// 1) Tarefas fixas (dia marcado)
for (const f of F.fixos) {
  const tr = F.trabalhos.find((t) => t.id === f.trabalhoId)!
  if (f.consomeCapacidade) usado[f.data] = (usado[f.data] ?? 0) + f.minutos
  adicionar(
    { id: `t-fixo-${f.id}`, titulo: f.titulo, minutos: f.minutos, eventoId: f.eventoId, hora: f.hora, disciplinaId: f.disciplinaId },
    f.data, tr.titulo, tr.id,
  )
}

// 2) Revisão semanal (tarefa geral, sem meta), todo domingo
for (let d = '2026-10-04'; d <= F.FIM; d = somarDias(d, 7)) {
  usado[d] = (usado[d] ?? 0) + 15
  adicionar({ id: `t-rev-${d}`, titulo: 'Revisar a semana: conferir metas, atrasos e planejar a próxima', minutos: 15, disciplinaId: 'geral' }, d)
}

// 3) Fila de trabalho: leituras e blocos, do prazo mais curto para o mais longo
interface Pedido { fim: string; colocar: () => void }
const fila: Pedido[] = []

// 3a) Leituras: uma tarefa por aula (disciplina + prazo)
const leituras = F.leituras
  .map((l) => ({ ...l, prazo: R.leiturasRemarcadas[l.id] ?? l.prazo, prioritaria: l.prioritaria || R.prioridadesLeitura.includes(l.id) || undefined }))
  .filter((l) => l.prazo > F.DIA_INICIAL_APP)
const grupos = new Map<string, typeof leituras>()
for (const l of leituras) {
  const k = `${l.disciplinaId}|${l.prazo}`
  grupos.set(k, [...(grupos.get(k) ?? []), l])
}
const curto = (t: string) => /^([A-ZÀ-Ú][A-ZÀ-Ú;&' ]+)\./.exec(t)?.[1]?.trim() ?? t.slice(0, 45)

for (const [k, ls] of grupos) {
  const [d, prazo] = k.split('|')
  const min = ls.reduce((s, l) => s + l.minutos, 0)
  const titulo = ls.length === 1 ? `Ler: ${ls[0].titulo}` : `Ler para a aula de ${fmtDiaMes(prazo)}: ${ls.map((l) => curto(l.titulo)).join(' + ')}`
  fila.push({
    fim: somarDias(prazo, -1),
    colocar() {
      const dia = escolherDia(somarDias(prazo, -5), somarDias(prazo, -1), min)
      adicionar({ id: `t-leit-${d}-${prazo}`, titulo, minutos: min, leituraIds: ls.map((l) => l.id), disciplinaId: d }, dia, `${disc(d).curto}: leituras da semana`, `leit-${d}`)
    },
  })
}

// 3b) Trabalhos: blocos espalhados entre `de` e `ate`
for (const tr of F.trabalhos) {
  if (R.ignorarTrabalhos.includes(tr.id)) continue
  const de = R.janelas[tr.id]?.de ?? tr.de
  const ate = R.janelas[tr.id]?.ate ?? tr.ate
  const n = tr.blocos.length
  const span = diasEntre(de, ate) + 1
  tr.blocos.forEach(([texto, min], i) => {
    const ini = Math.floor((i * span) / n)
    const fimJ = Math.max(Math.floor(((i + 1) * span) / n) - 1, ini)
    fila.push({
      fim: somarDias(de, fimJ),
      colocar() {
        const dia = escolherDia(somarDias(de, ini), somarDias(de, fimJ), min)
        adicionar({ id: `t-${tr.id}-${i + 1}`, titulo: texto, minutos: min, eventoId: tr.eventoId, disciplinaId: tr.disciplinaId }, dia, tr.titulo, tr.id)
      },
    })
  })
}

fila.sort((a, b) => (a.fim < b.fim ? -1 : a.fim > b.fim ? 1 : 0))
fila.forEach((p) => p.colocar())

tarefas.sort((a, b) => a.semana - b.semana || a.dow - b.dow || a.id.localeCompare(b.id))

// ---------------------------------------------------------------- checagens
const ids = new Set<string>()
for (const t of tarefas) {
  if (ids.has(t.id)) throw new Error(`Tarefa repetida: ${t.id}`)
  ids.add(t.id)
}
const eventos = F.eventos.map((e) => ({ ...e, data: R.eventosRemarcados[e.id] ?? e.data }))
const idsEventos = new Set(eventos.map((e) => e.id))
for (const t of tarefas) if (t.eventoId && !idsEventos.has(t.eventoId)) throw new Error(`Evento inexistente: ${t.eventoId}`)

const plano: Plano = {
  inicio: F.INICIO,
  fim: F.FIM,
  totalSemanas: F.TOTAL_SEMANAS,
  primeiraSemanaVisivel: F.PRIMEIRA_SEMANA_VISIVEL,
  diaInicialApp: F.DIA_INICIAL_APP,
  capacidade: { util: CAP_UTIL, fimDeSemana: CAP_FIM },
  fases: F.fases,
  disciplinas: F.disciplinas,
  leituras,
  eventos,
  metas: [...metas.values()].sort((a, b) => a.semana - b.semana || a.id.localeCompare(b.id)),
  tarefas,
  topicos: F.topicos,
  compromissos: F.compromissos,
}
writeFileSync(new URL('../src/dados/plano.json', import.meta.url), JSON.stringify(plano, null, 1))

// ---------------------------------------------------------------- resumo
const sobrecarga = Object.entries(usado).filter(([d, m]) => m > capacidade(d)).sort()
console.log(`Plano gerado: ${tarefas.length} tarefas, ${metas.size} metas, ${leituras.length} leituras, ${eventos.length} eventos.`)
console.log(`Dias acima do tempo combinado: ${sobrecarga.length}`)
for (const [d, m] of sobrecarga) console.log(`  ${d}: ${m} min planejados (combinado: ${capacidade(d)} min)`)
