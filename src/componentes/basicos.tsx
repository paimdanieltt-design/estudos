// Peças pequenas e reutilizáveis da interface.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEstudos } from '../estado/Contexto'
import { fmtCurto, somarDias } from '../nucleo/datas'
import type { Data } from '../nucleo/tipos'

export function Tag({ id, className = '' }: { id?: string; className?: string }) {
  const { disciplina } = useEstudos()
  const d = disciplina(id)
  if (!d) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap ${className}`}
      style={{ background: `${d.cor}1a`, color: d.cor }}
    >
      {d.curto}
    </span>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-linha bg-cartao p-4 shadow-sm ${className}`}>{children}</section>
}

export function Titulo({ children, direita }: { children: ReactNode; direita?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-semibold text-tinta">{children}</h2>
      {direita}
    </div>
  )
}

export function Barra({ valor, vermelha = false, className = '' }: { valor: number; vermelha?: boolean; className?: string }) {
  const v = Math.max(0, Math.min(100, valor))
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-stone-200 ${className}`}
      role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}
    >
      <div className={`h-full rounded-full transition-all ${vermelha ? 'bg-perigo' : 'bg-destaque'}`} style={{ width: `${v}%` }} />
    </div>
  )
}

type Variante = 'principal' | 'suave' | 'perigo' | 'link'
export function Botao({
  children, onClick, variante = 'suave', className = '', tipo = 'button', desativado = false, titulo,
}: {
  children: ReactNode; onClick?: () => void; variante?: Variante; className?: string
  tipo?: 'button' | 'submit'; desativado?: boolean; titulo?: string
}) {
  const estilos: Record<Variante, string> = {
    principal: 'bg-destaque text-white hover:bg-teal-800',
    suave: 'border border-linha bg-white text-tinta hover:bg-stone-100',
    perigo: 'bg-perigo text-white hover:bg-red-700',
    link: 'text-destaque underline-offset-2 hover:underline px-1',
  }
  return (
    <button
      type={tipo} onClick={onClick} disabled={desativado} title={titulo}
      className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${estilos[variante]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Checkbox({ marcado, onChange, rotulo }: { marcado: boolean; onChange: () => void; rotulo: string }) {
  return (
    <button
      type="button" role="checkbox" aria-checked={marcado} aria-label={rotulo} onClick={onChange}
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
        marcado ? 'border-destaque bg-destaque text-white' : 'border-stone-400 bg-white hover:border-destaque'
      }`}
    >
      {marcado && (
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5l4 4 8-9" /></svg>
      )}
    </button>
  )
}

/** Caixa de confirmação para ações que apagam ou substituem dados. Botão vermelho = perigo. */
export function Confirmar({
  aberto, titulo, texto, botao, onConfirmar, onCancelar,
}: { aberto: boolean; titulo: string; texto: ReactNode; botao: string; onConfirmar: () => void; onCancelar: () => void }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <div className="mt-2 text-sm text-tinta-2">{texto}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Botao onClick={onCancelar}>Cancelar</Botao>
          <Botao variante="perigo" onClick={onConfirmar}>{botao}</Botao>
        </div>
      </div>
    </div>
  )
}

/** Janela genérica (formulários). */
export function Janela({ aberto, titulo, onFechar, children }: { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <button onClick={onFechar} className="rounded-lg px-2 py-1 text-tinta-3 hover:bg-stone-100" aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1 block font-medium text-tinta-2">{rotulo}</span>
      {children}
    </label>
  )
}
export const estiloCampo = 'w-full rounded-lg border border-linha bg-white px-3 py-2 text-sm'

/** Mostra os avisos com botão "Desfazer" (embaixo, acima da barra de navegação no celular). */
export function Avisos() {
  const { avisos, fecharAviso } = useEstudos()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className="pointer-events-auto flex items-center gap-3 rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <span>{a.texto}</span>
          {a.desfazer && (
            <button className="font-semibold text-teal-300 underline" onClick={() => { a.desfazer!(); fecharAviso(a.id) }}>Desfazer</button>
          )}
        </div>
      ))}
    </div>
  )
}

/** Escolher para quando realocar: Hoje, Amanhã ou uma data. */
export function Realocador({ onEscolher, rotulo = 'Realocar' }: { onEscolher: (d: Data) => void; rotulo?: string }) {
  const { hoje } = useEstudos()
  const [aberto, setAberto] = useState(false)
  const [data, setData] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false) }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [aberto])
  const escolher = (d: Data) => { onEscolher(d); setAberto(false) }
  return (
    <div className="relative inline-block" ref={ref}>
      <Botao onClick={() => setAberto(!aberto)} titulo="Realocar para outro dia">🔁 {rotulo}</Botao>
      {aberto && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-xl border border-linha bg-white p-2 shadow-lg">
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" onClick={() => escolher(hoje)}>Hoje ({fmtCurto(hoje)})</button>
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" onClick={() => escolher(somarDias(hoje, 1))}>Amanhã ({fmtCurto(somarDias(hoje, 1))})</button>
          <div className="mt-1 flex gap-1 border-t border-linha pt-2">
            <input type="date" value={data} min={hoje} onChange={(e) => setData(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-linha px-2 py-1 text-sm" aria-label="Escolher data" />
            <Botao variante="principal" desativado={!data} onClick={() => escolher(data)}>OK</Botao>
          </div>
        </div>
      )}
    </div>
  )
}
