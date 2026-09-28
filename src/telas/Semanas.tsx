import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Barra, Botao, Cartao, Janela, Tag, estiloCampo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { resumosDaSemana, rotuloStatus, statusDaSemana, type StatusSemana } from '../nucleo/calculos'
import { preverExtensao } from '../nucleo/calendario'
import { fmtDiaMes } from '../nucleo/datas'

const corStatus: Record<StatusSemana, string> = {
  pendente: 'bg-stone-100 text-tinta-2',
  andamento: 'bg-amber-100 text-amber-800',
  concluido: 'bg-destaque-claro text-destaque',
  vazia: 'bg-stone-100 text-tinta-3',
}

export function Semanas() {
  const { plano, prog, cal, itens, eventos, numeroSemanaAtual, editarMeta, estenderSemana, desfazerExtensao } = useEstudos()
  const [params] = useSearchParams()
  const pedida = Number(params.get('semana'))
  const [abertas, setAbertas] = useState<Record<number, boolean>>(() => ({ [numeroSemanaAtual]: true, ...(pedida ? { [pedida]: true } : {}) }))
  const [editandoMeta, setEditandoMeta] = useState<string | null>(null)
  const [estender, setEstender] = useState<number | null>(null)
  const [dias, setDias] = useState(1)
  const alvo = useRef<HTMLDivElement | null>(null)

  // Link ?semana=5 abre e rola até a semana
  useEffect(() => {
    if (pedida) {
      setAbertas((a) => ({ ...a, [pedida]: true }))
      setTimeout(() => alvo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }, [pedida])

  const semanas = cal.filter((s) => s.n >= plano.primeiraSemanaVisivel)
  const previsao = estender ? preverExtensao(plano, prog.extensoes, estender, dias, eventos) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Semanas</h1>
        {prog.historicoExtensoes.length > 0 && <Botao onClick={desfazerExtensao}>↺ Desfazer última extensão</Botao>}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {semanas.map((s) => {
          const resumos = resumosDaSemana(plano, itens, s.n)
          const status = statusDaSemana(resumos)
          const validos = resumos.filter((r) => r.total > 0)
          const feitas = validos.filter((r) => r.concluida).length
          const aberta = !!abertas[s.n]
          const daSemana = eventos.filter((e) => e.data >= s.inicio && e.data <= s.fim).sort((a, b) => a.data.localeCompare(b.data))
          return (
            <div key={s.n} id={`semana-${s.n}`} ref={s.n === pedida ? alvo : undefined} className="scroll-mt-16">
              <Cartao className={s.n === numeroSemanaAtual ? 'border-destaque' : ''}>
                <button className="flex w-full items-center justify-between gap-2 text-left" aria-expanded={aberta} onClick={() => setAbertas({ ...abertas, [s.n]: !aberta })}>
                  <div>
                    <p className="font-semibold">Semana {s.n}{s.n === numeroSemanaAtual && <span className="ml-2 text-xs font-medium text-destaque">atual</span>}</p>
                    <p className="text-xs text-tinta-3">{fmtDiaMes(s.inicio)} a {fmtDiaMes(s.fim)}{s.extra > 0 && ` · +${s.extra} dia${s.extra > 1 ? 's' : ''}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {validos.length > 0 && <span className="text-sm font-medium text-tinta-2">{feitas}/{validos.length}</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${corStatus[status]}`}>{rotuloStatus[status]}</span>
                    <span aria-hidden className="text-tinta-3">{aberta ? '▲' : '▼'}</span>
                  </div>
                </button>

                {aberta && (
                  <div className="mt-3 space-y-3 border-t border-linha pt-3">
                    {daSemana.length > 0 && (
                      <ul className="space-y-1 rounded-xl bg-stone-50 p-3 text-xs">
                        {daSemana.map((e) => (
                          <li key={e.id} className="flex flex-wrap items-center gap-2"><span className="font-medium">{fmtDiaMes(e.data)}</span><Tag id={e.disciplinaId} /><span>{e.titulo}</span></li>
                        ))}
                      </ul>
                    )}
                    {resumos.length === 0 && <p className="text-sm text-tinta-2">Sem metas nesta semana.</p>}
                    <ul className="space-y-3">
                      {resumos.map((r) => {
                        const texto = prog.metasEditadas[r.meta.id] ?? r.meta.titulo
                        return (
                          <li key={r.meta.id}>
                            <div className="flex items-start justify-between gap-2">
                              {editandoMeta === r.meta.id ? (
                                <input autoFocus className={estiloCampo} defaultValue={texto} aria-label="Editar texto da meta"
                                  onBlur={(e) => { editarMeta(r.meta.id, e.target.value); setEditandoMeta(null) }}
                                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
                              ) : (
                                <div className="min-w-0">
                                  <p className={`text-sm ${r.concluida ? 'text-tinta-3 line-through' : ''}`}>{r.concluida && '✓ '}{texto}</p>
                                  <div className="mt-0.5 flex items-center gap-2 text-xs text-tinta-3"><Tag id={r.meta.disciplinaId} /></div>
                                </div>
                              )}
                              <div className="flex shrink-0 items-center gap-1">
                                <button className="rounded-lg px-2 py-1 text-tinta-3 hover:bg-stone-100" onClick={() => setEditandoMeta(r.meta.id)} aria-label="Editar meta">✏️</button>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-3">
                              <Barra valor={r.total ? (r.feitas / r.total) * 100 : 0} className="!h-1.5" />
                              {r.concluida ? <span className="shrink-0 text-xs font-medium text-destaque">Concluída</span> : (
                                <Link to={`/rotina?dia=${r.proxima?.dataEfetiva ?? s.inicio}`} className="shrink-0 text-xs font-medium text-destaque">{r.feitas}/{r.total} tarefas →</Link>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex justify-end"><Botao onClick={() => { setEstender(s.n); setDias(1) }}>Preciso de mais dias</Botao></div>
                  </div>
                )}
              </Cartao>
            </div>
          )
        })}
      </div>

      <Janela aberto={estender !== null} titulo={`Estender a semana ${estender ?? ''}`} onFechar={() => setEstender(null)}>
        <p className="mb-3 text-sm text-tinta-2">A semana ganha dias e as seguintes são empurradas. Provas e entregas continuam nas datas reais.</p>
        <label className="mb-3 block text-sm font-medium">Quantos dias a mais?
          <select className={`${estiloCampo} mt-1`} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} dia{n > 1 ? 's' : ''}</option>)}
          </select>
        </label>
        {previsao && (
          <div className="mb-4 space-y-2 rounded-xl bg-stone-50 p-3 text-sm">
            <p>O plano vai terminar em <strong>{fmtDiaMes(previsao.fimNovo)}</strong>.</p>
            {previsao.diasAlemDoFim > 0 && (
              <p className="font-medium text-amber-800">⚠️ Isso passa {previsao.diasAlemDoFim} dia{previsao.diasAlemDoFim > 1 ? 's' : ''} da data final ({fmtDiaMes(plano.fim)}).</p>
            )}
            {previsao.eventosAfetados.length > 0 && (
              <div className="font-medium text-amber-800">
                <p>⚠️ Tarefas de preparação ficariam depois da data de:</p>
                <ul className="ml-4 list-disc">{previsao.eventosAfetados.map((e) => <li key={e.id}>{e.titulo} ({fmtDiaMes(e.data)})</li>)}</ul>
              </div>
            )}
            {previsao.diasAlemDoFim === 0 && previsao.eventosAfetados.length === 0 && <p className="text-destaque">Sem conflitos com a data final nem com provas.</p>}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Botao onClick={() => setEstender(null)}>Cancelar</Botao>
          <Botao variante="principal" onClick={() => { if (estender) estenderSemana(estender, dias); setEstender(null) }}>Confirmar</Botao>
        </div>
      </Janela>
    </div>
  )
}
