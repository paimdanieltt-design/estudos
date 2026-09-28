// Moldura do app: barra lateral no computador, barra inferior no celular.
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEstudos } from '../estado/Contexto'
import { atrasados } from '../nucleo/calculos'
import { Avisos } from './basicos'

const ITENS = [
  { para: '/', icone: '🏠', nome: 'Início', fim: true },
  { para: '/rotina', icone: '📅', nome: 'Rotina' },
  { para: '/semanas', icone: '🗓️', nome: 'Semanas' },
  { para: '/atrasos', icone: '⏰', nome: 'Atrasos' },
  { para: '/dashboard', icone: '📊', nome: 'Dashboard' },
  { para: '/provas', icone: '📝', nome: 'Provas e entregas' },
  { para: '/leituras', icone: '📚', nome: 'Leituras' },
  { para: '/conteudo', icone: '✅', nome: 'Conteúdo' },
  { para: '/trabalho', icone: '💼', nome: 'Trabalho' },
  { para: '/config', icone: '⚙️', nome: 'Configurações' },
]
const PRINCIPAIS = ['/', '/rotina', '/semanas', '/atrasos']

export function Layout() {
  const { itens, hoje, numeroSemanaAtual, plano } = useEstudos()
  const nAtrasos = atrasados(itens, hoje).length
  const [maisAberto, setMaisAberto] = useState(false)
  const local = useLocation()
  const secundariaAtiva = !PRINCIPAIS.includes(local.pathname)

  const emblema = (para: string) =>
    para === '/atrasos' && nAtrasos > 0 ? (
      <span className="absolute -right-2 -top-1 min-w-5 rounded-full bg-perigo px-1.5 text-center text-[11px] font-bold leading-5 text-white">{nAtrasos}</span>
    ) : null

  return (
    <div className="min-h-screen lg:flex">
      {/* Computador: barra lateral */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-linha bg-cartao p-4 lg:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 text-lg font-bold text-destaque">
          <img src="./icone.svg" alt="" className="h-8 w-8" /> Estudos UnB
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {ITENS.map((i) => (
            <NavLink key={i.para} to={i.para} end={i.fim}
              className={({ isActive }) => `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-destaque-claro text-destaque' : 'text-tinta-2 hover:bg-stone-100'}`}>
              <span aria-hidden>{i.icone}</span>
              <span>{i.nome}</span>
              {i.para === '/atrasos' && nAtrasos > 0 && <span className="ml-auto rounded-full bg-perigo px-2 text-xs font-bold text-white">{nAtrasos}</span>}
            </NavLink>
          ))}
        </nav>
        <p className="px-2 text-xs text-tinta-3">Semana {numeroSemanaAtual} de {plano.totalSemanas}</p>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Celular: topo com logo/Início sempre visível */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-linha bg-cartao/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-bold text-destaque" aria-label="Ir para o Início">
            <img src="./icone.svg" alt="" className="h-7 w-7" /> Estudos UnB
          </Link>
          <span className="text-xs text-tinta-3">Semana {numeroSemanaAtual} de {plano.totalSemanas}</span>
        </header>

        <main className="pb-barra mx-auto w-full max-w-6xl px-4 py-5 lg:px-8 lg:pb-10"><Outlet /></main>
      </div>

      <Avisos />

      {/* Celular: barra inferior */}
      <nav className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-cartao lg:hidden" aria-label="Navegação principal">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {ITENS.filter((i) => PRINCIPAIS.includes(i.para)).map((i) => (
            <li key={i.para}>
              <NavLink to={i.para} end={i.fim} onClick={() => setMaisAberto(false)}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-destaque' : 'text-tinta-3'}`}>
                <span className="relative text-xl" aria-hidden>{i.icone}{emblema(i.para)}</span>
                {i.nome}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={() => setMaisAberto(!maisAberto)} aria-expanded={maisAberto}
              className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${secundariaAtiva || maisAberto ? 'text-destaque' : 'text-tinta-3'}`}>
              <span className="text-xl" aria-hidden>⋯</span>Mais
            </button>
          </li>
        </ul>
        {maisAberto && (
          <div className="absolute inset-x-0 bottom-full border-t border-linha bg-cartao p-3 shadow-lg">
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
              {ITENS.filter((i) => !PRINCIPAIS.includes(i.para)).map((i) => (
                <NavLink key={i.para} to={i.para} onClick={() => setMaisAberto(false)}
                  className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium ${isActive ? 'border-destaque bg-destaque-claro text-destaque' : 'border-linha text-tinta-2'}`}>
                  <span className="text-xl" aria-hidden>{i.icone}</span>{i.nome}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}
