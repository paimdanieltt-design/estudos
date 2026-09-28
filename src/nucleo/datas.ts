// Funções de data. Sempre trabalham no fuso local (nunca `new Date("2026-09-08")`,
// que poderia "voltar um dia").
import type { Data } from './tipos'

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** 'AAAA-MM-DD' -> Date no fuso local (meia-noite). */
export function paraDate(d: Data): Date {
  const [a, m, dia] = d.split('-').map(Number)
  return new Date(a, m - 1, dia)
}

/** Date -> 'AAAA-MM-DD' (fuso local). */
export function deDate(d: Date): Data {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

export function somarDias(d: Data, n: number): Data {
  const x = paraDate(d)
  x.setDate(x.getDate() + n)
  return deDate(x)
}

/** Diferença em dias (b - a). Usa UTC para não errar em horário de verão. */
export function diasEntre(a: Data, b: Data): number {
  const [a1, a2, a3] = a.split('-').map(Number)
  const [b1, b2, b3] = b.split('-').map(Number)
  return Math.round((Date.UTC(b1, b2 - 1, b3) - Date.UTC(a1, a2 - 1, a3)) / 86400000)
}

/** Hoje. Em desenvolvimento dá para simular: abra /?hoje=2026-10-05 */
export function hojeISO(): Data {
  if (import.meta.env.DEV) {
    const simulado = new URLSearchParams(window.location.search).get('hoje')
    if (simulado && /^\d{4}-\d{2}-\d{2}$/.test(simulado)) return simulado
  }
  return deDate(new Date())
}

/** 0 = segunda ... 6 = domingo */
export function diaDaSemana(d: Data): number {
  return (paraDate(d).getDay() + 6) % 7
}

const DIAS_CURTOS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const DIAS_LONGOS = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export const nomeDiaCurto = (dow: number) => DIAS_CURTOS[dow]

/** '28/09' */
export function fmtDiaMes(d: Data): string {
  const [, m, dia] = d.split('-')
  return `${dia}/${m}`
}

/** 'seg, 28/09' */
export function fmtCurto(d: Data): string {
  return `${DIAS_CURTOS[diaDaSemana(d)]}, ${fmtDiaMes(d)}`
}

/** 'segunda-feira, 28 de setembro' */
export function fmtLongo(d: Data): string {
  const x = paraDate(d)
  return `${DIAS_LONGOS[diaDaSemana(d)]}, ${x.getDate()} de ${MESES[x.getMonth()]}`
}

export function fmtMinutos(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h}h${doisDigitos(r)}` : `${h}h`
}

/** 'Faltam 3 dias', 'É hoje', 'Amanhã' */
export function fmtFaltam(dias: number): string {
  if (dias === 0) return 'É hoje'
  if (dias === 1) return 'Amanhã'
  if (dias < 0) return `Passou há ${-dias} dia${dias === -1 ? '' : 's'}`
  return `Faltam ${dias} dias`
}
