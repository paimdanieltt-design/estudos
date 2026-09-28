# Estudos UnB 📚

App pessoal para acompanhar o semestre 2026.2 de Ciência Política na UnB: rotina diária, metas da semana,
provas e entregas, leituras, checklist de conteúdo, atrasos, dashboard e uma página para o trabalho.

- Feito com React + Vite + TypeScript + Tailwind.
- Sem servidor, sem banco de dados, sem login: **tudo fica salvo no seu aparelho** (localStorage).
- Funciona como app no celular (PWA) e até sem internet.

---

## 1. Instalar e rodar no computador

Você precisa do [Node.js](https://nodejs.org) (versão 20 ou mais nova).

```bash
npm install      # baixa as dependências (só na primeira vez)
npm run dev      # abre o app em http://localhost:5173
```

O `npm run dev` só funciona enquanto o computador está com ele ligado. Para usar no celular, publique o site (passo 3).

Outros comandos úteis:

| Comando | O que faz |
|---|---|
| `npm run tipos` | confere se o código está correto (TypeScript) |
| `npm run build` | gera a versão final na pasta `dist` |
| `npm run plano` | recria o plano (`src/dados/plano.json`) a partir dos dados originais |

> Dica de teste: com o `npm run dev`, abra `http://localhost:5173/?hoje=2026-10-05` para fingir que hoje é outro dia.

## 2. Como o plano funciona

- `src/dados/fonte.ts` — os dados originais do semestre (disciplinas, leituras, provas e trabalhos), digitados a partir dos planos de ensino.
- `src/dados/replanejamento.ts` — **seus ajustes**, aplicados por cima dos dados originais toda vez que o plano é gerado. Exemplos: remarcar uma prova, dar prioridade a uma leitura, mudar o tempo livre de um dia.
- `npm run plano` junta os dois e distribui as tarefas pelos dias respeitando o tempo de estudo (75 min em dia útil, 120 min no fim de semana) e os prazos.
- O **plano é fixo** e o **progresso** (o que você marca) fica separado, guardado por chaves estáveis. Se o plano for gerado de novo, o que você já marcou continua valendo.

Dentro do app você consegue, sem mexer em código: marcar e desmarcar tudo, adicionar tarefas extras em qualquer dia, editar o texto das metas e das tarefas, realocar itens, estender uma semana, adicionar **prazos** e **leituras** novos, anotar coisas do trabalho e fazer backup.

## 3. Publicar de graça (para abrir no celular)

### Opção A: Vercel

```bash
npx vercel          # primeira vez: faz o login pelo navegador e cria o projeto
npx vercel --prod   # publica (use este comando toda vez que atualizar o app)
```

Quando perguntar, aceite as opções padrão. O comando final mostra o endereço do seu site.

### Opção B: Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

O app usa `HashRouter` (endereços com `#`), então funciona em qualquer hospedagem estática, sem configuração extra.

## 4. Colocar na tela inicial do celular

- **Android (Chrome):** abra o site, toque nos três pontinhos ⋮ e escolha **Instalar app** (ou “Adicionar à tela inicial”).
- **iPhone (Safari):** abra o site no **Safari**, toque no botão de compartilhar (quadrado com seta) e escolha **Adicionar à Tela de Início**.

## 5. Avisos importantes ⚠️

- **Atualizações:** o app instalado guarda uma cópia para funcionar sem internet. Depois de uma atualização, pode ser preciso **fechar e abrir o app duas vezes** para ver a versão nova.
- **Seu progresso fica só no aparelho.** No iPhone, o Safari pode apagar dados de sites **não instalados** que ficam 7 dias sem uso. Por isso: instale na tela inicial e faça **backup** (Configurações → Baixar backup ou Enviar). O app lembra você quando o último backup tem mais de 7 dias.
- O backup também serve para passar o progresso de um aparelho para outro: baixe num e use “Restaurar backup” no outro.
