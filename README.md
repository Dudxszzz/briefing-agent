# Agente de Briefing + MKTCloud — EQI Investimentos

Ferramenta interna de criação de briefings de campanha e fluxos de Journey Builder para o Marketing Cloud.

---

## Deploy na Vercel (passo a passo)

### 1. Suba o projeto no GitHub

```bash
git init
git add .
git commit -m "feat: agente de briefing EQI"
git remote add origin https://github.com/SEU-USUARIO/briefing-agent-eqi.git
git push -u origin main
```

### 2. Importe na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Selecione o repositório `briefing-agent-eqi`
3. Framework: **Next.js** (detectado automaticamente)
4. Clique em **Deploy**

### 3. Configure a API Key

Após o primeiro deploy (pode falhar sem a key, isso é normal):

1. Vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (sua chave da Anthropic)
3. Clique em **Save** e depois **Redeploy**

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis
cp .env.example .env.local
# Edite .env.local e coloque sua ANTHROPIC_API_KEY

# Rodar localmente
npm run dev
# Acesse: http://localhost:3000
```

---

## Estrutura do projeto

```
briefing-agent-eqi/
├── app/
│   ├── api/
│   │   └── claude/
│   │       └── route.js        ← API Route serverless (proxy seguro)
│   ├── layout.js
│   └── page.js
├── components/
│   └── BriefingAgent.jsx       ← Componente principal
├── .env.example
├── next.config.js
└── package.json
```

## Como funciona a segurança

O componente React chama `/api/claude` (rota interna do Next.js).  
Essa rota serverless é que faz a chamada real para `api.anthropic.com` usando a `ANTHROPIC_API_KEY` — que fica **apenas no servidor**, nunca exposta no browser.
