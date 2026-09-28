// Dashboard: % concluída por semana, com Tarefas e Leituras em séries separadas.
import { useEffect, useRef, useState } from 'react'
import { Botao, Cartao, Titulo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { estatisticasPorSemana, type PontoSemana } from '../nucleo/calculos'
import { fmtDiaMes } from '../nucleo/datas'

// Duas cores validadas (diferença clara mesmo para daltonismo): azul = tarefas, laranja = leituras.
const estilo = `
.viz { --serie-1:#2a78d6; --serie-2:#eb6834; --grade:#e7e2db; --eixo:#78716c; --superficie:#ffffff; }
`
const COLUNA_MIN = 56
const COLUNA_MAX = 110
const ALT = 260
const M = { topo: 12, base: 34, esq: 40, dir: 8 }
const LARG_BARRA = 20
const FOLGA = 2 // espaço de 2px entre as barras

export function Dashboard() {
  const { plano, cal, itens, numeroSemanaAtual } = useEstudos()
  const [tabela, setTabela] = useState(false)
  const [foco, setFoco] = useState<number | null>(null)
  // A largura do gráfico acompanha o cartão (no celular, rola para o lado se não couber).
  const caixa = useRef<HTMLDivElement>(null)
  const [larguraCaixa, setLarguraCaixa] = useState(0)
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const ler = () => setLarguraCaixa(el.clientWidth)
    ler()
    const obs = new ResizeObserver(ler)
    obs.observe(el)
    return () => obs.disconnect()
  }, [tabela])

  const pontos = estatisticasPorSemana(plano, itens, (s) => `S${s}`)
  const soma = pontos.reduce((a, p) => ({
    tf: a.tf + p.tarefasFeitas, tt: a.tt + p.tarefasTotal, lf: a.lf + p.leiturasFeitas, lt: a.lt + p.leiturasTotal,
  }), { tf: 0, tt: 0, lf: 0, lt: 0 })
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
  const atual = pontos.find((p) => p.semana === numeroSemanaAtual)

  const LARG_COLUNA = Math.min(COLUNA_MAX, Math.max(COLUNA_MIN, (larguraCaixa - M.esq - M.dir) / Math.max(1, pontos.length)))
  const largura = M.esq + M.dir + pontos.length * LARG_COLUNA
  const alturaUtil = ALT - M.topo - M.base
  const y = (v: number) => M.topo + alturaUtil * (1 - v / 100)
  const xColuna = (i: number) => M.esq + i * LARG_COLUNA

  // barra com o topo arredondado (4px) e a base reta, colada na linha de base
  const barra = (x: number, v: number) => {
    const h = Math.max(0, (alturaUtil * v) / 100)
    if (h <= 0) return ''
    const r = Math.min(4, h)
    const topo = y(v)
    return `M${x},${topo + h} V${topo + r} Q${x},${topo} ${x + r},${topo} H${x + LARG_BARRA - r} Q${x + LARG_BARRA},${topo} ${x + LARG_BARRA},${topo + r} V${topo + h} Z`
  }

  const semanaDe = (p: PontoSemana) => cal[p.semana - 1]

  return (
    <div className="space-y-4">
      <style>{estilo}</style>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Botao onClick={() => setTabela(!tabela)}>{tabela ? '📊 Ver gráfico' : '🔢 Ver como tabela'}</Botao>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Resumo rotulo="Tarefas concluídas" valor={`${pct(soma.tf, soma.tt)}%`} sub={`${soma.tf} de ${soma.tt}`} cor="var(--serie-1)" />
        <Resumo rotulo="Leituras concluídas" valor={`${pct(soma.lf, soma.lt)}%`} sub={`${soma.lf} de ${soma.lt}`} cor="var(--serie-2)" />
        <Resumo rotulo={`Tarefas na semana ${numeroSemanaAtual}`} valor={atual?.pctTarefas != null ? `${atual.pctTarefas}%` : '—'} sub={atual ? `${atual.tarefasFeitas} de ${atual.tarefasTotal}` : 'sem tarefas'} cor="var(--serie-1)" />
        <Resumo rotulo={`Leituras na semana ${numeroSemanaAtual}`} valor={atual?.pctLeituras != null ? `${atual.pctLeituras}%` : '—'} sub={atual ? `${atual.leiturasFeitas} de ${atual.leiturasTotal}` : 'sem leituras'} cor="var(--serie-2)" />
      </div>

      <Cartao className="viz">
        <Titulo>Porcentagem concluída por semana</Titulo>
        <p className="mb-3 text-xs text-tinta-3">Tarefas (trabalhos, intercâmbio, TCC, estudo para provas e extras) e leituras de atividades (seminários, debates, apresentações) são contadas separadamente. As leituras rápidas de aula ficam de fora.</p>

        {/* Legenda: sempre presente com 2 séries */}
        <div className="mb-3 flex flex-wrap gap-4 text-sm" aria-hidden={tabela}>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: 'var(--serie-1)' }} />Tarefas</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: 'var(--serie-2)' }} />Leituras</span>
        </div>

        {pontos.length === 0 ? <p className="text-sm text-tinta-2">Ainda não há semanas com tarefas.</p> : tabela ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-96 text-left text-sm">
              <caption className="sr-only">Porcentagem concluída por semana</caption>
              <thead><tr className="border-b border-linha text-xs text-tinta-3">
                <th className="py-2 pr-3 font-medium">Semana</th><th className="py-2 pr-3 font-medium">Tarefas</th><th className="py-2 font-medium">Leituras</th>
              </tr></thead>
              <tbody>
                {pontos.map((p) => {
                  const s = semanaDe(p)
                  return (
                    <tr key={p.semana} className="border-b border-linha last:border-0">
                      <td className="py-2 pr-3">Semana {p.semana} <span className="text-xs text-tinta-3">({fmtDiaMes(s.inicio)})</span></td>
                      <td className="py-2 pr-3">{p.pctTarefas != null ? `${p.pctTarefas}% (${p.tarefasFeitas}/${p.tarefasTotal})` : '—'}</td>
                      <td className="py-2">{p.pctLeituras != null ? `${p.pctLeituras}% (${p.leiturasFeitas}/${p.leiturasTotal})` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto" ref={caixa}>
            <div className="relative" style={{ width: largura }}>
              <svg viewBox={`0 0 ${largura} ${ALT}`} width={largura} height={ALT} role="img"
                aria-label="Gráfico de colunas: porcentagem de tarefas e de leituras concluídas em cada semana" className="block max-w-none">
                {/* grade recessiva */}
                {[0, 25, 50, 75, 100].map((v) => (
                  <g key={v}>
                    <line x1={M.esq} x2={largura - M.dir} y1={y(v)} y2={y(v)} stroke="var(--grade)" strokeWidth={1} />
                    <text x={M.esq - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--eixo)">{v}%</text>
                  </g>
                ))}
                {pontos.map((p, i) => {
                  const x0 = xColuna(i)
                  const centro = x0 + LARG_COLUNA / 2
                  const xt = centro - LARG_BARRA - FOLGA / 2
                  const xl = centro + FOLGA / 2
                  const atualSemana = p.semana === numeroSemanaAtual
                  return (
                    <g key={p.semana}>
                      {atualSemana && <rect x={x0 + 2} y={M.topo} width={LARG_COLUNA - 4} height={alturaUtil} rx={6} fill="#0f766e" opacity={0.07} />}
                      {p.pctTarefas != null && <path d={barra(xt, p.pctTarefas)} fill="var(--serie-1)" />}
                      {p.pctLeituras != null && <path d={barra(xl, p.pctLeituras)} fill="var(--serie-2)" />}
                      {/* valor só na semana atual (rótulo seletivo) */}
                      {atualSemana && p.pctTarefas != null && <text x={xt + LARG_BARRA / 2} y={y(p.pctTarefas) - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1c1917">{p.pctTarefas}</text>}
                      {atualSemana && p.pctLeituras != null && <text x={xl + LARG_BARRA / 2} y={y(p.pctLeituras) - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1c1917">{p.pctLeituras}</text>}
                      <text x={centro} y={ALT - 16} textAnchor="middle" fontSize={12} fontWeight={atualSemana ? 700 : 400} fill={atualSemana ? '#1c1917' : 'var(--eixo)'}>{p.rotulo}</text>
                      <text x={centro} y={ALT - 3} textAnchor="middle" fontSize={9.5} fill="var(--eixo)">{fmtDiaMes(semanaDe(p).inicio)}</text>
                      {/* área de toque grande para o tooltip */}
                      <rect x={x0} y={0} width={LARG_COLUNA} height={ALT} fill="transparent" tabIndex={0}
                        aria-label={`Semana ${p.semana}: tarefas ${p.pctTarefas ?? 'sem'}%, leituras ${p.pctLeituras ?? 'sem'}%`}
                        onMouseEnter={() => setFoco(i)} onMouseLeave={() => setFoco(null)} onFocus={() => setFoco(i)} onBlur={() => setFoco(null)}
                        onClick={() => setFoco(foco === i ? null : i)} />
                    </g>
                  )
                })}
                {/* linha de base */}
                <line x1={M.esq} x2={largura - M.dir} y1={y(0)} y2={y(0)} stroke="var(--eixo)" strokeWidth={1} />
              </svg>
              {foco !== null && pontos[foco] && (
                <div className="pointer-events-none absolute z-10 w-48 rounded-lg border border-linha bg-white p-2.5 text-xs shadow-lg"
                  style={{ left: Math.min(Math.max(xColuna(foco) + LARG_COLUNA / 2 - 96, 0), largura - 192), top: 0 }}>
                  <p className="mb-1 font-semibold">Semana {pontos[foco].semana} · {fmtDiaMes(semanaDe(pontos[foco]).inicio)}</p>
                  <p className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--serie-1)' }} />Tarefas: <strong>{pontos[foco].pctTarefas != null ? `${pontos[foco].pctTarefas}%` : '—'}</strong>
                    {pontos[foco].tarefasTotal > 0 && <span className="text-tinta-3">({pontos[foco].tarefasFeitas}/{pontos[foco].tarefasTotal})</span>}</p>
                  <p className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--serie-2)' }} />Leituras: <strong>{pontos[foco].pctLeituras != null ? `${pontos[foco].pctLeituras}%` : '—'}</strong>
                    {pontos[foco].leiturasTotal > 0 && <span className="text-tinta-3">({pontos[foco].leiturasFeitas}/{pontos[foco].leiturasTotal})</span>}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Cartao>
    </div>
  )
}

function Resumo({ rotulo, valor, sub, cor }: { rotulo: string; valor: string; sub: string; cor: string }) {
  return (
    <Cartao className="!p-3">
      <p className="flex items-center gap-2 text-xs text-tinta-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: cor }} />{rotulo}</p>
      <p className="mt-1 text-2xl font-bold">{valor}</p>
      <p className="text-xs text-tinta-3">{sub}</p>
    </Cartao>
  )
}
