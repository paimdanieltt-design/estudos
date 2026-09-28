import { Link } from 'react-router-dom'
import { Barra, Botao, Cartao, Tag, Titulo } from '../componentes/basicos'
import { LinhaItem } from '../componentes/LinhaItem'
import { useEstudos } from '../estado/Contexto'
import {
  atrasados, diasAte, mensagemIncentivo, minutosDoDia, prazoMaisProximo, progressoGeral, resumosDaSemana, sequenciaDeSemanas,
} from '../nucleo/calculos'
import { diasEntre, fmtDiaMes, fmtFaltam, fmtLongo, fmtMinutos } from '../nucleo/datas'

export function Inicio() {
  const { plano, prog, hoje, itens, eventos, leituras, semanaAtual, numeroSemanaAtual } = useEstudos()
  const fase = plano.fases.find((f) => numeroSemanaAtual >= f.de && numeroSemanaAtual <= f.ate)
  const doDia = itens.filter((i) => i.dataEfetiva === hoje)
  const nAtrasos = atrasados(itens, hoje).length
  const resumos = resumosDaSemana(plano, itens, numeroSemanaAtual)
  const prazo = prazoMaisProximo(eventos, leituras, itens, prog, hoje)
  const geral = progressoGeral(plano, itens, numeroSemanaAtual)
  const { seq, quebrou } = sequenciaDeSemanas(plano, itens, numeroSemanaAtual)
  const dias = prazo ? diasAte(prazo.data, hoje) : 0
  const urgente = prazo ? dias <= 3 : false
  const pctPrazo = prazo && prazo.total ? Math.round((prazo.feitas / prazo.total) * 100) : 0

  // Backup: lembrar se nunca fez ou se o último tem mais de 7 dias
  const diasDesdeBackup = prog.ultimoBackup ? diasEntre(prog.ultimoBackup.slice(0, 10), hoje) : null
  const lembrarBackup = diasDesdeBackup === null || diasDesdeBackup > 7

  // Peso da semana: minutos planejados x tempo combinado
  const minSemana = semanaAtual ? itens.filter((i) => i.tipo !== 'extra' && i.dataEfetiva >= semanaAtual.inicio && i.dataEfetiva <= semanaAtual.fim && !i.feito).reduce((s, i) => s + i.minutos, 0) : 0
  const capSemana = 5 * plano.capacidade.util + 2 * plano.capacidade.fimDeSemana
  const semanaPesada = minSemana > capSemana

  const foraDoPlano = hoje < plano.diaInicialApp

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Semana {numeroSemanaAtual} de {plano.totalSemanas}</h1>
        <p className="text-sm text-tinta-2">{fmtLongo(hoje)}{fase && <> · <span className="font-medium">{fase.nome}</span></>}</p>
        {semanaAtual && <p className="text-xs text-tinta-3">{fmtDiaMes(semanaAtual.inicio)} a {fmtDiaMes(semanaAtual.fim)}</p>}
        {foraDoPlano && <p className="mt-1 text-sm text-tinta-2">O plano começa em {fmtDiaMes(plano.diaInicialApp)}.</p>}
      </div>

      {lembrarBackup && (
        <Cartao className="border-amber-300 bg-amber-50">
          <p className="text-sm">
            💾 <strong>{diasDesdeBackup === null ? 'Você ainda não fez nenhum backup.' : `Seu último backup foi há ${diasDesdeBackup} dias.`}</strong> Seu progresso fica só neste aparelho.
          </p>
          <div className="mt-2"><Link to="/config"><Botao variante="principal">Fazer backup agora</Botao></Link></div>
        </Cartao>
      )}

      {prazo ? (
        <Cartao className={urgente ? 'border-perigo bg-perigo-claro' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-tinta-3">Prazo mais próximo</p>
              <p className="mt-1 text-lg font-semibold leading-snug">{prazo.titulo}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-tinta-2">
                <Tag id={prazo.disciplinaId} /><span>{fmtDiaMes(prazo.data)}</span>
              </div>
            </div>
            <div className={`shrink-0 text-right ${urgente ? 'text-perigo' : 'text-destaque'}`}>
              <p className="text-3xl font-bold leading-none">{dias}</p>
              <p className="text-xs font-medium">{dias === 1 ? 'dia' : 'dias'}</p>
            </div>
          </div>
          <p className={`mt-2 text-sm font-medium ${urgente ? 'text-perigo' : 'text-tinta-2'}`}>{fmtFaltam(dias)}</p>
          <div className="mt-2 flex items-center gap-3">
            <Barra valor={pctPrazo} vermelha={urgente} />
            <span className="w-24 shrink-0 text-right text-xs text-tinta-2">{prazo.feitas}/{prazo.total} preparadas</span>
          </div>
        </Cartao>
      ) : (
        <Cartao><p className="text-sm text-tinta-2">Nenhum prazo pela frente. 🎉</p></Cartao>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <Titulo direita={<Link to={`/rotina?dia=${hoje}`} className="text-sm font-medium text-destaque">Abrir Rotina →</Link>}>Foco de hoje</Titulo>

          {nAtrasos > 0 && (
            <Link to="/atrasos" className="mb-2 flex items-center justify-between rounded-xl border border-perigo/40 bg-perigo-claro px-3 py-2 text-sm font-medium text-perigo">
              <span>⏰ {nAtrasos} {nAtrasos === 1 ? 'item atrasado' : 'itens atrasados'}</span><span>Ver →</span>
            </Link>
          )}

          {doDia.length === 0 ? (
            <p className="py-3 text-sm text-tinta-2">Nada marcado para hoje. Aproveite para adiantar uma meta da semana.</p>
          ) : (
            <div className="divide-y divide-linha">
              {doDia.map((i) => <LinhaItem key={i.chave} item={i} />)}
            </div>
          )}
          {doDia.length > 0 && <p className="mt-1 text-xs text-tinta-3">Planejado hoje: {fmtMinutos(minutosDoDia(itens, hoje))}</p>}

          <div className="mt-4 border-t border-linha pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-tinta-3">Metas da semana (se completam sozinhas)</p>
            {resumos.length === 0 && <p className="text-sm text-tinta-2">Sem metas nesta semana.</p>}
            <ul className="space-y-2">
              {resumos.map((r) => (
                <li key={r.meta.id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`min-w-0 truncate ${r.concluida ? 'text-tinta-3 line-through' : ''}`}>{prog.metasEditadas[r.meta.id] ?? r.meta.titulo}</span>
                    {r.concluida ? (
                      <span className="shrink-0 text-xs font-medium text-destaque">✓ Concluída</span>
                    ) : (
                      <Link to={`/rotina?dia=${r.proxima?.dataEfetiva ?? hoje}`} className="shrink-0 text-xs font-medium text-destaque">{r.feitas}/{r.total} tarefas →</Link>
                    )}
                  </div>
                  <Barra valor={r.total ? (r.feitas / r.total) * 100 : 0} className="mt-1 !h-1.5" />
                </li>
              ))}
            </ul>
          </div>
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <Titulo>Progresso geral</Titulo>
            <p className="text-3xl font-bold text-destaque">{geral.percentual}%</p>
            <Barra valor={geral.percentual} className="mt-2" />
            <p className="mt-2 text-xs text-tinta-3">{geral.cumpridas} de {geral.total} metas cumpridas até esta semana</p>
            <div className="mt-3 rounded-xl bg-destaque-claro px-3 py-2 text-sm">
              <p className="font-semibold text-destaque">🔥 Sequência: {seq} {seq === 1 ? 'semana' : 'semanas'}</p>
              <p className="text-tinta-2">{mensagemIncentivo(seq, quebrou)}</p>
            </div>
          </Cartao>
          {semanaPesada && (
            <Cartao className="border-amber-300 bg-amber-50">
              <p className="text-sm"><strong>Semana pesada.</strong> Faltam {fmtMinutos(minSemana)} de tarefas, mas seu tempo combinado é {fmtMinutos(capSemana)}. Veja o que dá para realocar ou reduzir.</p>
            </Cartao>
          )}
          <Link to="/dashboard" className="block text-center text-sm font-medium text-destaque">Ver o dashboard por semana →</Link>
        </div>
      </div>
    </div>
  )
}
