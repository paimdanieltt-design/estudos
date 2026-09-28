import { useState } from 'react'
import { Barra, Botao, Campo, Cartao, Janela, Tag, Titulo, estiloCampo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { diasAte, progressoDoEvento } from '../nucleo/calculos'
import { fmtCurto, fmtDiaMes, fmtFaltam } from '../nucleo/datas'
import type { Evento, TipoEvento } from '../nucleo/tipos'

const rotuloTipo: Record<TipoEvento, string> = { prova: 'Prova', entrega: 'Entrega', apresentacao: 'Apresentação', pessoal: 'Pessoal' }

export function Provas() {
  const { plano, prog, hoje, itens, eventos, leituras, alternarEvento, adicionarPrazo, removerPrazoNovo } = useEstudos()
  const [aberto, setAberto] = useState(false)
  const [passados, setPassados] = useState(false)
  const [f, setF] = useState({ titulo: '', disciplinaId: '', tipo: 'entrega' as TipoEvento, data: '', peso: '' })

  const ordenados = [...eventos].sort((a, b) => a.data.localeCompare(b.data))
  const proximos = ordenados.filter((e) => e.data >= hoje)
  const antigos = ordenados.filter((e) => e.data < hoje).reverse()

  const cartao = (e: Evento) => {
    const dias = diasAte(e.data, hoje)
    const p = progressoDoEvento(e, itens, prog)
    const feito = !!prog.eventosFeitos[e.id]
    const urgente = dias >= 0 && dias <= 3 && !feito
    const preparo = itens.filter((i) => i.eventoId === e.id).sort((a, b) => a.dataEfetiva.localeCompare(b.dataEfetiva))
    const ehNovo = prog.prazosNovos.some((x) => x.id === e.id)
    // leituras da disciplina que vencem até a data do evento e ainda não foram feitas
    const leiturasAbertas = e.tipo === 'prova' && e.disciplinaId ? leituras.filter((l) => l.disciplinaId === e.disciplinaId && l.prazo <= e.data && !prog.leiturasFeitas[l.id]) : []
    return (
      <Cartao key={e.id} className={urgente ? 'border-perigo' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <Tag id={e.disciplinaId} /><span className="rounded-full bg-stone-100 px-2 py-0.5 text-tinta-2">{rotuloTipo[e.tipo]}</span>
              {e.peso && <span className="text-tinta-3">Peso: {e.peso}</span>}
            </div>
            <p className={`font-semibold leading-snug ${feito ? 'text-tinta-3 line-through' : ''}`}>{e.titulo}</p>
            <p className="text-sm text-tinta-2">{fmtCurto(e.data)}{e.hora && ` às ${e.hora}`}</p>
          </div>
          <div className={`shrink-0 text-right ${urgente ? 'text-perigo' : dias < 0 ? 'text-tinta-3' : 'text-destaque'}`}>
            <p className="text-2xl font-bold leading-none">{Math.abs(dias)}</p>
            <p className="text-xs">{dias < 0 ? 'atrás' : dias === 1 ? 'dia' : 'dias'}</p>
          </div>
        </div>
        <p className={`mt-1 text-xs font-medium ${urgente ? 'text-perigo' : 'text-tinta-3'}`}>{fmtFaltam(dias)}</p>
        {e.detalhe && <p className="mt-2 text-xs text-tinta-2">{e.detalhe}</p>}
        <div className="mt-2 flex items-center gap-3">
          <Barra valor={p.total ? (p.feitas / p.total) * 100 : 0} vermelha={urgente} />
          <span className="w-20 shrink-0 text-right text-xs text-tinta-2">{p.feitas}/{p.total}</span>
        </div>
        {(preparo.length > 0 || leiturasAbertas.length > 0) && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-destaque">O que estudar / preparar</summary>
            <ul className="mt-2 space-y-1 text-sm">
              {preparo.map((i) => (
                <li key={i.chave} className={`flex gap-2 ${i.feito ? 'text-tinta-3 line-through' : ''}`}>
                  <span>{i.feito ? '✓' : '○'}</span><span className="flex-1">{i.titulo}</span><span className="shrink-0 text-xs text-tinta-3">{fmtDiaMes(i.dataEfetiva)}</span>
                </li>
              ))}
              {leiturasAbertas.length > 0 && <li className="pt-1 text-xs font-medium text-tinta-3">Leituras da disciplina ainda não feitas:</li>}
              {leiturasAbertas.map((l) => <li key={l.id} className="flex gap-2 text-tinta-2"><span>○</span><span>{l.titulo}</span></li>)}
            </ul>
          </details>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Botao onClick={() => alternarEvento(e.id)}>{feito ? '↺ Desmarcar' : '✓ Marcar como feito'}</Botao>
          {ehNovo && <Botao onClick={() => removerPrazoNovo(e.id)}>🗑️ Remover</Botao>}
        </div>
      </Cartao>
    )
  }

  const salvar = () => {
    if (!f.titulo.trim() || !f.data) return
    adicionarPrazo({ titulo: f.titulo.trim(), disciplinaId: f.disciplinaId || undefined, tipo: f.tipo, data: f.data, peso: f.peso.trim() || undefined })
    setF({ titulo: '', disciplinaId: '', tipo: 'entrega', data: '', peso: '' })
    setAberto(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Provas e entregas</h1>
        <Botao variante="principal" onClick={() => setAberto(true)}>+ Adicionar prazo</Botao>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{proximos.map(cartao)}</div>
      {proximos.length === 0 && <Cartao><p className="text-sm text-tinta-2">Nenhum prazo pela frente.</p></Cartao>}
      {antigos.length > 0 && (
        <div>
          <Titulo direita={<Botao variante="link" onClick={() => setPassados(!passados)}>{passados ? 'Esconder' : 'Mostrar'}</Botao>}>Já passaram ({antigos.length})</Titulo>
          {passados && <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{antigos.map(cartao)}</div>}
        </div>
      )}

      <Janela aberto={aberto} titulo="Adicionar prazo" onFechar={() => setAberto(false)}>
        <Campo rotulo="O que é?"><input className={estiloCampo} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: Seminário de Ética" /></Campo>
        <Campo rotulo="Disciplina">
          <select className={estiloCampo} value={f.disciplinaId} onChange={(e) => setF({ ...f, disciplinaId: e.target.value })}>
            <option value="">Nenhuma</option>
            {plano.disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Tipo">
            <select className={estiloCampo} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoEvento })}>
              {(Object.keys(rotuloTipo) as TipoEvento[]).map((t) => <option key={t} value={t}>{rotuloTipo[t]}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Data"><input type="date" className={estiloCampo} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></Campo>
        </div>
        <Campo rotulo="Peso (opcional)"><input className={estiloCampo} value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} placeholder="Ex.: 20% ou 10 pontos" /></Campo>
        <div className="flex justify-end gap-2"><Botao onClick={() => setAberto(false)}>Cancelar</Botao><Botao variante="principal" desativado={!f.titulo.trim() || !f.data} onClick={salvar}>Salvar</Botao></div>
      </Janela>
    </div>
  )
}
