// Calendário: ÚNICO lugar que calcula as datas das semanas.
// Nenhuma tela lê datas direto do plano; todas passam por aqui,
// assim os ajustes ("preciso de mais dias") valem no app inteiro.
import type { Data, Evento, Plano, Tarefa } from './tipos'
import { diasEntre, somarDias } from './datas'

export interface Semana {
  n: number
  inicio: Data
  fim: Data
  dias: number // 7 + dias extras
  extra: number
}

export type Calendario = Semana[]

/** Monta todas as semanas. `extensoes` = { semana: diasExtras }. */
export function montarCalendario(
  plano: Pick<Plano, 'inicio' | 'totalSemanas'>,
  extensoes: Record<number, number> = {},
): Calendario {
  const semanas: Calendario = []
  let inicio = plano.inicio
  for (let n = 1; n <= plano.totalSemanas; n++) {
    const extra = extensoes[n] ?? 0
    const dias = 7 + extra
    semanas.push({ n, inicio, fim: somarDias(inicio, dias - 1), dias, extra })
    inicio = somarDias(inicio, dias)
  }
  return semanas
}

/** Data de um dia (0 = segunda) de uma semana. */
export function dataDe(cal: Calendario, semana: number, dow: number): Data {
  const s = cal[semana - 1]
  return s ? somarDias(s.inicio, dow) : somarDias(cal[0].inicio, (semana - 1) * 7 + dow)
}

export function semanaDaData(cal: Calendario, d: Data): Semana | undefined {
  return cal.find((s) => d >= s.inicio && d <= s.fim)
}

export function dataDaTarefa(cal: Calendario, t: Pick<Tarefa, 'semana' | 'dow'>): Data {
  return dataDe(cal, t.semana, t.dow)
}

/** Dias extras somados (quanto o plano foi empurrado). */
export function totalExtensao(extensoes: Record<number, number>): number {
  return Object.values(extensoes).reduce((a, b) => a + b, 0)
}

/** Data em que o plano termina, já com os ajustes. */
export function fimDoPlano(plano: Pick<Plano, 'fim'>, extensoes: Record<number, number>): Data {
  return somarDias(plano.fim, totalExtensao(extensoes))
}

export interface PrevisaoExtensao {
  fimNovo: Data
  diasAlemDoFim: number
  eventosAfetados: Evento[]
}

/** Antes de confirmar "preciso de mais dias": onde o plano vai terminar e o que fica para depois da data. */
export function preverExtensao(
  plano: Plano,
  extensoesAtuais: Record<number, number>,
  semana: number,
  dias: number,
  eventos: Evento[],
): PrevisaoExtensao {
  const novas = { ...extensoesAtuais, [semana]: (extensoesAtuais[semana] ?? 0) + dias }
  const calAntes = montarCalendario(plano, extensoesAtuais)
  const calDepois = montarCalendario(plano, novas)
  const fimNovo = fimDoPlano(plano, novas)
  const afetados = eventos.filter((e) =>
    plano.tarefas.some(
      (t) =>
        t.eventoId === e.id &&
        dataDaTarefa(calDepois, t) > e.data &&
        dataDaTarefa(calAntes, t) <= e.data,
    ),
  )
  return { fimNovo, diasAlemDoFim: Math.max(0, diasEntre(plano.fim, fimNovo)), eventosAfetados: afetados }
}
