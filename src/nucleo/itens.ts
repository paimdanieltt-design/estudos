// Junta plano + progresso + calendário numa lista única de "itens" (tarefas do dia,
// tarefas extras e leituras avulsas). Todas as telas leem essa lista.
import type { Calendario } from './calendario'
import { dataDaTarefa, semanaDaData } from './calendario'
import type { Data, Plano, Progresso } from './tipos'

export interface Item {
  chave: string // 't:ID' (tarefa) | 'x:ID' (extra) | 'l:ID' (leitura avulsa)
  tipo: 'tarefa' | 'extra' | 'leitura'
  id: string
  titulo: string
  minutos: number
  disciplinaId?: string
  metaId?: string
  eventoId?: string
  leituraIds: string[]
  hora?: string
  feito: boolean
  dataOriginal: Data
  dataEfetiva: Data // dia em que aparece (muda se foi realocado)
  realocadoDe?: Data
  semana?: number
}

export function montarItens(plano: Plano, prog: Progresso, cal: Calendario): Item[] {
  const itens: Item[] = []
  const vinculadas = new Set<string>()

  for (const t of plano.tarefas) {
    if (prog.removidas[t.id]) continue
    const ids = t.leituraIds ?? []
    ids.forEach((i) => vinculadas.add(i))
    // Tarefa ligada a leituras: o "feito" vem das leituras (fonte única, nunca marca em dois lugares).
    const feito = ids.length ? ids.every((i) => !!prog.leiturasFeitas[i]) : !!prog.tarefasFeitas[t.id]
    const chave = `t:${t.id}`
    const original = dataDaTarefa(cal, t)
    const real = prog.realocacoes[chave]
    itens.push({
      chave, tipo: 'tarefa', id: t.id,
      titulo: prog.titulosEditados[t.id] ?? t.titulo,
      minutos: t.minutos, disciplinaId: t.disciplinaId, metaId: t.metaId, eventoId: t.eventoId,
      leituraIds: ids, hora: t.hora, feito,
      dataOriginal: original, dataEfetiva: real?.para ?? original, realocadoDe: real ? original : undefined,
      semana: t.semana,
    })
  }

  for (const x of prog.extras) {
    const chave = `x:${x.id}`
    const real = prog.realocacoes[chave]
    itens.push({
      chave, tipo: 'extra', id: x.id, titulo: x.titulo, minutos: 0, leituraIds: [], feito: x.feito,
      dataOriginal: x.dia, dataEfetiva: real?.para ?? x.dia, realocadoDe: real ? x.dia : undefined,
      semana: semanaDaData(cal, x.dia)?.n,
    })
  }

  // Leituras adicionadas por você que não estão ligadas a nenhuma tarefa.
  for (const l of prog.leiturasNovas) {
    if (vinculadas.has(l.id)) continue
    const chave = `l:${l.id}`
    const real = prog.realocacoes[chave]
    itens.push({
      chave, tipo: 'leitura', id: l.id, titulo: `Ler: ${l.titulo}`, minutos: l.minutos, disciplinaId: l.disciplinaId,
      leituraIds: [l.id], feito: !!prog.leiturasFeitas[l.id],
      dataOriginal: l.prazo, dataEfetiva: real?.para ?? l.prazo, realocadoDe: real ? l.prazo : undefined,
      semana: semanaDaData(cal, l.prazo)?.n,
    })
  }
  return itens
}
