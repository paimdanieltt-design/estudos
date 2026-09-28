// DADOS ORIGINAIS DO SEMESTRE 2026.2, digitados a partir dos planos de ensino
// (PDF/DOCX) e das informações passadas por você. Este arquivo NÃO é lido pelo app:
// o script `npm run plano` transforma tudo em `plano.json`.
import type { Compromisso, Disciplina, Evento, Fase, Leitura, Topico } from '../nucleo/tipos'

export const INICIO = '2026-08-10' // segunda-feira da semana 1 do semestre
export const FIM = '2026-12-14' // último dia de aula
export const TOTAL_SEMANAS = 19
export const PRIMEIRA_SEMANA_VISIVEL = 8 // o app começa em 28/09 (semana 8)
export const DIA_INICIAL_APP = '2026-09-28'

export const disciplinas: Disciplina[] = [
  { id: 'dpp', nome: 'Democracia e Políticas Públicas', curto: 'Democracia', cor: '#2563eb', horario: 'Ter e Qui, 20h50', professor: 'Luiz Fernando Bessa' },
  { id: 'etica', nome: 'Ética e Política', curto: 'Ética', cor: '#7c3aed', horario: 'Sex, 19h', professor: 'Michel Oliveira' },
  { id: 'hb1', nome: 'História do Brasil 1', curto: 'História', cor: '#c2410c', horario: 'Seg e Qua, 20h50', professor: 'André Honor' },
  { id: 'mqapp', nome: 'Métodos Quantitativos Aplicados às Políticas Públicas', curto: 'Métodos', cor: '#15803d', horario: 'Ter e Qui, 19h', professor: 'Robert Vidigal' },
  { id: 'pdpp', nome: 'Processo Decisório e Políticas Públicas', curto: 'Processo Decisório', cor: '#a21caf', horario: 'Seg e Qua, 19h', professor: 'Suylan Midlej' },
  { id: 'tcc', nome: 'TCC (pré-projeto)', curto: 'TCC', cor: '#475569', horario: '', projeto: true },
  { id: 'inter', nome: 'Intercâmbio (Temple)', curto: 'Intercâmbio', cor: '#0e7490', horario: '', projeto: true },
]

export const fases: Fase[] = [
  { de: 8, ate: 10, nome: 'Candidatura do intercâmbio e leituras' },
  { de: 11, ate: 12, nome: 'Anteprojeto, debates e Prova 3' },
  { de: 13, ate: 15, nome: 'Trabalhos e provas de novembro' },
  { de: 16, ate: 19, nome: 'Reta final' },
]

// Compromissos fixos (só informativos: aparecem na Rotina, não contam como tarefa).
export const compromissos: Compromisso[] = [
  { dow: [1, 2, 3, 4], hora: '08:00', titulo: 'Aula de inglês' },
  { dow: [0, 1, 2, 3, 4], hora: '09:00–18:00', titulo: 'Trabalho — Volpatti Advogados' },
  { dow: [0, 2], hora: '19:00–20:40', titulo: 'Processo Decisório e Políticas Públicas', disciplinaId: 'pdpp', ate: '2026-12-14', semAula: ['2026-10-12', '2026-10-28', '2026-11-02'] },
  { dow: [0, 2], hora: '20:50–22:30', titulo: 'História do Brasil 1', disciplinaId: 'hb1', ate: '2026-12-14', semAula: ['2026-10-05', '2026-10-07', '2026-10-12', '2026-10-26', '2026-10-28', '2026-11-02'] },
  { dow: [1, 3], hora: '19:00–20:40', titulo: 'Métodos Quantitativos', disciplinaId: 'mqapp', ate: '2026-12-08', semAula: ['2026-09-29', '2026-10-01'] },
  { dow: [1, 3], hora: '20:50–22:30', titulo: 'Democracia e Políticas Públicas', disciplinaId: 'dpp', ate: '2026-11-19' },
  { dow: [4], hora: '19:00–22:00', titulo: 'Ética e Política', disciplinaId: 'etica', ate: '2026-11-27', semAula: ['2026-11-20'] },
]

// ---------------------------------------------------------------- LEITURAS
// Só leituras com prazo depois de hoje (28/09). Prazo = dia da aula.
const L = (id: string, disciplinaId: string, prazo: string, minutos: number, titulo: string, prioritaria = false): Leitura => ({
  id: `l-${id}`, disciplinaId, prazo, minutos, titulo, ...(prioritaria ? { prioritaria } : {}),
})

// Leituras ligadas a ATIVIDADES (seminário, debate, apresentação, atividade assíncrona) têm tempo reservado.
// Todas as outras são leituras de aula: rápidas, sem tempo reservado e sem cobrança de atraso.
const LEITURAS_DE_ATIVIDADE = new Set(['l-dpp-fraser1', 'l-dpp-fraser2', 'l-etica-foucault', 'l-mq-america'])

const leiturasBrutas: Leitura[] = [
  // Ética e Política (sexta)
  L('etica-weber', 'etica', '2026-10-02', 60, 'WEBER. A política como vocação (penúltima e última parte)'),
  L('etica-arendt', 'etica', '2026-10-09', 90, 'ARENDT. O que é política? (cap. 1 a 3) e Sobre a violência (cap. 2)'),
  L('etica-habermas', 'etica', '2026-10-16', 60, 'HABERMAS. Para o uso pragmático, ético e moral da razão prática'),
  L('etica-rawls', 'etica', '2026-10-23', 90, 'RAWLS. Uma Teoria da Justiça — Primeira Parte (cap. 1 a 3)'),
  L('etica-foucault', 'etica', '2026-10-30', 60, 'FOUCAULT. Ética, sexualidade, política, vol. V (tema do meu debate)', true),
  L('etica-pateman', 'etica', '2026-11-06', 60, 'PATEMAN. O contrato sexual (cap. 1 e 2)'),
  L('etica-mills', 'etica', '2026-11-13', 60, 'MILLS. The Racial Contract (Introdução e cap. 1) — em inglês'),
  // Democracia e Políticas Públicas (ter/qui)
  L('dpp-ramesh', 'dpp', '2026-09-29', 30, 'RAMESH; HOWLETT. Policy capacity (p. 165-171)'),
  L('dpp-gomide', 'dpp', '2026-09-29', 45, 'GOMIDE; PIRES. Capacidades estatais e democracia (p. 15-28)'),
  L('dpp-loureiro', 'dpp', '2026-09-29', 45, 'LOUREIRO et al. Democracia, arenas decisórias e políticas públicas (Minha Casa Minha Vida)'),
  L('dpp-tarrago', 'dpp', '2026-10-01', 45, 'TARRAGÓ; BRUGUÉ; CARDOSO JR. A administração pública deliberativa'),
  L('dpp-gaulejac', 'dpp', '2026-10-01', 45, 'GAULEJAC. Gestão como doença social (até a p. 37)'),
  L('dpp-dagnino', 'dpp', '2026-10-06', 45, 'DAGNINO. Sociedade civil, participação e cidadania: de que estamos falando?'),
  L('dpp-tatagiba', 'dpp', '2026-10-06', 45, 'TATAGIBA; ABERS; SILVA. Movimentos sociais e políticas públicas'),
  L('dpp-fraser1', 'dpp', '2026-10-13', 60, 'FRASER. Justiça anormal (apresentação do meu Grupo 7)', true),
  L('dpp-fraser2', 'dpp', '2026-10-13', 60, 'FRASER. Rethinking the public sphere — em inglês (Grupo 7)', true),
  L('dpp-phillips', 'dpp', '2026-10-15', 45, 'PHILLIPS. Da desigualdade à diferença: um caso grave de deslocamento?'),
  L('dpp-theodoro', 'dpp', '2026-10-15', 30, 'THEODORO. As relações raciais, o racismo e as políticas públicas'),
  L('dpp-gonzalez', 'dpp', '2026-10-15', 30, 'GONZALEZ. A categoria político-cultural de amefricanidade (p. 69-82)'),
  L('dpp-crenshaw', 'dpp', '2026-10-15', 20, 'Vídeo: CRENSHAW. A urgência da interseccionalidade (TED)'),
  L('dpp-manin', 'dpp', '2026-10-20', 45, 'MANIN; PRZEWORSKI; STOKES. Eleições e representação'),
  L('dpp-lavalle', 'dpp', '2026-10-20', 45, 'LAVALLE; VERA. A trama da crítica democrática'),
  L('dpp-cohen', 'dpp', '2026-10-27', 30, 'COHEN; FUNG. Democracia radical (p. 221-237)'),
  L('dpp-borba', 'dpp', '2026-10-27', 30, 'BORBA; LÜCHMANN. A representação política nos Conselhos Gestores'),
  L('dpp-dowbor', 'dpp', '2026-10-29', 45, 'DOWBOR; CARLOS; ALBUQUERQUE. As origens movimentistas de políticas públicas'),
  L('dpp-abers', 'dpp', '2026-10-29', 45, 'ABERS; SERAFIM; TATAGIBA. Repertórios de interação Estado-sociedade'),
  // Métodos Quantitativos (Gravetter & Wallnau)
  L('mq-c8', 'mqapp', '2026-10-06', 75, 'Gravetter & Wallnau, cap. 8 — Testes de hipóteses'),
  L('mq-c9', 'mqapp', '2026-10-08', 75, 'Gravetter & Wallnau, cap. 9 — Introdução aos testes t'),
  L('mq-c10', 'mqapp', '2026-10-13', 75, 'Gravetter & Wallnau, cap. 10 (exceto p. 314-315) — Intervalos de confiança e testes t'),
  L('mq-c11', 'mqapp', '2026-10-20', 75, 'Gravetter & Wallnau, cap. 11 — Testes t para amostras relacionadas'),
  L('mq-america', 'mqapp', '2026-10-22', 45, 'Atividade assíncrona: AmericasBarometer 2026 (USP)'),
  L('mq-c15', 'mqapp', '2026-11-03', 75, 'Gravetter & Wallnau, cap. 15 (exceto seção 15.5) — Correlação'),
  L('mq-c16', 'mqapp', '2026-11-10', 60, 'Gravetter & Wallnau, cap. 16 (p. 529-537, 544-545 e 551-552) — Regressão'),
  // Processo Decisório (seg/qua)
  L('pd-capella2', 'pdpp', '2026-09-30', 30, 'CAPELLA (2018) p. 71-74 e ROSA et al. (2021) p. 55-58 — Atividade 8'),
  L('pd-capella3', 'pdpp', '2026-10-05', 60, 'CAPELLA (2018) p. 74-98 — Instrumentos de políticas públicas (Atividade 9)'),
  L('pd-halpern', 'pdpp', '2026-10-07', 45, 'HALPERN et al. (2021) p. 31-38 — Abordagens dos instrumentos da ação pública'),
  L('pd-rosa23', 'pdpp', '2026-10-14', 45, 'ROSA et al. (2021) p. 23-37 — Atividade 10'),
  L('pd-salvador', 'pdpp', '2026-10-19', 75, 'SALVADOR (2010) e INESC (2017) Cartilha Orçamento e Direitos — Atividade 11'),
  L('pd-soares', 'pdpp', '2026-10-21', 75, 'SOARES; MACHADO (2018) p. 71-112 — Federalismo (Atividade 12)'),
  L('pd-pnrh', 'pdpp', '2026-10-26', 45, 'Política Nacional de Recursos Hídricos (itens para discussão em sala)'),
  L('pd-bonotto', 'pdpp', '2026-11-04', 45, 'BONOTTO et al. (2018) — A sustentabilidade como um wicked problem (Atividade 13)'),
  // História do Brasil 1
  L('hb-russel', 'hb1', '2026-09-30', 60, 'RUSSEL-WOOD (2005) Escravos e libertos no Brasil colonial (p. 53-81)'),
  L('hb-pimentel', 'hb1', '2026-10-14', 60, 'PIMENTEL (1995) Viagem ao fundo das consciências (p. 161-194)'),
  L('hb-borges', 'hb1', '2026-10-19', 60, 'BORGES (2005) Escravos e libertos nas irmandades do Rosário (p. 43-77)'),
  L('hb-pares', 'hb1', '2026-10-21', 45, 'PARÉS (2018) A formação do Candomblé (p. 101-124)'),
  L('hb-vainfas1', 'hb1', '2026-11-11', 60, 'VAINFAS (2010) Trópico dos pecados (p. 147-189)'),
  L('hb-braz', 'hb1', '2026-11-16', 60, 'BRAZ (2018) Baltasar da Lomba (monografia sobre sodomia e Inquisição)'),
  L('hb-franco', 'hb1', '2026-11-18', 45, 'FRANCO (2016) Discriminação e abandono de recém-nascidos mestiços'),
  L('hb-vainfas2', 'hb1', '2026-11-23', 60, 'VAINFAS (2014) Tempo dos Flamengos (p. 227-265)'),
  L('hb-honor', 'hb1', '2026-11-25', 45, 'HONOR (2019) Santa Teresa e os fundadores (iconologia da pintura)'),
]

export const leituras: Leitura[] = leiturasBrutas.map((l) => ({ ...l, tipo: LEITURAS_DE_ATIVIDADE.has(l.id) ? 'atividade' : 'aula' }))

// ---------------------------------------------------------------- EVENTOS
const E = (id: string, disciplinaId: string | undefined, tipo: Evento['tipo'], data: string, titulo: string, extra: Partial<Evento> = {}): Evento => ({
  id: `e-${id}`, ...(disciplinaId ? { disciplinaId } : {}), tipo, data, titulo, ...extra,
})

export const eventos: Evento[] = [
  // Intercâmbio
  E('carta', 'inter', 'entrega', '2026-10-02', 'Carta de intenção — Temple', { detalhe: 'Prazo que você me passou: sexta 02/10.' }),
  E('passaporte', 'inter', 'pessoal', '2026-10-02', 'Renovar o passaporte', { hora: '15h40' }),
  E('duolingo', 'inter', 'prova', '2026-10-04', 'Teste Duolingo English Test', { detalhe: 'Domingo. Precisa de documento com foto, câmera e lugar silencioso.' }),
  E('candidatura', 'inter', 'entrega', '2026-10-15', 'Prazo final da candidatura — Temple'),
  // Ética
  E('etica-debate', 'etica', 'apresentacao', '2026-10-30', 'Debate do Grupo 8: Ética e mecanismos de controle', { peso: '40% (com o relatório)', detalhe: 'Todos do grupo precisam estar presentes. Falta deve ser justificada por e-mail.' }),
  E('etica-relatorio', 'etica', 'entrega', '2026-11-06', 'Relatório do debate (Grupo 8), por e-mail', { peso: '40% (com o debate)' }),
  E('etica-tema', 'etica', 'entrega', '2026-11-13', 'Entrega do tema da prova escrita'),
  E('etica-prova', 'etica', 'entrega', '2026-11-20', 'Prova escrita (por e-mail até 23h)', { hora: '23h', peso: '60%', detalhe: '4 a 6 laudas, Times New Roman 12, espaçamento 1,5. Nome do arquivo: nome completo.' }),
  // Democracia
  E('dpp-g7', 'dpp', 'apresentacao', '2026-10-13', 'Apresentação do Grupo 7 (Fraser)', { peso: '25% (apresentações em grupo)', detalhe: 'Entregar resenha crítica (mín. 2 páginas) ou o PowerPoint.' }),
  E('dpp-ante', 'dpp', 'entrega', '2026-10-27', 'Anteprojeto de pesquisa-ação (3 a 4 páginas)', { peso: '20%' }),
  E('dpp-proj', 'dpp', 'entrega', '2026-11-17', 'Projeto de pesquisa-ação (15-18 págs.) e apresentação', { peso: '30% + 10%', detalhe: 'Apresentação e entrega em 17 ou 19/11 (confirmar o dia do grupo).' }),
  // Métodos
  E('mq-l3', 'mqapp', 'entrega', '2026-10-27', 'Lista de exercícios 3', { peso: '5 pontos', detalhe: 'Entregar no início da aula.' }),
  E('mq-p3', 'mqapp', 'prova', '2026-10-29', 'Prova da Unidade 3', { peso: '20 pontos', detalhe: 'Múltipla escolha. Pode 1 folha A4 (frente e verso) e calculadora simples.' }),
  E('mq-l4', 'mqapp', 'entrega', '2026-11-24', 'Lista de exercícios 4', { peso: '5 pontos' }),
  E('mq-p4', 'mqapp', 'prova', '2026-11-26', 'Prova da Unidade 4', { peso: '20 pontos' }),
  E('mq-final', 'mqapp', 'prova', '2026-12-03', 'Prova final (substitui a menor nota)', { detalhe: 'Cumulativa, múltipla escolha, com consulta.' }),
  E('mq-part2', 'mqapp', 'entrega', '2026-12-08', 'Exercício de participação 2 (assíncrono)'),
  // Processo Decisório
  E('pd-grupo', 'pdpp', 'entrega', '2026-10-14', 'Sinalizar o grupo do trabalho final (5 pessoas)'),
  E('pd-tema', 'pdpp', 'entrega', '2026-10-21', 'Sinalizar o tema (política pública) do trabalho final'),
  E('pd-previa', 'pdpp', 'apresentacao', '2026-11-16', 'Prévia do trabalho final', { detalhe: 'Prévias em 16, 18 ou 23/11 (confirmar o dia do grupo).' }),
  E('pd-final', 'pdpp', 'entrega', '2026-11-27', 'Trabalho final — postar no Teams', { peso: '55%' }),
  E('pd-apres', 'pdpp', 'apresentacao', '2026-11-30', 'Apresentação do trabalho final', { detalhe: 'Apresentações em 30/11, 02/12 ou 07/12.' }),
  // História do Brasil
  E('hb-revisao', 'hb1', 'entrega', '2026-11-04', 'Revisão bibliográfica (3 artigos)', { peso: '30 pontos', detalhe: 'Avaliação em 04/11 ou 09/11 (confirmar).' }),
  E('hb-planos', 'hb1', 'apresentacao', '2026-12-02', 'Apresentação dos planos de aula', { peso: '35 pontos (2 planos)', detalhe: 'Apresentações em 02/12 e 07/12. Plano só expositivo é zerado.' }),
  E('hb-prova', 'hb1', 'prova', '2026-12-09', 'Prova escrita', { peso: '35 pontos', detalhe: 'Sem consulta aos textos; 30 min iniciais com anotações. Todos os eixos.' }),
  // TCC (marcos que você mesmo se dá — ajuste quando quiser)
  E('tcc-linha', 'tcc', 'pessoal', '2026-10-30', 'Escolher a linha de pesquisa do TCC'),
  E('tcc-refs', 'tcc', 'pessoal', '2026-11-20', 'Ler 3 a 5 referências centrais do TCC'),
  E('tcc-esq', 'tcc', 'pessoal', '2026-12-14', 'Esqueleto do pré-projeto do TCC'),
]

// ---------------------------------------------------------------- TRABALHOS
// Cada bloco vira uma tarefa, espalhada entre `de` e `ate` (inclusive).
// Formato de bloco: [texto, minutos]
export interface Trabalho {
  id: string
  disciplinaId: string
  titulo: string // vira o texto da meta da semana
  eventoId?: string
  de: string
  ate: string
  blocos: [string, number][]
}

export interface Fixo {
  id: string
  trabalhoId: string
  disciplinaId: string
  titulo: string
  data: string
  minutos: number
  hora?: string
  eventoId?: string
  consomeCapacidade: boolean
}

export const trabalhos: Trabalho[] = [
  // ---- Intercâmbio
  { id: 'carta', disciplinaId: 'inter', titulo: 'Carta de intenção da Temple', eventoId: 'e-carta', de: '2026-09-28', ate: '2026-10-01', blocos: [
    ['Rascunhar a carta de intenção (por que Temple, por que Ciência Política)', 60],
    ['Revisar a carta: conteúdo, clareza e inglês', 45],
    ['Finalizar e salvar a versão final da carta', 30],
  ] },
  { id: 'duo-prep', disciplinaId: 'inter', titulo: 'Preparar o teste Duolingo', eventoId: 'e-duolingo', de: '2026-10-02', ate: '2026-10-03', blocos: [
    ['Preparar o teste: documento com foto, câmera, internet e lugar silencioso', 20],
  ] },
  { id: 'candidatura', disciplinaId: 'inter', titulo: 'Fechar a candidatura da Temple', eventoId: 'e-candidatura', de: '2026-10-05', ate: '2026-10-14', blocos: [
    ['Conferir a lista de documentos exigidos pela Temple', 30],
    ['Reunir e enviar os documentos pendentes (histórico, comprovantes, cartas)', 60],
    ['Revisar a candidatura completa e enviar', 45],
  ] },
  // ---- TCC
  { id: 'tcc-linha', disciplinaId: 'tcc', titulo: 'TCC: escolher a linha de pesquisa', eventoId: 'e-tcc-linha', de: '2026-10-10', ate: '2026-10-29', blocos: [
    ['Listar 3 possíveis temas que me interessam (Ciência Política / políticas públicas)', 45],
    ['Pesquisar rapidamente o que já foi publicado sobre cada tema', 60],
    ['Conversar com um(a) professor(a) ou colega sobre os temas', 30],
    ['Escolher a linha de pesquisa e escrever a pergunta inicial', 60],
  ] },
  { id: 'tcc-refs', disciplinaId: 'tcc', titulo: 'TCC: referências centrais', eventoId: 'e-tcc-refs', de: '2026-10-31', ate: '2026-11-19', blocos: [
    ['Buscar 3 a 5 referências centrais sobre o tema', 45],
    ['Ler e fichar a referência 1', 60],
    ['Ler e fichar a referência 2', 60],
    ['Ler e fichar a referência 3', 60],
    ['Resumir o que aprendi e a lacuna que a pesquisa pode cobrir', 45],
  ] },
  { id: 'tcc-esq', disciplinaId: 'tcc', titulo: 'TCC: esqueleto do pré-projeto', eventoId: 'e-tcc-esq', de: '2026-11-28', ate: '2026-12-13', blocos: [
    ['Definir problema, pergunta e objetivos do TCC', 60],
    ['Esboçar justificativa e metodologia', 60],
    ['Montar o esqueleto do pré-projeto (tópicos)', 60],
    ['Revisar o esqueleto e listar dúvidas para conversar com orientador(a)', 45],
  ] },
  // ---- Ética
  { id: 'etica-debate', disciplinaId: 'etica', titulo: 'Debate do Grupo 8 (Ética e mecanismos de controle)', eventoId: 'e-etica-debate', de: '2026-10-12', ate: '2026-10-29', blocos: [
    ['Combinar com o grupo o recorte do debate e a divisão de falas', 30],
    ['Levantar dados e exemplos sobre ética e controle (CGU, TCU, corregedorias, LAI)', 60],
    ['Levantar dados e exemplos — segunda rodada, ligando com as leituras', 60],
    ['Montar o roteiro do debate e as perguntas para a turma', 45],
    ['Ensaiar o debate com o grupo', 30],
  ] },
  { id: 'etica-relatorio', disciplinaId: 'etica', titulo: 'Relatório do debate (Grupo 8)', eventoId: 'e-etica-relatorio', de: '2026-10-31', ate: '2026-11-05', blocos: [
    ['Escrever o relatório sobre o que foi discutido no debate', 60],
    ['Revisar e enviar o relatório por e-mail', 30],
  ] },
  { id: 'etica-tema', disciplinaId: 'etica', titulo: 'Tema da prova escrita de Ética', eventoId: 'e-etica-tema', de: '2026-11-02', ate: '2026-11-12', blocos: [
    ['Escolher o tema da prova escrita (ligado à bibliografia)', 45],
    ['Separar 3 a 4 textos da bibliografia para sustentar o tema', 60],
  ] },
  { id: 'etica-prova', disciplinaId: 'etica', titulo: 'Prova escrita de Ética (4 a 6 laudas)', eventoId: 'e-etica-prova', de: '2026-11-14', ate: '2026-11-19', blocos: [
    ['Escrever introdução e primeira parte do desenvolvimento', 90],
    ['Escrever o restante do desenvolvimento e as considerações finais', 90],
    ['Revisar formatação (Times 12, espaçamento 1,5), bibliografia e anexos', 45],
  ] },
  // ---- Democracia
  { id: 'dpp-g7', disciplinaId: 'dpp', titulo: 'Apresentação do Grupo 7 (Fraser)', eventoId: 'e-dpp-g7', de: '2026-10-07', ate: '2026-10-12', blocos: [
    ['Combinar com o Grupo 7 quem apresenta cada ponto de Fraser', 30],
    ['Montar a resenha crítica (mín. 2 páginas) ou o PowerPoint', 75],
    ['Ensaiar a apresentação e ligar com um problema atual', 45],
  ] },
  { id: 'dpp-ante', disciplinaId: 'dpp', titulo: 'Anteprojeto de pesquisa-ação', eventoId: 'e-dpp-ante', de: '2026-10-08', ate: '2026-10-26', blocos: [
    ['Definir com o grupo tema, problema e local (locus) da pesquisa-ação', 45],
    ['Escolher 3 a 4 textos da disciplina que sustentam o tema', 45],
    ['Escrever objetivos e mapear atores/parceiros', 60],
    ['Descrever a coleta (dados secundários e entrevistas) e a análise', 60],
    ['Revisar e finalizar o anteprojeto (3 a 4 páginas)', 45],
  ] },
  { id: 'dpp-proj', disciplinaId: 'dpp', titulo: 'Projeto de pesquisa-ação (15 a 18 páginas)', eventoId: 'e-dpp-proj', de: '2026-10-30', ate: '2026-11-16', blocos: [
    ['Ler o retorno do anteprojeto e dividir as seções com o grupo', 30],
    ['Escrever a introdução (contexto, problema, objetivos, justificativa)', 75],
    ['Escrever o referencial teórico', 75],
    ['Escrever os procedimentos de coleta e análise de dados', 60],
    ['Descrever a questão pública investigada', 60],
    ['Escrever a proposta de ação e os resultados esperados', 60],
    ['Revisar o texto inteiro e as referências', 60],
    ['Montar os slides e ensaiar a apresentação', 60],
  ] },
  // ---- Métodos
  { id: 'mq-l3', disciplinaId: 'mqapp', titulo: 'Lista de exercícios 3', eventoId: 'e-mq-l3', de: '2026-10-14', ate: '2026-10-26', blocos: [
    ['Lista 3: resolver as questões — parte 1 (testes de hipóteses)', 60],
    ['Lista 3: resolver as questões — parte 2 (testes t)', 60],
    ['Lista 3: conferir respostas e passar a limpo', 30],
  ] },
  { id: 'mq-p3', disciplinaId: 'mqapp', titulo: 'Estudar para a Prova 3', eventoId: 'e-mq-p3', de: '2026-10-23', ate: '2026-10-28', blocos: [
    ['Revisar a Unidade 3 e montar a folha de consulta (A4 frente e verso)', 60],
    ['Refazer exercícios da lista e exemplos das aulas', 60],
    ['Simulado: questões de múltipla escolha', 45],
  ] },
  { id: 'mq-l4', disciplinaId: 'mqapp', titulo: 'Lista de exercícios 4', eventoId: 'e-mq-l4', de: '2026-11-11', ate: '2026-11-23', blocos: [
    ['Lista 4: resolver as questões — parte 1 (correlação)', 60],
    ['Lista 4: resolver as questões — parte 2 (regressão)', 60],
    ['Lista 4: conferir respostas e passar a limpo', 30],
  ] },
  { id: 'mq-p4', disciplinaId: 'mqapp', titulo: 'Estudar para a Prova 4', eventoId: 'e-mq-p4', de: '2026-11-19', ate: '2026-11-25', blocos: [
    ['Revisar a Unidade 4 e montar a folha de consulta', 60],
    ['Praticar interpretação de regressão e correlação', 60],
    ['Simulado: questões de múltipla escolha', 45],
  ] },
  { id: 'mq-final', disciplinaId: 'mqapp', titulo: 'Estudar para a Prova final', eventoId: 'e-mq-final', de: '2026-11-30', ate: '2026-12-02', blocos: [
    ['Revisar Unidades 1 e 2 e atualizar a folha de consulta', 60],
    ['Revisar Unidades 3 e 4', 60],
    ['Simulado geral', 45],
  ] },
  { id: 'mq-part2', disciplinaId: 'mqapp', titulo: 'Exercício de participação 2', eventoId: 'e-mq-part2', de: '2026-12-05', ate: '2026-12-07', blocos: [
    ['Fazer o Exercício de participação 2 (assíncrono)', 45],
  ] },
  // ---- Processo Decisório
  { id: 'pd-grupo', disciplinaId: 'pdpp', titulo: 'Grupo do trabalho final', eventoId: 'e-pd-grupo', de: '2026-10-05', ate: '2026-10-13', blocos: [
    ['Combinar com colegas o grupo do trabalho final (5 pessoas)', 20],
  ] },
  { id: 'pd-tema', disciplinaId: 'pdpp', titulo: 'Política pública do trabalho final', eventoId: 'e-pd-tema', de: '2026-10-14', ate: '2026-10-20', blocos: [
    ['Sugerir e alinhar com o grupo a política pública que será analisada', 30],
  ] },
  { id: 'pd-previa', disciplinaId: 'pdpp', titulo: 'Trabalho final: análise e prévia', eventoId: 'e-pd-previa', de: '2026-10-27', ate: '2026-11-15', blocos: [
    ['Ler o roteiro do trabalho e dividir as tarefas no grupo', 30],
    ['Pesquisar o instrumento (lei, plano ou programa) e reunir os documentos', 60],
    ['Analisar o instrumento com base no roteiro — parte 1', 60],
    ['Analisar o instrumento com base no roteiro — parte 2', 60],
    ['Preparar a prévia do trabalho (slides curtos)', 60],
  ] },
  { id: 'pd-final', disciplinaId: 'pdpp', titulo: 'Trabalho final: versão para entregar', eventoId: 'e-pd-final', de: '2026-11-17', ate: '2026-11-26', blocos: [
    ['Ajustar o trabalho com o retorno da prévia', 60],
    ['Escrever a versão final — parte 1', 75],
    ['Escrever a versão final — parte 2', 75],
    ['Revisar e postar no Teams (até 27/11)', 45],
  ] },
  { id: 'pd-apres', disciplinaId: 'pdpp', titulo: 'Apresentação do trabalho final', eventoId: 'e-pd-apres', de: '2026-11-28', ate: '2026-11-29', blocos: [
    ['Montar os slides e ensaiar a apresentação final', 60],
  ] },
  // ---- História do Brasil
  { id: 'hb-revisao', disciplinaId: 'hb1', titulo: 'Revisão bibliográfica (3 artigos)', eventoId: 'e-hb-revisao', de: '2026-10-08', ate: '2026-11-03', blocos: [
    ['Escolher a temática livre da revisão bibliográfica', 30],
    ['Buscar 3 artigos sobre a temática (que não sejam leituras obrigatórias)', 60],
    ['Ler o artigo 1 e anotar as fontes usadas pelo autor', 60],
    ['Ler o artigo 2 e anotar as fontes usadas pelo autor', 60],
    ['Ler o artigo 3 e anotar as fontes usadas pelo autor', 60],
    ['Escrever a introdução ao tema e as fontes do artigo 1', 60],
    ['Escrever introdução e fontes dos artigos 2 e 3', 75],
    ['Escrever o texto de conexão entre os 3 artigos e revisar', 60],
  ] },
  { id: 'hb-planos', disciplinaId: 'hb1', titulo: 'Planos de aula (2)', eventoId: 'e-hb-planos', de: '2026-11-14', ate: '2026-12-01', blocos: [
    ['Escolher os 2 eixos/textos que viram planos de aula', 30],
    ['Plano de aula 1: objetivos e atividade diferenciada (não só expositiva)', 75],
    ['Plano de aula 1: revisar', 30],
    ['Plano de aula 2: objetivos e atividade diferenciada', 75],
    ['Plano de aula 2: revisar', 30],
    ['Ensaiar a apresentação dos planos', 30],
  ] },
  { id: 'hb-prova', disciplinaId: 'hb1', titulo: 'Estudar para a prova de História do Brasil 1', eventoId: 'e-hb-prova', de: '2026-12-01', ate: '2026-12-08', blocos: [
    ['Revisar eixos I e II (indígenas; política e economia)', 60],
    ['Revisar eixos III e IV (escravização; religiosidades)', 60],
    ['Revisar eixos V a VII (sociedade; arte; intérpretes do Brasil)', 60],
    ['Montar a folha de anotações (30 min de consulta)', 45],
    ['Simulado: responder questões sem consultar', 60],
  ] },
]

// Tarefas com dia e hora marcados.
export const fixos: Fixo[] = [
  { id: 'passaporte', trabalhoId: 'carta', disciplinaId: 'inter', titulo: 'Renovar o passaporte (15h40)', data: '2026-10-02', minutos: 60, hora: '15h40', eventoId: 'e-passaporte', consomeCapacidade: false },
  { id: 'duolingo', trabalhoId: 'duo-prep', disciplinaId: 'inter', titulo: 'Fazer o teste Duolingo English Test', data: '2026-10-04', minutos: 60, eventoId: 'e-duolingo', consomeCapacidade: true },
  { id: 'etica-envio', trabalhoId: 'etica-prova', disciplinaId: 'etica', titulo: 'Enviar a prova escrita por e-mail (até 23h)', data: '2026-11-20', minutos: 15, hora: 'até 23h', eventoId: 'e-etica-prova', consomeCapacidade: true },
]

// ---------------------------------------------------------------- CONTEÚDO (checklist)
const T = (disciplinaId: string, itens: string[]): Topico[] =>
  itens.map((titulo, i) => ({ id: `tp-${disciplinaId}-${i + 1}`, disciplinaId, titulo }))

export const topicos: Topico[] = [
  ...T('mqapp', ['Estatística descritiva e mensuração', 'Distribuições de frequência', 'Medidas de tendência central', 'Variabilidade', 'Probabilidade', 'Probabilidade e amostras', 'Testes de hipóteses', 'Testes t (uma amostra)', 'Intervalos de confiança', 'Testes t para duas amostras', 'Testes t para amostras relacionadas', 'Correlação', 'Regressão linear']),
  ...T('dpp', ['Conceitos de democracia (Benevides; Santos e Avritzer)', 'Problemas públicos e arenas públicas', 'Direitos sociais e gestão democrática', 'Capacidade estatal e democracia', 'Gestão deliberativa', 'Projetos políticos e sociedade civil', 'Representação, redistribuição e reconhecimento (Fraser)', 'Igualdade racial e de gênero', 'A democracia representativa e seus limites', 'Entre a participação e a deliberação', 'Práticas movimentistas e interação socioestatal', 'Pesquisa-ação']),
  ...T('etica', ['Bobbio: ética e política', 'Aristóteles: ética e política', 'Maquiavel: O príncipe', 'Kant: o que é esclarecimento', 'Montesquieu: corrupção dos princípios', 'Mill: utilitarismo', 'Weber: a política como vocação', 'Arendt: política e violência', 'Habermas: razão prática', 'Rawls: teoria da justiça', 'Foucault: ética e poder', 'Pateman: contrato sexual', 'Mills: contrato racial']),
  ...T('hb1', ['Gênero, raça e classe (Hooks; Gonzalez)', 'Indígenas e colonização', 'Política e economia na América portuguesa', 'Escravização de africanos nos trópicos', 'Religiosidades (irmandades, candomblé)', 'Sociedade: moral, sexualidade e mestiçagem', 'Domínio holandês', 'Arte na América portuguesa', 'Intérpretes do Brasil']),
  ...T('pdpp', ['A decisão política (Lindblom)', 'Tomada de decisão e modelos conceituais', 'Problema público', 'Agenda', 'Definição de alternativas', 'Instrumentos de políticas públicas', 'Grupos de interesse na formulação', 'Processo orçamentário e PPA', 'Federalismo e políticas públicas', 'Wicked problems', 'Decisão na assistência social', 'Políticas para povos indígenas']),
]
