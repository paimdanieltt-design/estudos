// Caixa retrátil "Notas e anexos" de cada tarefa ou leitura:
// comentários, links (clicáveis) e arquivos anexados. Tudo fica neste aparelho.
import { useState } from 'react'
import { useEstudos } from '../estado/Contexto'
import { fmtTamanho, LIMITE_ARQUIVO } from '../estado/anexos'
import { Confirmar, estiloCampo } from './basicos'

/** Acha endereços (https://… ou www.…) dentro do texto. */
export function extrairLinks(texto: string): string[] {
  const achados = texto.match(/(?:https?:\/\/|www\.)[^\s<>()"']+/gi) ?? []
  return [...new Set(achados.map((l) => l.replace(/[.,;:!?]+$/, '')))]
}
const comProtocolo = (l: string) => (/^https?:\/\//i.test(l) ? l : `https://${l}`)

export function Notas({ chave }: { chave: string }) {
  const { prog, definirNota, anexos, anexar, removerAnexo, abrirAnexo } = useEstudos()
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState('')
  const [apagar, setApagar] = useState<{ id: string; nome: string } | null>(null)
  const texto = prog.notas[chave] ?? ''
  const lista = anexos[chave] ?? []
  const links = extrairLinks(texto)
  const temTexto = texto.trim().length > 0

  return (
    <div className="mt-1.5">
      <button
        type="button" aria-expanded={aberto} onClick={() => setAberto(!aberto)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${temTexto || lista.length ? 'bg-amber-50 text-amber-800' : 'text-tinta-3 hover:bg-stone-100'}`}
      >
        <span aria-hidden>📝</span> Notas e anexos
        {temTexto && <span aria-label="tem anotação" className="h-1.5 w-1.5 rounded-full bg-amber-600" />}
        {lista.length > 0 && <span>📎 {lista.length}</span>}
        <span aria-hidden>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div className="mt-2 space-y-3 rounded-xl border border-linha bg-stone-50 p-3">
          <label className="block text-xs font-medium text-tinta-2">
            Comentários e links
            <textarea
              className={`${estiloCampo} mt-1 min-h-20 resize-y`} value={texto} rows={3}
              placeholder="Escreva um comentário ou cole um link…" onChange={(e) => definirNota(chave, e.target.value)}
            />
          </label>

          {links.length > 0 && (
            <ul className="space-y-1 text-sm">
              {links.map((l) => (
                <li key={l} className="truncate">🔗 <a href={comProtocolo(l)} target="_blank" rel="noopener noreferrer" className="text-destaque underline">{l}</a></li>
              ))}
            </ul>
          )}

          <div>
            <p className="mb-1 text-xs font-medium text-tinta-2">Arquivos anexados</p>
            {lista.length === 0 && <p className="text-xs text-tinta-3">Nenhum arquivo ainda.</p>}
            <ul className="divide-y divide-linha">
              {lista.map((a) => (
                <li key={a.id} className="flex items-center gap-2 py-1.5 text-sm">
                  <span aria-hidden>{a.tipo.startsWith('image/') ? '🖼️' : a.tipo === 'application/pdf' ? '📄' : '📎'}</span>
                  <button className="min-w-0 flex-1 truncate text-left text-destaque hover:underline" onClick={() => abrirAnexo(a.id)} title="Abrir">{a.nome}</button>
                  <span className="shrink-0 text-xs text-tinta-3">{fmtTamanho(a.tamanho)}</span>
                  <button className="shrink-0 rounded-lg px-2 py-1 hover:bg-stone-200" onClick={() => setApagar({ id: a.id, nome: a.nome })} aria-label={`Remover anexo ${a.nome}`}>🗑️</button>
                </li>
              ))}
            </ul>
            <label className="mt-2 inline-block">
              <span className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg border border-linha bg-white px-3 py-1.5 text-sm font-medium hover:bg-stone-100">📎 Anexar arquivo</span>
              <input
                type="file" multiple className="sr-only" aria-label="Anexar arquivo"
                onChange={async (e) => {
                  const arqs = [...(e.target.files ?? [])]
                  e.target.value = ''
                  if (arqs.length) setErro((await anexar(chave, arqs)) ?? '')
                }}
              />
            </label>
            {erro && <p className="mt-2 rounded-lg bg-perigo-claro px-3 py-2 text-xs text-perigo" role="alert">{erro}</p>}
            <p className="mt-2 text-xs text-tinta-3">Até {fmtTamanho(LIMITE_ARQUIVO)} por arquivo. Os anexos ficam só neste aparelho; para levar para outro, faça o backup <strong>com anexos</strong> em Configurações.</p>
          </div>
        </div>
      )}

      <Confirmar
        aberto={!!apagar} titulo="Remover este anexo?" botao="Remover anexo"
        texto={<p>“{apagar?.nome}” será apagado deste aparelho. Não dá para desfazer.</p>}
        onCancelar={() => setApagar(null)} onConfirmar={() => { if (apagar) void removerAnexo(apagar.id); setApagar(null) }}
      />
    </div>
  )
}

