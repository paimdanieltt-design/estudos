import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Botao, Cartao, Confirmar, Realocador, Titulo, estiloCampo } from '../componentes/basicos'
import { LinhaItem } from '../componentes/LinhaItem'
import { useEstudos } from '../estado/Contexto'
import { minutosDoDia, resumosDaSemana } from '../nucleo/calculos'
import { semanaDaData } from '../nucleo/calendario'
import { diaDaSemana, fmtDiaMes, fmtLongo, fmtMinutos, nomeDiaCurto, somarDias } from '../nucleo/datas'
import type { Compromisso, Data } from '../nucleo/tipos'

/** Compromissos fixos (aula, trabalho, inglês) que acontecem naquele dia. */
function compromissosDoDia(lista: Compromisso[], dia: Data): Compromisso[] {
  const dow = diaDaSemana(dia)
  return lista.filter((c) => c.dow.includes(dow) && (!c.ate || dia <= c.ate) && !(c.semAula ?? []).includes(dia))
}

export function Rotina() {
  const { plano, prog, cal, hoje, itens, semanaAtual, adicionarExtra, removerExtra, removerTarefa, editarTitulo, realocar, desfazerRealocacao } = useEstudos()
  const [params, setParams] = useSearchParams()
  const [editando, setEditando] = useState(false)
  const [novaExtra, setNovaExtra] = useState('')
  const [remover, setRemover] = useState<{ id: string; titulo: string; meta?: string } | null>(null)

  const primeira = cal[plano.primeiraSemanaVisivel - 1]
  const ultima = cal[cal.length - 1]
  const pedido = params.get('dia')
  const valido = pedido && /^\d{4}-\d{2}-\d{2}$/.test(pedido) && pedido >= primeira.inicio && pedido <= ultima.fim
  const padrao = hoje >= primeira.inicio && hoje <= ultima.fim ? hoje : primeira.inicio
  const dia = valido ? pedido! : padrao
  const semana = semanaDaData(cal, dia) ?? semanaAtual ?? primeira
  const dias = Array.from({ length: semana.dias }, (_, k) => somarDias(semana.inicio, k))

  const irPara = (d: Data) => setParams({ dia: d }, { replace: true })
  const semAnterior = semana.n > plano.primeiraSemanaVisivel ? cal[semana.n - 2] : undefined
  const semProxima = cal[semana.n]

  const doDia = itens.filter((i) => i.dataEfetiva === dia)
  const principais = doDia.filter((i) => !i.realocadoDe)
  const recuperacao = doDia.filter((i) => i.realocadoDe)
  const minutos = minutosDoDia(itens, dia)
  const cap = diaDaSemana(dia) >= 5 ? plano.capacidade.fimDeSemana : plano.capacidade.util
  const compromissos = compromissosDoDia(plano.compromissos, dia)

  const acoesItem = (chave: string, feito: boolean, tipo: string, id: string, titulo: string, metaId?: string) => (
    <>
      {editando && tipo === 'tarefa' && (
        <Botao variante="suave" titulo="Remover do dia"
          onClick={() => setRemover({ id, titulo, meta: metaId ? (prog.metasEditadas[metaId] ?? plano.metas.find((m) => m.id === metaId)?.titulo) : undefined })}>🗑️</Botao>
      )}
      {tipo === 'extra' && <Botao titulo="Remover tarefa extra" onClick={() => removerExtra(id)}>🗑️</Botao>}
      {!feito && !editando && <Realocador rotulo="" onEscolher={(d) => realocar([chave], d)} />}
    </>
  )

  const resumos = resumosDaSemana(plano, itens, semana.n)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Rotina</h1>
        <div className="flex items-center gap-1">
          <Botao onClick={() => semAnterior && irPara(semAnterior.inicio)} desativado={!semAnterior} titulo="Semana anterior">←</Botao>
          <span className="px-2 text-sm font-medium">Semana {semana.n} · {fmtDiaMes(semana.inicio)} – {fmtDiaMes(semana.fim)}</span>
          <Botao onClick={() => semProxima && irPara(semProxima.inicio)} desativado={!semProxima} titulo="Próxima semana">→</Botao>
          {dia !== hoje && <Botao variante="principal" onClick={() => irPara(hoje)}>Voltar para hoje</Botao>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
        {/* dias da semana */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {dias.map((d) => {
            const pend = itens.filter((i) => i.dataEfetiva === d && !i.feito).length
            const tot = itens.filter((i) => i.dataEfetiva === d).length
            const ativo = d === dia
            return (
              <button key={d} onClick={() => irPara(d)} aria-current={ativo ? 'date' : undefined}
                className={`min-w-20 shrink-0 rounded-xl border px-3 py-2 text-left lg:min-w-0 ${ativo ? 'border-destaque bg-destaque-claro' : 'border-linha bg-cartao hover:bg-stone-50'}`}>
                <p className="text-xs font-medium uppercase text-tinta-3">{nomeDiaCurto(diaDaSemana(d))}{d === hoje && ' · hoje'}</p>
                <p className="text-lg font-bold leading-tight">{fmtDiaMes(d)}</p>
                <p className={`text-xs ${tot > 0 && pend === 0 ? 'text-destaque' : 'text-tinta-3'}`}>{tot === 0 ? 'livre' : pend === 0 ? '✓ tudo feito' : `${pend} pendente${pend > 1 ? 's' : ''}`}</p>
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          <Cartao>
            <Titulo direita={
              <Botao variante={editando ? 'principal' : 'suave'} onClick={() => setEditando(!editando)}>{editando ? 'Concluir edição' : '✏️ Editar dia'}</Botao>
            }>{fmtLongo(dia)}</Titulo>

            {compromissos.length > 0 && (
              <ul className="mb-3 space-y-1 rounded-xl bg-stone-50 p-3 text-xs text-tinta-2">
                {compromissos.map((c, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2"><span className="w-24 shrink-0 font-medium">{c.hora}</span><span>{c.titulo}</span></li>
                ))}
              </ul>
            )}

            {minutos > 0 && (
              <p className={`mb-2 text-xs ${minutos > cap ? 'font-medium text-amber-700' : 'text-tinta-3'}`}>
                {minutos > cap ? '⚠️ Dia carregado: ' : 'Planejado: '}{fmtMinutos(minutos)}
                {minutos > cap && <> (combinado: {fmtMinutos(cap)}). Considere realocar algo.</>}
              </p>
            )}

            {principais.length === 0 && recuperacao.length === 0 ? (
              <p className="py-4 text-sm text-tinta-2">Dia livre. Nenhuma tarefa marcada.</p>
            ) : (
              <div className="divide-y divide-linha">
                {principais.map((i) => (
                  <div key={i.chave}>
                    {editando && i.tipo === 'tarefa' ? (
                      <div className="flex items-center gap-2 py-2">
                        <input className={estiloCampo} defaultValue={i.titulo} aria-label="Editar texto da tarefa"
                          onBlur={(e) => editarTitulo(i.id, e.target.value)} />
                        {acoesItem(i.chave, i.feito, i.tipo, i.id, i.titulo, i.metaId)}
                      </div>
                    ) : (
                      <LinhaItem item={i} acoes={acoesItem(i.chave, i.feito, i.tipo, i.id, i.titulo, i.metaId)} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <form className="mt-3 flex gap-2 border-t border-linha pt-3" onSubmit={(e) => { e.preventDefault(); adicionarExtra(dia, novaExtra); setNovaExtra('') }}>
              <input className={estiloCampo} value={novaExtra} onChange={(e) => setNovaExtra(e.target.value)} placeholder="Adicionar tarefa extra neste dia" aria-label="Nova tarefa extra" />
              <Botao tipo="submit" variante="principal" desativado={!novaExtra.trim()}>Adicionar</Botao>
            </form>
          </Cartao>

          {recuperacao.length > 0 && (
            <Cartao className="border-teal-300 bg-teal-50/50">
              <Titulo>🔁 Recuperação</Titulo>
              <p className="mb-1 text-xs text-tinta-2">Coisas que você realocou para este dia. Concluir aqui conclui o item original.</p>
              <div className="divide-y divide-linha">
                {recuperacao.map((i) => (
                  <LinhaItem key={i.chave} item={i} mostrarPrazoOriginal acoes={<Botao onClick={() => desfazerRealocacao(i.chave)} titulo="Voltar para o dia original">Desfazer</Botao>} />
                ))}
              </div>
            </Cartao>
          )}

          {diaDaSemana(dia) === 4 && (
            <Cartao>
              <Titulo>✔️ Checkpoint da sexta</Titulo>
              <p className="mb-2 text-xs text-tinta-2">Como estão as metas desta semana? O que sobrar você pode realocar para o fim de semana ou para a próxima.</p>
              {resumos.length === 0 && <p className="text-sm text-tinta-2">Sem metas nesta semana.</p>}
              <ul className="space-y-1.5 text-sm">
                {resumos.map((r) => (
                  <li key={r.meta.id} className="flex items-center justify-between gap-2">
                    <span className={r.concluida ? 'text-tinta-3 line-through' : ''}>{r.concluida ? '✓' : '○'} {prog.metasEditadas[r.meta.id] ?? r.meta.titulo}</span>
                    {r.concluida ? <span className="text-xs text-destaque">Concluída</span> : (
                      <Link to={`/rotina?dia=${r.proxima?.dataEfetiva ?? dia}`} className="shrink-0 text-xs font-medium text-destaque">{r.feitas}/{r.total} →</Link>
                    )}
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>
      </div>

      <Confirmar
        aberto={!!remover} titulo="Tirar esta tarefa do dia?" botao="Remover tarefa"
        texto={<>
          <p>“{remover?.titulo}”</p>
          <p className="mt-2 font-medium">{remover?.meta ? <>Ela deixa de contar para a meta “{remover.meta}”.</> : 'Ela é uma tarefa geral e some da lista.'}</p>
          <p className="mt-1">Depois de remover, você ainda pode usar “Desfazer”.</p>
        </>}
        onCancelar={() => setRemover(null)} onConfirmar={() => { if (remover) removerTarefa(remover.id); setRemover(null) }}
      />
    </div>
  )
}
