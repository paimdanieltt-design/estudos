// Tipos do app. Datas sempre no formato texto 'AAAA-MM-DD'.
export type Data = string

/** Disciplina (ou projeto pessoal, como TCC e Intercâmbio). */
export interface Disciplina {
  id: string
  nome: string
  curto: string // nome curto usado na etiqueta
  cor: string // cor da etiqueta
  horario: string
  professor?: string
  projeto?: boolean // true = não é disciplina (TCC, Intercâmbio)
}

/** Uma leitura com prazo (normalmente o dia da aula). */
export interface Leitura {
  id: string
  disciplinaId: string
  titulo: string
  prazo: Data
  minutos: number
  prioritaria?: boolean
}

export type TipoEvento = 'prova' | 'entrega' | 'apresentacao' | 'pessoal'

/** Prova, entrega, apresentação ou marco pessoal. */
export interface Evento {
  id: string
  disciplinaId?: string
  tipo: TipoEvento
  titulo: string
  data: Data
  hora?: string
  peso?: string
  detalhe?: string
}

/** Meta da semana. Completa sozinha quando todas as tarefas dela estão feitas. */
export interface Meta {
  id: string
  semana: number
  titulo: string
  disciplinaId: string
}

/** Tarefa de um dia. Posição = semana + dia da semana (0 = segunda). */
export interface Tarefa {
  id: string
  semana: number
  dow: number
  titulo: string
  minutos: number
  metaId?: string // sem meta = tarefa geral
  leituraIds?: string[] // tarefas de leitura ficam ligadas às leituras
  eventoId?: string
  hora?: string
  disciplinaId?: string
}

export interface Topico {
  id: string
  disciplinaId: string
  titulo: string
}

/** Compromisso fixo da semana (aula, trabalho, inglês). Só informativo. */
export interface Compromisso {
  dow: number[]
  hora: string
  titulo: string
  disciplinaId?: string
  ate?: Data // última data em que acontece
  semAula?: Data[] // datas em que não acontece
}

export interface Fase {
  de: number
  ate: number
  nome: string
}

export interface Plano {
  inicio: Data // segunda-feira da semana 1
  fim: Data // último dia de aula
  totalSemanas: number
  primeiraSemanaVisivel: number
  diaInicialApp: Data
  capacidade: { util: number; fimDeSemana: number }
  fases: Fase[]
  disciplinas: Disciplina[]
  leituras: Leitura[]
  eventos: Evento[]
  metas: Meta[]
  tarefas: Tarefa[]
  topicos: Topico[]
  compromissos: Compromisso[]
}

export type Nivel = 'nao-iniciado' | 'estudando' | 'revisar' | 'dominado'

export interface Extra {
  id: string
  dia: Data
  titulo: string
  feito: boolean
}

export interface TarefaTrabalho {
  id: string
  titulo: string
  prazo?: Data
  feito: boolean
}

/** Tudo o que o usuário marca/edita. Separado do plano (que é fixo). */
export interface Progresso {
  versao: number
  tarefasFeitas: Record<string, string> // id -> data em que foi marcada
  leiturasFeitas: Record<string, string>
  eventosFeitos: Record<string, string>
  extras: Extra[]
  metasEditadas: Record<string, string>
  titulosEditados: Record<string, string>
  removidas: Record<string, true>
  realocacoes: Record<string, { de: Data; para: Data }>
  extensoes: Record<number, number> // semana -> dias a mais
  historicoExtensoes: number[]
  dominio: Record<string, Nivel>
  prazosNovos: Evento[]
  leiturasNovas: Leitura[]
  prioritarias: Record<string, boolean>
  trabalho: { tarefas: TarefaTrabalho[]; notas: string }
  ultimoBackup?: string
}
