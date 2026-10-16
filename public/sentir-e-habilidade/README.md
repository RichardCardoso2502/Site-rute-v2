# Sentir é Habilidade — deploy no Netlify

## O que você precisa antes de começar

1. Conta grátis no Netlify: https://netlify.com
2. Conta grátis no Anthropic Console: https://console.anthropic.com
   - Nela, gere uma **API Key** (Settings → API Keys → Create Key)
   - Guarde essa chave, você vai colar no Netlify depois
3. Adicionar um cartão / créditos na conta da Anthropic Console (a API é paga por uso,
   mas o custo por geração é de poucos centavos)

## Passo a passo

### 1. Subir o projeto no Netlify

- Entre em https://app.netlify.com
- Clique em **"Add new site" → "Deploy manually"**
- Arraste a pasta inteira deste projeto (a pasta `sentir-e-habilidade`) para a área
  indicada
- Aguarde o deploy — o Netlify vai te dar um link tipo `nome-aleatorio.netlify.app`

> Se preferir deploy automático (atualiza sozinho quando você editar o código),
> suba este projeto para um repositório no GitHub e conecte pelo Netlify em
> "Add new site" → "Import an existing project" em vez de "Deploy manually".

### 2. Ativar o login (Netlify Identity)

- No painel do site, vá em **Site configuration → Identity**
- Clique em **"Enable Identity"**
- Em **Registration**, deixe como **"Open"** (qualquer pessoa pode criar conta) —
  ou "Invite only" se quiser controlar manualmente quem entra
- Em **External providers**, você pode opcionalmente ativar login com Google,
  pra facilitar (evita a pessoa ter que criar senha)
- Pronto — o botão "Entrar" no site já vai funcionar sozinho, sem precisar
  editar nada no código

### 3. Configurar as variáveis de ambiente (chaves secretas)

No painel do site no Netlify:

- Vá em **Site configuration → Environment variables**
- Adicione as variáveis:
  - `ANTHROPIC_API_KEY` → cole a chave que você gerou no Anthropic Console
  - `ADMIN_PASSWORD` → crie uma senha forte, só sua, pra acessar o painel de leads
  - `DAILY_LIMIT_ANON` (opcional) → quantas reflexões grátis SEM login por dia
    (padrão: **1**)
  - `DAILY_LIMIT_LOGGED` (opcional) → quantas reflexões a mais a pessoa ganha
    DEPOIS de entrar (padrão: **4**, ou seja, 1 + 4 = 5 por dia no total)
- Depois de salvar, vá em **Deploys** e clique em **"Trigger deploy" → "Deploy site"**
  pra aplicar as variáveis

### 4. Testar

- Abra o link do site
- Gere uma reflexão — se aparecer, a função `generate` está funcionando
- Deixe um e-mail de teste na oferta do caderno
- Role até o final, clique em "área da psicóloga", digite a senha que você criou,
  e veja se o lead de teste aparece

### 5. Domínio próprio (opcional)

- No painel do site, vá em **Domain management → Add a domain**
- Siga as instruções pra apontar seu domínio (ex: sentirehabilidade.com.br) pro
  Netlify

## Estrutura do projeto

```
sentir-e-habilidade/
├── index.html              → página base
├── src/
│   ├── main.jsx             → ponto de entrada do React
│   └── App.jsx               → toda a interface e lógica
├── netlify/functions/
│   ├── generate.js          → chama a IA com sua chave protegida
│   └── leads.js              → salva e lista os e-mails captados
├── netlify.toml               → configuração de build do Netlify
└── package.json
```

## Segurança — leia antes de divulgar o link

- A senha do painel de leads (`ADMIN_PASSWORD`) fica guardada no servidor, não no
  código — isso é bem mais seguro que a versão anterior dentro do Claude.
- Ainda assim, é uma senha simples, não um sistema de login completo. Não
  compartilhe essa senha com ninguém e troque-a se desconfiar que vazou.
- O histórico de reflexões de cada pessoa fica salvo só no navegador dela (não
  no seu banco de dados) — só os e-mails + reflexão associada de quem preencheu
  o formulário do caderno ficam no seu painel.
- O limite diário é controlado por IP. Isso não é perfeito — várias pessoas na
  mesma rede Wi-Fi (ex: escritório, faculdade) compartilham o mesmo IP e dividem
  o limite entre si, e alguém usando VPN pode contornar o limite trocando de IP.
  Ainda assim, é uma proteção sólida contra abuso casual e bots simples. Some
  isso ao teto de gasto mensal no Anthropic Console pra ter uma segunda camada
  de segurança.

## Testar localmente antes de publicar (opcional, exige Node.js instalado)

```bash
npm install
npm install -g netlify-cli
netlify dev
```

Isso sobe o site localmente com as funções funcionando (peça pra alguém te
ajudar com isso se não tiver familiaridade com terminal — não é obrigatório,
dá pra ir direto pro deploy manual).
