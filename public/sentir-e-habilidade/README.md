# Sentir é Habilidade — deploy no Netlify

## O que você precisa antes de começar

1. Conta grátis no Netlify: https://netlify.com
2. Conta no Google AI Studio: https://aistudio.google.com/apikey
  - Nela, gere uma **API Key** para a API Gemini
   - Guarde essa chave, você vai colar no Netlify depois
3. Confira a disponibilidade do modelo, a cota e as condições de faturamento do seu
  projeto no Google AI Studio. Uma conta gratuita pode ter limites restritos.

## Passo a passo

### 1. Subir o projeto no Netlify

- Entre em https://app.netlify.com
- Clique em **"Add new site" → "Import an existing project"** e conecte este
  repositório do GitHub.
- Configure **Base directory** como `public/sentir-e-habilidade`.
- O arquivo `netlify.toml` dessa pasta define o build `npm run build`, a pasta
  publicada `dist` e as funções em `netlify/functions`.
- Aguarde o deploy. O Netlify vai fornecer um endereço como `seu-site.netlify.app`.

Não arraste o código-fonte para o deploy manual: isso não executa o build do Vite
nem publica as funções. Use a integração Git acima ou `netlify deploy --build --prod`
a partir desta pasta, com a CLI autenticada e vinculada ao site correto.

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
  - `GEMINI_API_KEY` → cole a chave gerada no Google AI Studio; ela deve estar
    disponível no escopo de Functions e no contexto de produção
  - `GEMINI_MODEL` (opcional) → modelo disponível para sua chave
    (padrão: `gemini-3.5-flash-lite`). O antigo `gemini-1.5-flash-latest`
    não deve ser usado. Consulte https://ai.google.dev/gemini-api/docs/deprecations
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
- Se falhar, a tela agora informa problemas de chave, modelo ou cota. Confira
  também os logs da função `generate` no painel do Netlify.
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
│   ├── generate.cjs         → chama a IA com sua chave protegida
│   └── leads.cjs            → salva e lista os e-mails captados
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
  isso aos controles de cota e faturamento do projeto no Google Cloud. Tentativas
  com erro não consomem o limite diário da aplicação.

## Testar localmente antes de publicar (opcional, exige Node.js instalado)

```bash
npm install
npm install -g netlify-cli
netlify dev
```

Execute esses comandos dentro de `public/sentir-e-habilidade`. Configure
`GEMINI_API_KEY` no ambiente local ou vincule a CLI ao site do Netlify que tem
essa variável. Nunca coloque a chave no React nem em variáveis `VITE_*`.

`npm run dev` sozinho inicia apenas o Vite, sem as funções. Para testar a geração,
use `netlify dev` e o endereço informado pela CLI.

## Integração com o site principal

O site principal deste repositório usa Firebase Hosting. Ele publica arquivos
estáticos e não executa as funções do Netlify nem transforma o código JSX.
Abrir `/sentir-e-habilidade/` diretamente no Firebase não publica esta aplicação.

Publique a aplicação no Netlify conforme explicado acima e use um link ou iframe
no site principal apontando para o endereço HTTPS do Netlify. Assim, a interface
e `/.netlify/functions/generate` ficam na mesma origem, sem precisar expor a chave.
O endpoint aceita POST com JSON `{"theme":"Medo","thought":"Tenho receio de mudar."}`
e retorna `{"reflection":"...","question":"..."}`.
