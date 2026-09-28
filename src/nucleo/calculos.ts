// Cálculos sem estado: recebem dados e devolvem resultados. Fáceis de testar.
import type { Item } from './itens'
import { diasEntre } from './datas'
import type { Data, Evento, Leitura, Meta, Nivel, Plano, Progresso } from './tipos'

// ------------------------------------------------------------------ metas e semanas
export interface ResumoMeta {
  meta: Meta
  feitas: number
  total: number
  concluida: boolean
  proxima?: Item // próxima tarefa pendente (para o link "ir para o dia")
}

export function resumoDaMeta(meta: Meta, itens: Item[]): ResumoMeta {
  const doMeta = itens.filter((i) => i.metaId === meta.id)
  const pendentes = doMeta.filter((i) => !i.feito).sort((a, b) => a.dataEfetiva.localeCompare(b.dataEfetiva))
  const feitas = doMeta.length - pendentes.length
  return { meta, feitas, total: doMeta.length, concluida: doMeta.length > 0 && pendentes.length === 0, proxima: pendentes[0] }
}

export type StatusSemana = 'pendente' | 'andamento' | 'concluido' | 'vazia'

export function statusDaSemana(resumos: ResumoMeta[]): StatusSemana {
  const validos = resumos.filter((r) => r.total > 0)
  if (validos.length === 0) return 'vazia'
  if (validos.every((r) => r.concluida)) return 'concluido'
  if (validos.some((r) => r.feitas > 0)) return 'andamento'
  return 'pendente'
}

export const rotuloStatus: Record<StatusSemana, string> = {
  pendente: 'Pendente', andamento: 'Em andamento', concluido: 'Concluído', vazia: 'Sem metas',
}

export function resumosDaSemana(plano: Plano, itens: Item[], semana: number): ResumoMeta[] {
  return plano.metas.filter((m) => m.semana === semana).map((m) => resumoDaMeta(m, itens))
}

// ------------------------------------------------------------------ atrasos
/** Atrasado = passou do dia (original ou reagendado) e não foi feito. */
export function atrasados(itens: Item[], hoje: Data): Item[] {
  return itens
    .filter((i) => !i.feito && i.dataEfetiva < hoje)
    .sort((a, b) => a.dataOriginal.localeCompare(b.dataOriginal))
}

/** Item que foi reagendado para um dia que já passou sem ser feito. */
export const reagendadoNaoFeito = (i: Item, hoje: Data) => !!i.realocadoDe && !i.feito && i.dataEfetiva < hoje

// ------------------------------------------------------------------ progresso geral
export function progressoGeral(plano: Plano, itens: Item[], ateSemana: number) {
  const resumos = plano.metas.filter((m) => m.semana >= plano.primeiraSemanaVisivel && m.semana <= ateSemana).map((m) => resumoDaMeta(m, itens))
  const validos = resumos.filter((r) => r.total > 0)
  const cumpridas = validos.filter((r) => r.concluida).length
  // crédito parcial: cada meta cumprida conta, mesmo que a semana toda não esteja 100%
  const percentual = validos.length ? Math.round((cumpridas / validos.length) * 100) : 0
  return { cumpridas, total: validos.length, percentual }
}

/**
 * Sequência de semanas concluídas, contando de trás para frente.
 * A semana em andamento não zera; uma semana passada incompleta zera.
 */
export function sequenciaDeSemanas(plano: Plano, itens: Item[], semanaAtual: number) {
  const concluida = (s: number) => statusDaSemana(resumosDaSemana(plano, itens, s)) === 'concluido'
  const vazia = (s: number) => statusDaSemana(resumosDaSemana(plano, itens, s)) === 'vazia'
  let seq = concluida(semanaAtual) ? 1 : 0
  let quebrou = false
  for (let s = semanaAtual - 1; s >= plano.primeiraSemanaVisivel; s--) {
    if (vazia(s)) continue
    if (concluida(s)) seq++
    else { quebrou = true; break }
  }
  return { seq, quebrou }
}

export function mensagemIncentivo(seq: number, quebrou: boolean): string {
  if (seq >= 3) return `${seq} semanas seguidas! Ritmo excelente.`
  if (seq === 2) return '2 semanas seguidas. Continue assim!'
  if (seq === 1) return 'Uma semana concluída. Vamos para a próxima!'
  if (quebrou) return 'A última semana ficou incompleta, mas dá para recomeçar hoje.'
  return 'Sua sequência começa quando você concluir a primeira semana.'
}

// ------------------------------------------------------------------ prazos
export interface Prazo {
  tipo: 'evento' | 'leitura'
  id: string
  titulo: string
  data: Data
  disciplinaId?: string
  feitas: number
  total: number
}

/** Fração feita do que prepara um evento (tarefas ligadas a ele). */
export function progressoDoEvento(e: Evento, itens: Item[], prog: Progresso): { feitas: number; total: number } {
  const ligados = itens.filter((i) => i.eventoId === e.id)
  if (ligados.length === 0) return { feitas: prog.eventosFeitos[e.id] ? 1 : 0, total: 1 }
  return { feitas: ligados.filter((i) => i.feito).length, total: ligados.length }
}

/** Prazo mais próximo: provas, entregas, apresentações e leituras prioritárias. */
export function prazoMaisProximo(eventos: Evento[], leituras: Leitura[], itens: Item[], prog: Progresso, hoje: Data): Prazo | undefined {
  const candidatos: Prazo[] = []
  for (const e of eventos) {
    if (e.data < hoje || prog.eventosFeitos[e.id]) continue
    const p = progressoDoEvento(e, itens, prog)
    candidatos.push({ tipo: 'evento', id: e.id, titulo: e.titulo, data: e.data, disciplinaId: e.disciplinaId, ...p })
  }
  for (const l of leituras) {
    const prio = prog.prioritarias[l.id] ?? l.prioritaria
    if (!prio || l.prazo < hoje || prog.leiturasFeitas[l.id]) continue
    candidatos.push({ tipo: 'leitura', id: l.id, titulo: l.titulo, data: l.prazo, disciplinaId: l.disciplinaId, feitas: 0, total: 1 })
  }
  return candidatos.sort((a, b) => a.data.localeCompare(b.data))[0]
}

export const diasAte = (data: Data, hoje: Data) => diasEntre(hoje, data)

// ------------------------------------------------------------------ carga do dia
export function minutosDoDia(itens: Item[], dia: Data): number {
  return itens.filter((i) => i.dataEfetiva === dia && i.tipo !== 'extra').reduce((s, i) => s + i.minutos, 0)
}

// ------------------------------------------------------------------ dashboard
export interface PontoSemana {
  semana: number
  rotulo: string
  tarefasFeitas: number
  tarefasTotal: number
  leiturasFeitas: number
  leiturasTotal: number
  pctTarefas: number | null
  pctLeituras: number | null
}

/** Porcentagem concluída por semana, separando tarefas de leituras. */
export function estatisticasPorSemana(plano: Plano, itens: Item[], rotuloDe: (s: number) => string): PontoSemana[] {
  const pontos: PontoSemana[] = []
  for (let s = plano.primeiraSemanaVisivel; s <= plano.totalSemanas; s++) {
    const daSemana = itens.filter((i) => i.semana === s)
    let tf = 0, tt = 0, lf = 0, lt = 0
    for (const i of daSemana) {
      if (i.leituraIds.length) {
        // cada leitura conta uma vez (uma tarefa de leitura pode ter vários textos)
        lt += i.leituraIds.length
        lf += i.feito ? i.leituraIds.length : 0
      } else {
        tt += 1
        tf += i.feito ? 1 : 0
      }
    }
    if (tt + lt === 0) continue
    pontos.push({
      semana: s, rotulo: rotuloDe(s),
      tarefasFeitas: tf, tarefasTotal: tt, leiturasFeitas: lf, leiturasTotal: lt,
      pctTarefas: tt ? Math.round((tf / tt) * 100) : null,
      pctLeituras: lt ? Math.round((lf / lt) * 100) : null,
    })
  }
  return pontos
}

// ------------------------------------------------------------------ conteúdo
const PESO_NIVEL: Record<Nivel, number> = { 'nao-iniciado': 0, estudando: 0.33, revisar: 0.66, dominado: 1 }
export const rotuloNivel: Record<Nivel, string> = {
  'nao-iniciado': 'Não iniciado', estudando: 'Estudando', revisar: 'Revisar', dominado: 'Dominado',
}
export const ordemNiveis: Nivel[] = ['nao-iniciado', 'estudando', 'revisar', 'dominado']

export function progressoConteudo(topicoIds: string[], dominio: Record<string, Nivel>): number {
  if (topicoIds.length === 0) return 0
  const soma = topicoIds.reduce((s, id) => s + PESO_NIVEL[dominio[id] ?? 'nao-iniciado'], 0)
  return Math.round((soma / topicoIds.length) * 100)
}
