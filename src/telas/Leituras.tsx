import { useState } from 'react'
import { Notas } from '../componentes/Notas'
import { Barra, Botao, Campo, Cartao, Checkbox, Janela, Tag, Titulo, estiloCampo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { fmtCurto, fmtMinutos } from '../nucleo/datas'
import type { Leitura } from '../nucleo/tipos'

export function Leituras() {
  const { plano, prog, hoje, leituras, alternarLeitura, alternarPrioridade, adicionarLeitura, removerLeituraNova } = useEstudos()
  const [modo, setModo] = useState<'disciplina' | 'plano'>('disciplina')
  const [aberto, setAberto] = useState(false)
  const [f, setF] = useState({ titulo: '', disciplinaId: 'tcc', prazo: '', minutos: '60' })

  const feita = (l: Leitura) => !!prog.leiturasFeitas[l.id]
  const prio = (l: Leitura) => prog.prioritarias[l.id] ?? l.prioritaria ?? false
  const ordenar = (ls: Leitura[]) => [...ls].sort((a, b) => a.prazo.localeCompare(b.prazo))
  const totalFeitas = leituras.filter(feita).length

  const linha = (l: Leitura) => {
    const rapida = l.tipo === 'aula'
    const atrasada = !feita(l) && !rapida && l.prazo < hoje // leitura rápida de aula não cobra atraso
    const ehNova = prog.leiturasNovas.some((x) => x.id === l.id)
    return (
      <li key={l.id} className={`flex gap-3 rounded-lg py-2.5 ${prio(l) ? 'bg-amber-50 px-2' : ''}`}>
        <Checkbox marcado={feita(l)} onChange={() => alternarLeitura(l.id)} rotulo={`${feita(l) ? 'Desmarcar' : 'Marcar como lida'}: ${l.titulo}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-snug ${feita(l) ? 'text-tinta-3 line-through' : ''}`}>{prio(l) && <span title="Leitura prioritária">⭐ </span>}{l.titulo}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
            {modo === 'plano' && <Tag id={l.disciplinaId} />}
            {rapida
              ? <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-800" title="Leitura para a aula: sem tempo reservado no plano e sem cobrança de atraso">⚡ Rápida</span>
              : <span className="rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-800" title="Leitura de atividade: tem tempo reservado no plano">Atividade</span>}
            <span className={atrasada ? 'font-medium text-perigo' : ''}>{rapida ? 'Aula' : 'Prazo'}: {fmtCurto(l.prazo)}</span>
            <span>{fmtMinutos(l.minutos)}</span>
            {feita(l) && <button className="font-medium text-destaque hover:underline" onClick={() => alternarLeitura(l.id)}>↺ Desmarcar</button>}
          </div>
          <Notas chave={`l:${l.id}`} />
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <button className="rounded-lg px-2 py-1 hover:bg-stone-100" onClick={() => alternarPrioridade(l)} aria-label={prio(l) ? 'Tirar prioridade' : 'Marcar como prioritária'} title="Prioritária">{prio(l) ? '⭐' : '☆'}</button>
          {ehNova && <button className="rounded-lg px-2 py-1 hover:bg-stone-100" onClick={() => removerLeituraNova(l.id)} aria-label="Remover leitura">🗑️</button>}
        </div>
      </li>
    )
  }

  const salvar = () => {
    if (!f.titulo.trim() || !f.prazo) return
    adicionarLeitura({ titulo: f.titulo.trim(), disciplinaId: f.disciplinaId, prazo: f.prazo, minutos: Math.max(5, Number(f.minutos) || 60) })
    setF({ titulo: '', disciplinaId: f.disciplinaId, prazo: '', minutos: '60' })
    setAberto(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Leituras</h1>
          <p className="text-sm text-tinta-2">{totalFeitas} de {leituras.length} leituras feitas. </p>
          <p className="mt-1 text-xs text-tinta-3">⚡ <strong>Rápidas</strong> = leituras para a aula: sem tempo reservado e sem cobrança de atraso. <strong>Atividade</strong> = seminário, debate ou apresentação: entram na Rotina e marcar aqui marca a tarefa (e o contrário).</p>
        </div>
        <Botao variante="principal" onClick={() => setAberto(true)}>+ Adicionar leitura</Botao>
      </div>
      <div className="flex gap-2">
        <Botao variante={modo === 'disciplina' ? 'principal' : 'suave'} onClick={() => setModo('disciplina')}>Por disciplina</Botao>
        <Botao variante={modo === 'plano' ? 'principal' : 'suave'} onClick={() => setModo('plano')}>Plano de leitura (por prazo)</Botao>
      </div>

      {modo === 'plano' ? (
        <Cartao><ul className="divide-y divide-linha">{ordenar(leituras).map(linha)}</ul></Cartao>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plano.disciplinas.map((d) => {
            const ls = ordenar(leituras.filter((l) => l.disciplinaId === d.id))
            if (ls.length === 0) return null
            const n = ls.filter(feita).length
            return (
              <Cartao key={d.id}>
                <Titulo direita={<span className="text-sm text-tinta-2">{n}/{ls.length}</span>}><span className="mr-2">{d.nome}</span></Titulo>
                <Barra valor={(n / ls.length) * 100} className="mb-2" />
                <ul className="divide-y divide-linha">{ls.map(linha)}</ul>
              </Cartao>
            )
          })}
        </div>
      )}

      <Janela aberto={aberto} titulo="Adicionar leitura" onFechar={() => setAberto(false)}>
        <Campo rotulo="Título ou referência"><input className={estiloCampo} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: Artigo sobre o tema do TCC" /></Campo>
        <Campo rotulo="Disciplina ou projeto">
          <select className={estiloCampo} value={f.disciplinaId} onChange={(e) => setF({ ...f, disciplinaId: e.target.value })}>
            {plano.disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Prazo"><input type="date" className={estiloCampo} value={f.prazo} onChange={(e) => setF({ ...f, prazo: e.target.value })} /></Campo>
          <Campo rotulo="Minutos estimados"><input type="number" min={5} step={5} className={estiloCampo} value={f.minutos} onChange={(e) => setF({ ...f, minutos: e.target.value })} /></Campo>
        </div>
        <div className="flex justify-end gap-2"><Botao onClick={() => setAberto(false)}>Cancelar</Botao><Botao variante="principal" desativado={!f.titulo.trim() || !f.prazo} onClick={salvar}>Salvar</Botao></div>
      </Janela>
    </div>
  )
}
