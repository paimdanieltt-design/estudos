// Salvar e carregar o progresso no localStorage do navegador.
import type { Progresso } from '../nucleo/tipos'

const CHAVE = 'estudos-unb:progresso'
export const VERSAO = 1

export function estadoInicial(): Progresso {
  return {
    versao: VERSAO,
    tarefasFeitas: {}, leiturasFeitas: {}, eventosFeitos: {},
    extras: [], metasEditadas: {}, titulosEditados: {}, removidas: {}, realocacoes: {},
    extensoes: {}, historicoExtensoes: [], dominio: {},
    prazosNovos: [], leiturasNovas: [], prioritarias: {},
    trabalho: { tarefas: [], notas: '' },
  }
}

/** Mescla um progresso salvo (talvez de versão antiga) com o estado inicial: campos novos ganham valor padrão. */
export function mesclar(salvo: unknown): Progresso {
  const base = estadoInicial()
  if (!salvo || typeof salvo !== 'object') return base
  const s = salvo as Partial<Progresso>
  return {
    ...base, ...s,
    trabalho: { ...base.trabalho, ...(s.trabalho ?? {}) },
    versao: VERSAO,
  }
}

export function carregar(): Progresso {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? mesclar(JSON.parse(bruto)) : estadoInicial()
  } catch {
    return estadoInicial()
  }
}

export function salvar(p: Progresso): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p))
  } catch {
    // sem espaço ou navegador bloqueando: o app continua funcionando, só não salva
  }
}

export function limpar(): void {
  try { localStorage.removeItem(CHAVE) } catch { /* ignora */ }
}

// ------------------------------------------------------------------ backup
export interface ArquivoBackup { app: 'estudos-unb'; versao: number; geradoEm: string; progresso: Progresso }

export function criarBackup(p: Progresso): ArquivoBackup {
  return { app: 'estudos-unb', versao: VERSAO, geradoEm: new Date().toISOString(), progresso: p }
}

/** Valida o arquivo escolhido. Devolve o progresso ou uma mensagem de erro em português. */
export function validarBackup(texto: string): { ok: true; progresso: Progresso; geradoEm: string } | { ok: false; erro: string } {
  let dados: unknown
  try { dados = JSON.parse(texto) } catch { return { ok: false, erro: 'Esse arquivo não é um backup válido (não consegui ler).' } }
  const b = dados as Partial<ArquivoBackup>
  if (!b || b.app !== 'estudos-unb' || typeof b.progresso !== 'object' || b.progresso === null) {
    return { ok: false, erro: 'Esse arquivo não parece ser um backup deste app.' }
  }
  if (typeof b.versao !== 'number' || b.versao > VERSAO) {
    return { ok: false, erro: 'Esse backup é de uma versão mais nova do app. Atualize o app e tente de novo.' }
  }
  return { ok: true, progresso: mesclar(b.progresso), geradoEm: b.geradoEm ?? '' }
}
