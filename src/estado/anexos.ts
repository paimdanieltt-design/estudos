// Anexos (arquivos) ficam no IndexedDB do navegador: um armazenamento próprio para arquivos,
// bem maior que o localStorage. Tudo fica só neste aparelho.
export interface AnexoMeta {
  id: string
  chave: string // a que tarefa/leitura pertence ('t:ID', 'x:ID' ou 'l:ID')
  nome: string
  tipo: string
  tamanho: number
  criadoEm: string
}

/** Formato dos anexos dentro do arquivo de backup. */
export interface AnexoBackup { meta: AnexoMeta; dados: string } // dados = arquivo em base64 (data URL)

export const LIMITE_ARQUIVO = 15 * 1024 * 1024 // 15 MB por arquivo

const NOME_BANCO = 'estudos-unb-anexos'

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOME_BANCO, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      db.createObjectStore('meta', { keyPath: 'id' })
      db.createObjectStore('arquivos') // chave = id, valor = Blob
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function pedido<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function fim(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function listarAnexos(): Promise<AnexoMeta[]> {
  const db = await abrir()
  return pedido(db.transaction('meta').objectStore('meta').getAll() as IDBRequest<AnexoMeta[]>)
}

export async function salvarAnexo(meta: AnexoMeta, arquivo: Blob): Promise<void> {
  const db = await abrir()
  const tx = db.transaction(['meta', 'arquivos'], 'readwrite')
  tx.objectStore('meta').put(meta)
  tx.objectStore('arquivos').put(arquivo, meta.id)
  await fim(tx)
}

export async function removerAnexoDoBanco(id: string): Promise<void> {
  const db = await abrir()
  const tx = db.transaction(['meta', 'arquivos'], 'readwrite')
  tx.objectStore('meta').delete(id)
  tx.objectStore('arquivos').delete(id)
  await fim(tx)
}

export async function obterArquivo(id: string): Promise<Blob | undefined> {
  const db = await abrir()
  return pedido(db.transaction('arquivos').objectStore('arquivos').get(id) as IDBRequest<Blob | undefined>)
}

export async function limparAnexos(): Promise<void> {
  const db = await abrir()
  const tx = db.transaction(['meta', 'arquivos'], 'readwrite')
  tx.objectStore('meta').clear()
  tx.objectStore('arquivos').clear()
  await fim(tx)
}

// ------------------------------------------------------------------ backup
const paraBase64 = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(b)
  })

export async function exportarAnexos(metas: AnexoMeta[]): Promise<AnexoBackup[]> {
  const saida: AnexoBackup[] = []
  for (const meta of metas) {
    const arq = await obterArquivo(meta.id)
    if (arq) saida.push({ meta, dados: await paraBase64(arq) })
  }
  return saida
}

/** Troca todos os anexos atuais pelos do backup. */
export async function importarAnexos(lista: AnexoBackup[]): Promise<void> {
  await limparAnexos()
  for (const a of lista) {
    const blob = await (await fetch(a.dados)).blob()
    await salvarAnexo(a.meta, blob)
  }
}

export const novoIdAnexo = () => `a-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export function fmtTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
