import { Barra, Cartao, Titulo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { ordemNiveis, progressoConteudo, rotuloNivel } from '../nucleo/calculos'
import type { Nivel } from '../nucleo/tipos'

const corNivel: Record<Nivel, string> = {
  'nao-iniciado': 'bg-stone-100 text-tinta-2',
  estudando: 'bg-amber-100 text-amber-800',
  revisar: 'bg-sky-100 text-sky-800',
  dominado: 'bg-destaque-claro text-destaque',
}

export function Conteudo() {
  const { plano, prog, definirNivel } = useEstudos()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Checklist de conteúdo</h1>
      <p className="text-sm text-tinta-2">Marque o seu nível em cada tópico. Toque em outro nível para mudar a qualquer momento.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {plano.disciplinas.filter((d) => !d.projeto).map((d) => {
          const ts = plano.topicos.filter((t) => t.disciplinaId === d.id)
          const pct = progressoConteudo(ts.map((t) => t.id), prog.dominio)
          return (
            <Cartao key={d.id}>
              <Titulo direita={<span className="text-sm font-medium text-tinta-2">{pct}%</span>}>{d.nome}</Titulo>
              <Barra valor={pct} className="mb-3" />
              <ul className="divide-y divide-linha">
                {ts.map((t) => {
                  const nivel = prog.dominio[t.id] ?? 'nao-iniciado'
                  return (
                    <li key={t.id} className="py-2">
                      <p className="text-sm">{t.titulo}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={`Nível: ${t.titulo}`}>
                        {ordemNiveis.map((n) => (
                          <button key={n} onClick={() => definirNivel(t.id, n)} aria-pressed={nivel === n}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${nivel === n ? `${corNivel[n]} ring-2 ring-current` : 'bg-white text-tinta-3 ring-1 ring-linha hover:bg-stone-50'}`}>
                            {rotuloNivel[n]}
                          </button>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Cartao>
          )
        })}
      </div>
    </div>
  )
}
