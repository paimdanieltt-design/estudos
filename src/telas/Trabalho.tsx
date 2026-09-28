// Página do trabalho (Volpatti Advogados). Fica separada dos estudos:
// nada daqui conta nas metas, no progresso ou nos atrasos da faculdade.
import { useState } from 'react'
import { Botao, Cartao, Checkbox, Titulo, estiloCampo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { diasEntre, fmtCurto, fmtFaltam } from '../nucleo/datas'
import type { TarefaTrabalho } from '../nucleo/tipos'

export function Trabalho() {
  const { prog, hoje, atualizarTrabalho } = useEstudos()
  const { tarefas, notas } = prog.trabalho
  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')

  const pendentes = tarefas.filter((t) => !t.feito).sort((a, b) => (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999'))
  const feitas = tarefas.filter((t) => t.feito)

  const adicionar = () => {
    const t = titulo.trim()
    if (!t) return
    const nova: TarefaTrabalho = { id: `w-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, titulo: t, prazo: prazo || undefined, feito: false }
    atualizarTrabalho((w) => ({ ...w, tarefas: [...w.tarefas, nova] }))
    setTitulo(''); setPrazo('')
  }
  const alternar = (id: string) => atualizarTrabalho((w) => ({ ...w, tarefas: w.tarefas.map((t) => (t.id === id ? { ...t, feito: !t.feito } : t)) }))
  const remover = (id: string) => atualizarTrabalho((w) => ({ ...w, tarefas: w.tarefas.filter((t) => t.id !== id) }), 'Tarefa do trabalho removida')

  const linha = (t: TarefaTrabalho) => {
    const dias = t.prazo ? diasEntre(hoje, t.prazo) : null
    const atrasada = !t.feito && dias !== null && dias < 0
    return (
      <li key={t.id} className="flex gap-3 py-2.5">
        <Checkbox marcado={t.feito} onChange={() => alternar(t.id)} rotulo={`${t.feito ? 'Desmarcar' : 'Marcar como feito'}: ${t.titulo}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${t.feito ? 'text-tinta-3 line-through' : ''}`}>{t.titulo}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
            {t.prazo && <span className={atrasada ? 'font-medium text-perigo' : dias !== null && dias <= 2 && !t.feito ? 'font-medium text-amber-700' : ''}>
              {fmtCurto(t.prazo)}{!t.feito && ` · ${fmtFaltam(dias!)}`}
            </span>}
            {t.feito && <button className="font-medium text-destaque hover:underline" onClick={() => alternar(t.id)}>↺ Desmarcar</button>}
          </div>
        </div>
        <button className="self-start rounded-lg px-2 py-1 text-tinta-3 hover:bg-stone-100" onClick={() => remover(t.id)} aria-label={`Remover: ${t.titulo}`}>🗑️</button>
      </li>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Trabalho</h1>
        <p className="text-sm text-tinta-2">Volpatti Advogados · Relações institucionais e governamentais. Esta página é separada da faculdade: nada aqui entra nas metas nem nos atrasos dos estudos.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <Titulo>Tarefas e prazos do trabalho</Titulo>
          <form className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={(e) => { e.preventDefault(); adicionar() }}>
            <input className={estiloCampo} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Enviar relatório da audiência" aria-label="Nova tarefa do trabalho" />
            <input type="date" className={estiloCampo} value={prazo} onChange={(e) => setPrazo(e.target.value)} aria-label="Prazo (opcional)" />
            <Botao tipo="submit" variante="principal" desativado={!titulo.trim()}>Adicionar</Botao>
          </form>
          {pendentes.length === 0 && <p className="py-3 text-sm text-tinta-2">Nenhuma tarefa pendente do trabalho.</p>}
          <ul className="divide-y divide-linha">{pendentes.map(linha)}</ul>
          {feitas.length > 0 && (
            <details className="mt-3 border-t border-linha pt-3">
              <summary className="cursor-pointer text-sm font-medium text-tinta-2">Concluídas ({feitas.length})</summary>
              <ul className="divide-y divide-linha">{feitas.map(linha)}</ul>
            </details>
          )}
        </Cartao>

        <Cartao>
          <Titulo>Anotações do trabalho</Titulo>
          <p className="mb-2 text-xs text-tinta-3">Reuniões, contatos, ideias, links. Salva sozinho neste aparelho e entra no backup.</p>
          <textarea
            className={`${estiloCampo} min-h-72 resize-y`} value={notas} aria-label="Anotações do trabalho"
            placeholder="Escreva aqui…" onChange={(e) => atualizarTrabalho((w) => ({ ...w, notas: e.target.value }))}
          />
        </Cartao>
      </div>
    </div>
  )
}
