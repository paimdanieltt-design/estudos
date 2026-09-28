// AJUSTES DE PLANEJAMENTO. Ficam por cima dos dados originais (fonte.ts) toda vez
// que o script `npm run plano` roda. Assim dá para atualizar o plano sem perder ajustes.
//
// Exemplos do que dá para fazer aqui:
//   - remarcar uma prova:            eventosRemarcados: { 'e-mq-p3': '2026-10-30' }
//   - remarcar o prazo de uma leitura: leiturasRemarcadas: { 'l-etica-mills': '2026-11-20' }
//   - dar prioridade a uma leitura:   prioridadesLeitura: ['l-dpp-fraser1']
//   - mudar o tempo livre de um dia:  capacidadePorData: { '2026-10-10': 180 }
//   - reservar tempo para uma leitura de aula: leiturasComTempo: ['l-pd-salvador']
//   - tirar um trabalho do plano:     ignorarTrabalhos: ['tcc-refs']
//   - mudar a janela de um trabalho:  janelas: { 'hb-revisao': { ate: '2026-11-01' } }
export const replanejamento = {
  eventosRemarcados: {} as Record<string, string>,
  leiturasRemarcadas: {} as Record<string, string>,
  prioridadesLeitura: [] as string[],
  // Leituras de aula são "rápidas" (sem tempo reservado). Liste aqui as que você quer que ganhem tempo no plano.
  leiturasComTempo: [] as string[],
  ignorarTrabalhos: [] as string[],
  janelas: {} as Record<string, { de?: string; ate?: string }>,
  // Minutos de estudo possíveis em dias específicos (o padrão é 75 min em dia útil e 120 min no fim de semana).
  capacidadePorData: {
    '2026-09-28': 30, // hoje: já é noite
    '2026-10-02': 30, // passaporte à tarde e aula de Ética à noite
  } as Record<string, number>,
}
