// Uma linha marcável (tarefa, tarefa extra ou leitura). Usada em várias telas.
import type { ReactNode } from 'react'
import { useEstudos } from '../estado/Contexto'
import { fmtDiaMes, fmtMinutos } from '../nucleo/datas'
import type { Item } from '../nucleo/itens'
import { reagendadoNaoFeito } from '../nucleo/calculos'
import { Checkbox, Tag } from './basicos'

export function LinhaItem({ item, acoes, mostrarPrazoOriginal = false }: { item: Item; acoes?: ReactNode; mostrarPrazoOriginal?: boolean }) {
  const { alternarItem, hoje, plano, prog } = useEstudos()
  const meta = item.metaId ? plano.metas.find((m) => m.id === item.metaId) : undefined
  const naoFeitoReagendado = reagendadoNaoFeito(item, hoje)
  return (
    <div className="flex gap-3 py-2.5">
      <Checkbox marcado={item.feito} onChange={() => alternarItem(item)} rotulo={`${item.feito ? 'Desmarcar' : 'Marcar como feito'}: ${item.titulo}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${item.feito ? 'text-tinta-3 line-through' : 'text-tinta'}`}>{item.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-tinta-3">
          {item.disciplinaId && item.disciplinaId !== 'geral' && <Tag id={item.disciplinaId} />}
          {item.tipo === 'extra' && <span className="rounded-full bg-stone-100 px-2 py-0.5">Extra</span>}
          {!item.metaId && item.tipo === 'tarefa' && <span className="rounded-full bg-stone-100 px-2 py-0.5">Geral</span>}
          {item.leituraIds.length > 0 && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-800">Leitura</span>}
          {item.minutos > 0 && <span>{fmtMinutos(item.minutos)}</span>}
          {item.hora && <span>às {item.hora}</span>}
          {meta && <span className="truncate">Meta: {prog.metasEditadas[meta.id] ?? meta.titulo}</span>}
          {mostrarPrazoOriginal && <span>Prazo original: {fmtDiaMes(item.dataOriginal)}</span>}
          {item.realocadoDe && !naoFeitoReagendado && <span className="text-destaque">🔁 realocado de {fmtDiaMes(item.realocadoDe)}</span>}
          {naoFeitoReagendado && <span className="text-perigo">Reagendado para {fmtDiaMes(item.dataEfetiva)} e não feito</span>}
          {item.feito && (
            <button className="font-medium text-destaque hover:underline" onClick={() => alternarItem(item)}>↺ Desmarcar</button>
          )}
        </div>
      </div>
      {acoes && <div className="flex shrink-0 items-start gap-1">{acoes}</div>}
    </div>
  )
}
