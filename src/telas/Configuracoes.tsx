import { useRef, useState } from 'react'
import { Botao, Cartao, Confirmar, Titulo } from '../componentes/basicos'
import { useEstudos } from '../estado/Contexto'
import { criarBackup, validarBackup } from '../estado/armazenamento'
import { exportarAnexos, fmtTamanho, type AnexoBackup } from '../estado/anexos'
import { fimDoPlano, totalExtensao } from '../nucleo/calendario'
import { fmtDiaMes } from '../nucleo/datas'
import type { Progresso } from '../nucleo/tipos'

export function Configuracoes() {
  const { plano, prog, hoje, restaurar, resetar, marcarBackup, desfazerExtensao, todosAnexos } = useEstudos()
  const entrada = useRef<HTMLInputElement>(null)
  const [pendente, setPendente] = useState<{ progresso: Progresso; geradoEm: string; anexos?: AnexoBackup[] } | null>(null)
  const [comAnexos, setComAnexos] = useState(true)
  const [erro, setErro] = useState('')
  const [resetando, setResetando] = useState(false)
  const [msg, setMsg] = useState('')

  const nomeArquivo = () => `backup-estudos-${hoje}.json`
  const tamanhoAnexos = todosAnexos.reduce((s, a) => s + a.tamanho, 0)
  const gerarArquivo = async () => {
    const anexos = comAnexos && todosAnexos.length ? await exportarAnexos(todosAnexos) : undefined
    return new File([JSON.stringify(criarBackup(prog, anexos))], nomeArquivo(), { type: 'application/json' })
  }

  const baixar = async () => {
    setMsg('Preparando o backup…')
    const arq = await gerarArquivo()
    const url = URL.createObjectURL(arq)
    const a = document.createElement('a')
    a.href = url; a.download = arq.name; a.click()
    URL.revokeObjectURL(url)
    marcarBackup(); setMsg('Backup baixado.')
  }

  const compartilhar = async () => {
    const arq = await gerarArquivo()
    if (navigator.canShare?.({ files: [arq] })) {
      try { await navigator.share({ files: [arq], title: 'Backup Estudos UnB' }); marcarBackup(); setMsg('Backup compartilhado.') } catch { /* cancelado */ }
    } else {
      setMsg('Este aparelho não permite compartilhar arquivos daqui. Use “Baixar backup” e envie o arquivo manualmente.')
    }
  }

  const escolherArquivo = async (arq?: File) => {
    setErro(''); setMsg('')
    if (!arq) return
    const texto = await arq.text()
    if (entrada.current) entrada.current.value = '' // permite escolher o mesmo arquivo de novo
    const r = validarBackup(texto)
    if (!r.ok) { setErro(r.erro); return }
    setPendente({ progresso: r.progresso, geradoEm: r.geradoEm, anexos: r.anexos })
  }

  const ext = totalExtensao(prog.extensoes)
  const fimAjustado = fimDoPlano(plano, prog.extensoes)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <Titulo>Backup do progresso</Titulo>
          <p className="text-sm text-tinta-2">Seu progresso fica só neste aparelho. Guarde um backup de vez em quando — ele também serve para levar tudo para outro celular ou computador.</p>
          <p className="mt-2 text-xs text-tinta-3">{prog.ultimoBackup ? `Último backup: ${new Date(prog.ultimoBackup).toLocaleString('pt-BR')}` : 'Você ainda não fez nenhum backup.'}</p>
          {todosAnexos.length > 0 && (
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={comAnexos} onChange={(e) => setComAnexos(e.target.checked)} />
              <span>Incluir os {todosAnexos.length} anexo{todosAnexos.length > 1 ? 's' : ''} ({fmtTamanho(tamanhoAnexos)}). O arquivo de backup fica maior{tamanhoAnexos > 30 * 1024 * 1024 ? ' e pode demorar ou falhar no celular' : ''}.</span>
            </label>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Botao variante="principal" onClick={baixar}>⬇️ Baixar backup</Botao>
            <Botao onClick={compartilhar}>📤 Enviar (WhatsApp, e-mail, Drive)</Botao>
            <Botao onClick={() => entrada.current?.click()}>📥 Restaurar backup</Botao>
            <input ref={entrada} type="file" accept="application/json,.json" className="hidden" onChange={(e) => escolherArquivo(e.target.files?.[0])} />
          </div>
          {msg && <p className="mt-2 text-sm text-destaque" role="status">{msg}</p>}
          {erro && <p className="mt-2 rounded-lg bg-perigo-claro px-3 py-2 text-sm text-perigo" role="alert">{erro}</p>}
        </Cartao>

        <Cartao>
          <Titulo>Datas do plano</Titulo>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-tinta-2">Início do semestre</dt><dd className="font-medium">{fmtDiaMes(plano.inicio)}/2026</dd></div>
            <div className="flex justify-between"><dt className="text-tinta-2">Último dia de aula (original)</dt><dd className="font-medium">{fmtDiaMes(plano.fim)}/2026</dd></div>
            <div className="flex justify-between"><dt className="text-tinta-2">Fim do plano (com ajustes)</dt><dd className={`font-medium ${ext > 0 ? 'text-amber-700' : ''}`}>{fmtDiaMes(fimAjustado)}/{fimAjustado.slice(0, 4)}</dd></div>
            <div className="flex justify-between"><dt className="text-tinta-2">Dias adicionados às semanas</dt><dd className="font-medium">{ext}</dd></div>
          </dl>
          {ext > 0 && (
            <div className="mt-3">
              <ul className="mb-2 text-xs text-tinta-2">{Object.entries(prog.extensoes).map(([s, d]) => <li key={s}>Semana {s}: +{d} dia{d > 1 ? 's' : ''}</li>)}</ul>
              <Botao onClick={desfazerExtensao}>↺ Desfazer última extensão</Botao>
            </div>
          )}
          <p className="mt-3 text-xs text-tinta-3">Para estender uma semana, use “Preciso de mais dias” na tela Semanas.</p>
        </Cartao>

        <Cartao>
          <Titulo>Avisos importantes</Titulo>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-tinta-2">
            <li>O app instalado no celular guarda uma cópia para funcionar sem internet. Depois de uma atualização, pode ser preciso fechar e abrir o app <strong>duas vezes</strong>.</li>
            <li>No iPhone, o Safari pode apagar dados de sites <strong>não instalados</strong> que ficam 7 dias sem uso. Por isso, instale na tela inicial e faça backup.</li>
          </ul>
        </Cartao>

        <Cartao className="border-perigo/40">
          <Titulo>Zona de perigo</Titulo>
          <p className="text-sm text-tinta-2">Apaga tudo o que você marcou e editou neste aparelho (o plano original continua).</p>
          <div className="mt-3"><Botao variante="perigo" onClick={() => setResetando(true)}>Resetar tudo</Botao></div>
        </Cartao>
      </div>

      <Confirmar
        aberto={!!pendente} titulo="Restaurar este backup?" botao="Restaurar e substituir"
        texto={<><p>O progresso atual deste aparelho será <strong>substituído</strong> pelo do arquivo{pendente?.geradoEm && <> (gerado em {new Date(pendente.geradoEm).toLocaleString('pt-BR')})</>}.</p>
          {pendente?.anexos ? <p className="mt-2">O backup tem <strong>{pendente.anexos.length} anexo(s)</strong>: os anexos atuais deste aparelho também serão substituídos.</p> : <p className="mt-2">Este backup não tem anexos; os anexos atuais deste aparelho ficam como estão.</p>}<p className="mt-2">Se quiser garantir, cancele e baixe um backup do estado atual antes.</p></>}
        onCancelar={() => setPendente(null)} onConfirmar={async () => { if (pendente) await restaurar(pendente.progresso, pendente.anexos); setPendente(null); setMsg('Backup restaurado.') }}
      />
      <Confirmar
        aberto={resetando} titulo="Resetar tudo?" botao="Sim, apagar tudo"
        texto={<p>Isso apaga todas as marcações, tarefas extras, anotações, <strong>anexos</strong>, prazos e leituras que você adicionou e os ajustes de semanas. <strong>Não dá para desfazer.</strong> Faça um backup antes, se quiser.</p>}
        onCancelar={() => setResetando(false)} onConfirmar={() => { resetar(); setResetando(false); setMsg('Tudo foi resetado.') }}
      />
    </div>
  )
}
