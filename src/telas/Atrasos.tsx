import { Botao, Cartao, Realocador, Titulo } from '../componentes/basicos'
import { LinhaItem } from '../componentes/LinhaItem'
import { useEstudos } from '../estado/Contexto'
import { atrasados } from '../nucleo/calculos'
import { fmtDiaMes } from '../nucleo/datas'
import type { Item } from '../nucleo/itens'

export function Atrasos() {
  const { hoje, itens, realocar, desfazerRealocacao } = useEstudos()
  const lista = atrasados(itens, hoje)
  const porSemana = new Map<number, Item[]>()
  for (const i of lista) porSemana.set(i.semana ?? 0, [...(porSemana.get(i.semana ?? 0) ?? []), i])
  const reagendados = itens.filter((i) => i.realocadoDe && !i.feito && i.dataEfetiva >= hoje).sort((a, b) => a.dataEfetiva.localeCompare(b.dataEfetiva))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Atrasos</h1>
      <p className="text-sm text-tinta-2">Tudo o que passou do prazo sem ser feito fica aqui, item por item, até você concluir ou realocar.</p>

      {lista.length === 0 ? (
        <Cartao><p className="py-4 text-center text-sm text-tinta-2">🎉 Nada atrasado. Continue assim!</p></Cartao>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...porSemana.entries()].map(([sem, grupo]) => (
            <Cartao key={sem}>
              <Titulo direita={<Realocador rotulo="Semana inteira" onEscolher={(d) => realocar(grupo.map((i) => i.chave), d)} />}>
                {sem ? `Semana ${sem}` : 'Sem semana'} <span className="text-sm font-normal text-tinta-3">({grupo.length})</span>
              </Titulo>
              <div className="divide-y divide-linha">
                {grupo.map((i) => (
                  <LinhaItem key={i.chave} item={i} mostrarPrazoOriginal acoes={<Realocador rotulo="" onEscolher={(d) => realocar([i.chave], d)} />} />
                ))}
              </div>
            </Cartao>
          ))}
        </div>
      )}

      <Cartao>
        <Titulo>Reagendados</Titulo>
        {reagendados.length === 0 ? <p className="text-sm text-tinta-2">Nenhum item reagendado no momento.</p> : (
          <ul className="divide-y divide-linha">
            {reagendados.map((i) => (
              <li key={i.chave} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{i.titulo}</p>
                  <p className="text-xs text-tinta-3">De {fmtDiaMes(i.realocadoDe!)} para {fmtDiaMes(i.dataEfetiva)}</p>
                </div>
                <Botao onClick={() => desfazerRealocacao(i.chave)}>Desfazer</Botao>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </div>
  )
}
