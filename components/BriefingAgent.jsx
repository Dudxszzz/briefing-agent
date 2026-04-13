import { useState, useRef, useEffect } from "react";

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const BRIEFING_PROMPT = `Você é o Agente de Briefing da EQI Investimentos — especialista em campanhas de marketing para o mercado financeiro. Conduza uma entrevista estruturada para preencher um briefing completo e, ao entender o objetivo, pense ativamente no conteúdo da comunicação.

## Contexto EQI
- Plataforma de disparos: MktCloud (Salesforce Marketing Cloud)
- Canais: E-mail, WhatsApp, Push Notification (via OneSignal como custom activity no SFMC)
- Públicos: clientes ativos, prospects, assessores, segmentos por carteira/perfil
- Campanhas comuns: boas-vindas, pré-venda, lançamento de produto financeiro, retenção, eventos, ativação

## Campos do Briefing
1. Nome da campanha
2. Área solicitante
3. Contato responsável
4. Nome da oportunidade no cliente (CRM)
5. Nome da oportunidade interna
6. Boot da campanha no MktCloud (Digital)
7. Segmentação
8. Objetivo
9. Áreas impactadas
10. Observações adicionais
11. Responsável pelo projeto
12. Estratégia: COPY (A/B/C...), CANAL, SEGMENTAÇÃO, DATA, OBSERVAÇÕES
13. Personalização esperada
14. CTA(s)
15. Fluxo

## Estratégia de Conteúdo (obrigatório)
Após entender objetivo + canal, SUGIRA ativamente o conteúdo. Para E-mail: 2 assuntos, pré-header, estrutura de blocos, tom, 3-4 mensagens-chave, CTA. Para WhatsApp: texto, tom, CTA. Para Push: título (máx 50 chars), corpo (máx 100 chars), CTA. Confirme com o usuário antes de fechar.

## Regras
- 1-2 perguntas por mensagem. "A definir" para campos desconhecidos. Só gere o JSON após tudo confirmado.

## Output final — APENAS este JSON quando tudo confirmado:
{
  "status": "complete",
  "briefing": {
    "nomeCampanha": "", "areaSolicitante": "", "contato": "", "oportunidadeCliente": "",
    "oportunidadeInterna": "", "bootCampanha": "", "segmentacao": "", "objetivo": "",
    "areasImpactadas": "", "observacoesAdicionais": "", "responsavel": "",
    "estrategia": [{ "copy": "COPY A", "canal": "", "segmentacao": "", "dataDisparo": "", "observacoes": "" }],
    "personalizacao": "", "ctas": "", "fluxo": ""
  },
  "estrategiaConteudo": {
    "canal": "", "assuntoOpcao1": "", "assuntoOpcao2": "", "preHeader": "",
    "estrutura": [], "tom": "", "mensagensChave": [], "ctaSugerido": ""
  }
}`;

const FLOW_PROMPT = `Você é um especialista sênior em Salesforce Marketing Cloud (SFMC) com domínio completo de Journey Builder, automações, segmentação e boas práticas para o mercado financeiro brasileiro. Seu papel é, com base no briefing recebido, fazer as perguntas certas e montar um fluxo de Journey Builder completo e profissional para a EQI Investimentos.

## Stack da EQI no SFMC
- MktCloud = Salesforce Marketing Cloud
- Push via OneSignal (integrado como Custom Activity no Journey Builder)
- WhatsApp via MktCloud native chat messaging
- Salesforce CRM sincronizado via Marketing Cloud Connect
- Data Extensions para segmentação
- Timezone padrão: America/Sao_Paulo

## Seu conhecimento de Journey Builder

### Entry Sources (fontes de entrada)
- **Data Extension**: Segmento estático ou dinâmico de contatos. Use para campanhas planejadas e listas fechadas.
- **Salesforce Data Entry**: Entra quando um registro no Salesforce muda (ex: novo lead, oportunidade atualizada). Ideal para triggered journeys.
- **API Event**: Entrada via chamada de API. Ideal para eventos em tempo real (ex: cliente abre conta, faz primeiro depósito).
- **CloudPages Form**: Entrada via formulário preenchido. Ideal para landing pages e captação.
- **Audience Builder Segment**: Segmento dinâmico recalculado periodicamente.

### Tipos de Atividade
**Mensagens:**
- Email Activity: configura assunto, from name, from email, send classification, supressão
- SMS/WhatsApp: mensagem de texto, opt-in check obrigatório
- Push Notification (OneSignal Custom Activity): título, corpo, deep link
- In-App Message: mensagem dentro do app EQI

**Controle de Fluxo:**
- Wait by Duration: aguarda X horas/dias antes de prosseguir
- Wait Until Date: aguarda até data/hora específica (ex: dia do evento)
- Wait Until Activity: aguarda até o contato realizar uma ação (ex: abrir email)
- Decision Split (Attribute Split): divide baseado em atributo do contato (ex: saldo > 50k, perfil = moderado)
- Engagement Split: divide baseado em comportamento com e-mail anterior (Abriu / Não abriu / Clicou / Não clicou / Converteu)
- Random Split (A/B Test): divide aleatoriamente para testes A/B de mensagens ou horários
- Einstein Split: usa IA para otimizar o caminho mais provável de conversão

**Dados:**
- Update Contact: atualiza atributo na Data Extension (ex: status = "email_enviado")
- Salesforce Activity: cria tarefa ou atualiza oportunidade no CRM
- Add to List / Remove from List: gerencia listas de supressão

### Goals (Objetivos)
- Define o critério de sucesso do journey
- Quando atingido, o contato pode sair antecipadamente
- Exemplos: "planejador_preenchido = TRUE", "investimento_realizado = TRUE", "reuniao_agendada = TRUE"
- Configure como atributo na Contact DE ou evento de conversão

### Exit Criteria
- Critérios para sair do journey antes de completar
- Sempre inclua: Unsubscribe/Opt-out, Status inativo, Perfil alterado
- Pode incluir critérios de negócio: cliente migrou de segmento, fez a ação esperada

### Configurações Gerais
- Re-entry: Se contatos podem entrar mais de uma vez (cuidado com journeys de ativação)
- Contact Cap: Limite de contatos simultâneos no journey
- Suppression Lists: Listas de opt-out e clientes já impactados
- Frequency Cap: Limite de mensagens por contato por período
- Send Window: Janela de envio (ex: seg-sex 08h-20h)

## Boas práticas para mercado financeiro
- Sempre respeitar opt-in e preferências de comunicação
- Engagement splits após 2-3 dias de wait são padrão ouro
- Não enviar mais de 2-3 e-mails por semana para o mesmo contato
- Push notifications: usar com parcimônia, apenas para comunicações de alto valor
- WhatsApp: sempre verificar opt-in ativo antes de enviar
- Personalização com nome e dados financeiros aumenta abertura em 30%+
- Horários ideais: e-mail 09h-11h ou 14h-16h em dias úteis
- Segunda e terça têm melhor performance para mercado financeiro

## Tipos de Journey por campanha
- **Welcome/Boas-vindas**: Single send ou série de 2-3 emails em 7 dias
- **Ativação**: Multi-step com engagement split, geralmente 2-3 semanas
- **Pré-venda/Evento**: Wait until date + reminder D-3, D-1
- **Retenção**: Triggered por comportamento + decision split por segmento
- **Reengajamento**: Random split para teste A/B de abordagem

## Fluxo da conversa
1. Informe que vai montar o fluxo baseado no briefing
2. Faça perguntas estratégicas: tipo de journey (one-time ou automático?), frequência de entrada, se quer engagement splits, waits, multicanal
3. Sugira a estrutura com base no objetivo da campanha e boas práticas
4. Confirme com o usuário e ajuste
5. Gere o JSON final do fluxo

Faça 1-2 perguntas por mensagem. Seja consultivo — sugira caminhos baseados no objetivo.

## Output final — APENAS este JSON quando confirmado:
{
  "status": "flow_complete",
  "fluxo": {
    "nomeJourney": "",
    "tipo": "",
    "descricao": "",
    "entrySource": {
      "tipo": "",
      "nome": "",
      "descricao": "",
      "frequencia": ""
    },
    "goal": { "descricao": "", "criterio": "" },
    "exitCriteria": { "descricao": "" },
    "reentrada": false,
    "configuracoes": {
      "fromName": "EQI Investimentos",
      "fromEmail": "",
      "timezone": "America/Sao_Paulo",
      "sendWindow": "",
      "frequencyCap": ""
    },
    "steps": []
  }
}

Onde cada step pode ser:
- { "id": 1, "tipo": "ENTRY", "nome": "", "descricao": "" }
- { "id": 2, "tipo": "EMAIL", "nome": "", "descricao": "", "config": { "assunto": "", "preHeader": "", "horario": "" } }
- { "id": 3, "tipo": "WHATSAPP", "nome": "", "config": { "mensagem": "" } }
- { "id": 4, "tipo": "PUSH", "nome": "", "config": { "titulo": "", "corpo": "", "deepLink": "" } }
- { "id": 5, "tipo": "WAIT", "nome": "", "config": { "duracao": 3, "unidade": "dias" } }
- { "id": 6, "tipo": "ENGAGEMENT_SPLIT", "nome": "", "caminhos": [ { "label": "Abriu", "steps": [...] }, { "label": "Não abriu", "steps": [...] } ] }
- { "id": 7, "tipo": "DECISION_SPLIT", "nome": "", "criterio": "", "caminhos": [ { "label": "Sim", "steps": [] }, { "label": "Não", "steps": [] } ] }
- { "id": 8, "tipo": "RANDOM_SPLIT", "nome": "", "caminhos": [ { "label": "Variante A (50%)", "steps": [] }, { "label": "Variante B (50%)", "steps": [] } ] }
- { "id": 9, "tipo": "UPDATE_CONTACT", "nome": "", "config": { "campo": "", "valor": "" } }
- { "id": 10, "tipo": "EXIT", "nome": "", "descricao": "" }`;

// ─── WORD EXPORT ──────────────────────────────────────────────────────────────

function buildWordHTML(b, c, fluxo) {
  const navy = "#0C1F3F", gold = "#C8A45A", lg = "#F5F5F5";
  const cb = "border:1pt solid #ccc;";
  const hdr = (t, cols = 2) =>
    `<tr><td colspan="${cols}" style="background:${navy};color:#fff;font-weight:bold;font-size:12pt;padding:7pt 10pt;font-family:Calibri,sans-serif;">${t}</td></tr>`;
  const fld = (l, v) =>
    `<tr><td style="background:${lg};font-weight:bold;font-size:10pt;padding:5pt 8pt;width:30%;${cb}font-family:Calibri,sans-serif;vertical-align:top;">${l}</td>
     <td style="font-size:10pt;padding:5pt 8pt;${cb}font-family:Calibri,sans-serif;vertical-align:top;">${v || "A definir"}</td></tr>`;

  const stratRows = (b.estrategia || []).map((e, i) =>
    `<tr style="background:${i % 2 === 0 ? "#fff" : lg}">
      <td style="font-weight:bold;color:${gold};font-size:10pt;padding:5pt 8pt;${cb}font-family:Calibri,sans-serif;">${e.copy}</td>
      ${[e.canal, e.segmentacao, e.dataDisparo, e.observacoes].map(v => `<td style="font-size:10pt;padding:5pt 8pt;${cb}font-family:Calibri,sans-serif;">${v || "-"}</td>`).join("")}
    </tr>`).join("");

  const listRows = (arr) => (arr || []).map((item, i) =>
    `<tr style="background:${i % 2 === 0 ? "#fff" : lg}"><td style="font-size:10pt;padding:5pt 8pt;${cb}font-family:Calibri,sans-serif;">${item}</td></tr>`).join("");

  const renderFlowSteps = (steps, depth = 0) => {
    if (!steps || !steps.length) return "";
    return steps.map(step => {
      const typeColors = { ENTRY: "#22c55e", EMAIL: "#3b82f6", WHATSAPP: "#25d366", PUSH: "#8b5cf6", WAIT: "#f59e0b", ENGAGEMENT_SPLIT: "#f97316", DECISION_SPLIT: "#f97316", RANDOM_SPLIT: "#ec4899", UPDATE_CONTACT: "#6b7280", EXIT: "#ef4444" };
      const color = typeColors[step.tipo] || "#6b7280";
      const indent = depth * 20;
      let html = `<tr><td style="padding:5pt 8pt ${5}pt ${8 + indent}pt;font-family:Calibri,sans-serif;font-size:10pt;${cb}">
        <span style="background:${color};color:#fff;font-size:8pt;font-weight:bold;padding:2pt 6pt;border-radius:3pt;margin-right:6pt;">${step.tipo}</span>
        <strong>${step.nome}</strong>
        ${step.descricao ? `<br/><span style="color:#666;font-size:9pt;">${step.descricao}</span>` : ""}
        ${step.config ? `<br/><span style="color:#444;font-size:9pt;">${Object.entries(step.config).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(" · ")}</span>` : ""}
      </td></tr>`;
      if (step.caminhos) {
        step.caminhos.forEach(c => {
          html += `<tr><td style="padding:4pt 8pt 4pt ${8 + indent + 16}pt;font-family:Calibri,sans-serif;font-size:9pt;color:${color};font-weight:bold;${cb}">↳ ${c.label}</td></tr>`;
          html += renderFlowSteps(c.steps, depth + 2);
        });
      }
      return html;
    }).join("");
  };

  const fluxoSection = fluxo ? `<br/>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${hdr("CONFIGURAÇÃO DO JOURNEY — MARKETING CLOUD")}
      ${fld("Nome do Journey", fluxo.nomeJourney)}
      ${fld("Tipo", fluxo.tipo)}
      ${fld("Descrição", fluxo.descricao)}
      ${fld("Entry Source", `${fluxo.entrySource?.tipo} — ${fluxo.entrySource?.nome}`)}
      ${fld("Frequência de Entrada", fluxo.entrySource?.frequencia)}
      ${fld("Goal", fluxo.goal?.descricao)}
      ${fld("Exit Criteria", fluxo.exitCriteria?.descricao)}
      ${fld("Re-entrada", fluxo.reentrada ? "Sim" : "Não")}
      ${fld("From Name", fluxo.configuracoes?.fromName)}
      ${fld("From E-mail", fluxo.configuracoes?.fromEmail)}
      ${fld("Janela de Envio", fluxo.configuracoes?.sendWindow)}
      ${fld("Frequency Cap", fluxo.configuracoes?.frequencyCap)}
    </table><br/>
    <p style="font-weight:bold;font-size:11pt;font-family:Calibri,sans-serif;margin:14pt 0 4pt;">Steps do Journey:</p>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${renderFlowSteps(fluxo.steps)}
    </table>` : "";

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="UTF-8"/>
  <style>@page{margin:2cm}body{font-family:Calibri,sans-serif}table{width:100%;border-collapse:collapse}</style>
  </head><body>
    <p style="text-align:center;font-size:18pt;font-weight:bold;color:${navy};border-bottom:3pt solid ${gold};padding-bottom:6pt;margin-bottom:4pt;">BRIEFING DA CAMPANHA</p>
    <p style="text-align:center;font-size:13pt;color:#555;margin-bottom:18pt;">${b.nomeCampanha || ""}</p>
    <table>${hdr("INFORMAÇÕES GERAIS")}${fld("Nome da campanha",b.nomeCampanha)}${fld("Área solicitante",b.areaSolicitante)}${fld("Contato",b.contato)}${fld("Responsável",b.responsavel)}${fld("Oportunidade (cliente)",b.oportunidadeCliente)}${fld("Oportunidade (interna)",b.oportunidadeInterna)}${fld("Boot da campanha",b.bootCampanha)}</table><br/>
    <table>${hdr("OBJETIVO E SEGMENTAÇÃO")}${fld("Segmentação",b.segmentacao)}${fld("Objetivo",b.objetivo)}${fld("Áreas impactadas",b.areasImpactadas)}${fld("Observações",b.observacoesAdicionais)}</table><br/>
    <table>
      ${hdr("ESTRATÉGIA DE DISPARO", 5)}
      <tr>${["COPY","CANAL","SEGMENTAÇÃO","DATA","OBSERVAÇÕES"].map(h=>`<td style="background:${navy};color:#fff;font-weight:bold;font-size:9pt;padding:5pt 8pt;${cb}font-family:Calibri,sans-serif;">${h}</td>`).join("")}</tr>
      ${stratRows}
    </table><br/>
    <table>${hdr("PERSONALIZAÇÃO E CTA")}${fld("Personalização",b.personalizacao)}${fld("CTA(s)",b.ctas)}${fld("Fluxo",b.fluxo)}</table>
    ${c ? `<br/><table>${hdr("ESTRATÉGIA DE CONTEÚDO — "+((c.canal||"E-MAIL").toUpperCase()))}${fld("Assunto (opção 1)",c.assuntoOpcao1)}${fld("Assunto (opção 2)",c.assuntoOpcao2)}${fld("Pré-header",c.preHeader)}${fld("Tom e voz",c.tom)}${fld("CTA sugerido",c.ctaSugerido)}</table>
    ${(c.estrutura||[]).length?`<br/><p style="font-weight:bold;font-size:11pt;font-family:Calibri,sans-serif;">Estrutura do e-mail:</p><table>${listRows(c.estrutura.map((s,i)=>`${i+1}. ${s}`))}</table>`:""}
    ${(c.mensagensChave||[]).length?`<br/><p style="font-weight:bold;font-size:11pt;font-family:Calibri,sans-serif;">Mensagens-chave:</p><table>${listRows(c.mensagensChave.map(m=>`• ${m}`))}</table>`:""}` : ""}
    ${fluxoSection}
  </body></html>`;
}

function downloadWord(briefing, conteudo, fluxo) {
  const html = buildWordHTML(briefing, conteudo, fluxo);
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Briefing_${(briefing.nomeCampanha || "campanha").replace(/[^a-z0-9]/gi, "_")}.doc`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── FLOW VISUAL RENDERER ─────────────────────────────────────────────────────

const STEP_COLORS = {
  ENTRY: { bg: "#166534", border: "#22c55e", text: "#bbf7d0", icon: "⬇" },
  EMAIL: { bg: "#1e3a5f", border: "#3b82f6", text: "#bfdbfe", icon: "✉" },
  WHATSAPP: { bg: "#14532d", border: "#25d366", text: "#bbf7d0", icon: "💬" },
  PUSH: { bg: "#3b0764", border: "#8b5cf6", text: "#e9d5ff", icon: "🔔" },
  WAIT: { bg: "#78350f", border: "#f59e0b", text: "#fde68a", icon: "⏱" },
  ENGAGEMENT_SPLIT: { bg: "#7c2d12", border: "#f97316", text: "#fed7aa", icon: "⚡" },
  DECISION_SPLIT: { bg: "#7c2d12", border: "#f97316", text: "#fed7aa", icon: "◆" },
  RANDOM_SPLIT: { bg: "#831843", border: "#ec4899", text: "#fbcfe8", icon: "🎲" },
  UPDATE_CONTACT: { bg: "#1f2937", border: "#6b7280", text: "#d1d5db", icon: "✏" },
  EXIT: { bg: "#7f1d1d", border: "#ef4444", text: "#fecaca", icon: "✕" },
};

function StepNode({ step }) {
  const style = STEP_COLORS[step.tipo] || STEP_COLORS.UPDATE_CONTACT;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 10, padding: "10px 14px", width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: step.descricao || step.config ? 6 : 0 }}>
          <span style={{ background: style.border, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>{step.tipo.replace("_", " ")}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{step.nome}</span>
        </div>
        {step.descricao && <div style={{ fontSize: 11, color: style.text, opacity: 0.85, lineHeight: 1.4 }}>{step.descricao}</div>}
        {step.config && Object.entries(step.config).filter(([,v])=>v).length > 0 && (
          <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Object.entries(step.config).filter(([,v])=>v).map(([k,v]) => (
              <span key={k} style={{ fontSize: 10, color: style.text, opacity: 0.7, background: "rgba(255,255,255,0.07)", borderRadius: 4, padding: "2px 6px" }}>
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SplitRenderer({ step }) {
  const style = STEP_COLORS[step.tipo] || STEP_COLORS.DECISION_SPLIT;
  const paths = step.caminhos || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.12)" }} />
      {/* Split node */}
      <div style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 10, padding: "10px 14px", width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: style.border, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>{step.tipo.replace("_", " ")}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{step.nome}</span>
        </div>
        {step.criterio && <div style={{ fontSize: 11, color: style.text, opacity: 0.8, marginTop: 5 }}>{step.criterio}</div>}
      </div>
      {/* Branches */}
      <div style={{ display: "flex", width: "100%", gap: 8, marginTop: 0, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: `calc(100% - ${(paths.length - 1) * 4}px)`, height: 1, background: `${style.border}55` }} />
        {paths.map((caminho, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 2, height: 16, background: `${style.border}88` }} />
            <div style={{ background: `${style.border}22`, border: `1px solid ${style.border}55`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: style.text, marginBottom: 0, textAlign: "center" }}>
              {caminho.label}
            </div>
            <FlowRenderer steps={caminho.steps} compact />
          </div>
        ))}
      </div>
      {/* Merge line */}
      <div style={{ width: "100%", borderTop: `1px dashed rgba(255,255,255,0.1)`, marginTop: 4 }} />
    </div>
  );
}

function FlowRenderer({ steps, compact }) {
  if (!steps || !steps.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {steps.map((step) => {
        if (step.caminhos) return <SplitRenderer key={step.id} step={step} />;
        return <StepNode key={step.id} step={step} />;
      })}
      {!compact && <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.12)" }} />}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function BriefingAgent() {
  const [phase, setPhase] = useState("landing");
  // phases: landing | briefing | briefing-done | flow | done
  const [briefingMsgs, setBriefingMsgs] = useState([]);
  const [flowMsgs, setFlowMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefingResult, setBriefingResult] = useState(null);
  const [flowResult, setFlowResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("briefing"); // briefing | flow
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const messages = phase === "flow" || phase === "done" ? flowMsgs : briefingMsgs;
  const setMessages = phase === "flow" || phase === "done" ? setFlowMsgs : setBriefingMsgs;
  const systemPrompt = phase === "flow" || phase === "done" ? FLOW_PROMPT : BRIEFING_PROMPT;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [briefingMsgs, flowMsgs, loading]);


  //fetch("https://api.anthropic.com/v1/messages"
  const callClaude = async (msgs, prompt) => {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1600, system: prompt, messages: msgs }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const startBriefing = async () => {
    setPhase("briefing");
    setLoading(true);
    const init = [{ role: "user", content: "Olá, quero criar um briefing de campanha." }];
    const reply = await callClaude(init, BRIEFING_PROMPT);
    setBriefingMsgs([{ role: "user", content: "Olá, quero criar um briefing de campanha." }, { role: "assistant", content: reply }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startFlow = async () => {
    setPhase("flow");
    setActiveTab("flow");
    setLoading(true);
    const context = `O briefing da campanha foi concluído. Aqui estão os dados:

CAMPANHA: ${briefingResult.briefing.nomeCampanha}
OBJETIVO: ${briefingResult.briefing.objetivo}
CANAL PRINCIPAL: ${briefingResult.briefing.estrategia?.[0]?.canal || "E-mail"}
SEGMENTAÇÃO: ${briefingResult.briefing.segmentacao}
CTA: ${briefingResult.briefing.ctas}
ÁREA: ${briefingResult.briefing.areaSolicitante}
CONTEÚDO: ${briefingResult.estrategiaConteudo?.assuntoOpcao1 || ""}

Agora vamos montar o fluxo completo no Marketing Cloud (Journey Builder) para essa campanha.`;
    const init = [{ role: "user", content: context }];
    const reply = await callClaude(init, FLOW_PROMPT);
    setFlowMsgs([{ role: "user", content: context }, { role: "assistant", content: reply }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const currentMsgs = phase === "flow" ? flowMsgs : briefingMsgs;
    const newMsgs = [...currentMsgs, userMsg];
    if (phase === "flow") setFlowMsgs(newMsgs); else setBriefingMsgs(newMsgs);
    setInput("");
    setLoading(true);

    const reply = await callClaude(newMsgs, systemPrompt);

    try {
      if (phase === "briefing") {
        const match = reply.match(/\{[\s\S]*"status"\s*:\s*"complete"[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          setBriefingResult(parsed);
          setPhase("briefing-done");
          setActiveTab("briefing");
          setBriefingMsgs(prev => [...prev, { role: "assistant", content: "✅ Briefing completo! Confira o resultado na aba **Briefing**. Quando quiser, clique em **Montar Fluxo MKTCloud** para estruturarmos o Journey Builder." }]);
        } else {
          setBriefingMsgs(prev => [...prev, { role: "assistant", content: reply }]);
        }
      } else if (phase === "flow") {
        const match = reply.match(/\{[\s\S]*"status"\s*:\s*"flow_complete"[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          setFlowResult(parsed);
          setPhase("done");
          setActiveTab("flow");
          setFlowMsgs(prev => [...prev, { role: "assistant", content: "✅ Fluxo do Journey Builder montado! Confira na aba **Fluxo MKTCloud** e baixe o Word com tudo completo." }]);
        } else {
          setFlowMsgs(prev => [...prev, { role: "assistant", content: reply }]);
        }
      }
    } catch {
      if (phase === "flow") setFlowMsgs(prev => [...prev, { role: "assistant", content: reply }]);
      else setBriefingMsgs(prev => [...prev, { role: "assistant", content: reply }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const handleDownload = () => {
    if (briefingResult) downloadWord(briefingResult.briefing, briefingResult.estrategiaConteudo, flowResult?.fluxo);
  };

  const handleCopy = () => {
    if (!briefingResult) return;
    const b = briefingResult.briefing;
    navigator.clipboard.writeText(`BRIEFING: ${b.nomeCampanha}\nObjetivo: ${b.objetivo}\nSegmentação: ${b.segmentacao}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setPhase("landing"); setBriefingMsgs([]); setFlowMsgs([]); setBriefingResult(null); setFlowResult(null); setInput(""); setActiveTab("briefing"); };

  const b = briefingResult?.briefing;
  const c = briefingResult?.estrategiaConteudo;
  const fluxo = flowResult?.fluxo;
  const inChat = phase === "briefing" || phase === "flow";
  const showChat = phase !== "landing";

  // ── Color palette ──
  const navy = "#0c1f3f";

  return (
    <div style={{ minHeight: "100vh", background: "#080d18", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e8eaf0" }}>

      {/* ── Header ── */}
      <div style={{ padding: "13px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(12,31,63,0.5)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#c8a45a,#e8c87a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Agente de Briefing + MKTCloud</div>
            <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>EQI Investimentos · CMKT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(phase === "briefing-done" || phase === "flow" || phase === "done") && briefingResult && (
            <button onClick={handleDownload} style={{ background: "linear-gradient(135deg,#c8a45a,#e8c87a)", border: "none", color: "#0a0e1a", padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ⬇ {phase === "done" ? "Baixar Completo" : "Baixar Briefing"}
            </button>
          )}
          {phase !== "landing" && <button onClick={reset} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#9ca3af", padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>+ Nova campanha</button>}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT: Chat panel ── */}
        {showChat ? (
          <div style={{ width: 380, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", background: "#0a0e1a" }}>

            {/* Phase indicator */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6 }}>
              {[
                { key: "briefing", label: "1. Briefing", done: !!briefingResult },
                { key: "flow", label: "2. Journey MKTCloud", done: !!fluxo }
              ].map(tab => {
                const isActive = (tab.key === "briefing" && (phase === "briefing" || phase === "briefing-done")) ||
                  (tab.key === "flow" && (phase === "flow" || phase === "done"));
                return (
                  <div key={tab.key} style={{ flex: 1, padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, textAlign: "center", background: tab.done ? "rgba(200,164,90,0.15)" : isActive ? "rgba(255,255,255,0.07)" : "transparent", color: tab.done ? "#c8a45a" : isActive ? "#e8eaf0" : "#6b7280", border: tab.done ? "1px solid rgba(200,164,90,0.25)" : "1px solid transparent" }}>
                    {tab.done ? "✓ " : ""}{tab.label}
                  </div>
                );
              })}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {(phase === "briefing" || phase === "briefing-done" ? briefingMsgs : flowMsgs).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg,#c8a45a,#e8c87a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, marginRight: 7, marginTop: 2 }}>🤖</div>
                  )}
                  <div style={{ maxWidth: "85%", background: m.role === "user" ? "rgba(200,164,90,0.1)" : "rgba(255,255,255,0.04)", border: m.role === "user" ? "1px solid rgba(200,164,90,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", padding: "9px 12px", fontSize: 13, lineHeight: 1.6, color: "#e8eaf0", whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg,#c8a45a,#e8c87a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🤖</div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px 12px 12px 3px", padding: "10px 14px", display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c8a45a", display: "inline-block", animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}

              {/* CTA to start flow */}
              {phase === "briefing-done" && (
                <div style={{ margin: "8px 0", padding: "12px", background: "rgba(200,164,90,0.06)", border: "1px solid rgba(200,164,90,0.18)", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Briefing concluído! Próximo passo:</div>
                  <button onClick={startFlow} style={{ background: "linear-gradient(135deg,#c8a45a,#e8c87a)", border: "none", color: "#0a0e1a", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, width: "100%" }}>
                    ⚡ Montar Fluxo MKTCloud →
                  </button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {inChat && (
              <div style={{ padding: "10px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Responda... (Enter para enviar)" disabled={loading} rows={1}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                  onFocus={e => e.target.style.borderColor = "rgba(200,164,90,0.35)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                <button onClick={send} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? "rgba(200,164,90,0.12)" : "linear-gradient(135deg,#c8a45a,#e8c87a)", border: "none", borderRadius: 9, width: 38, height: 38, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, alignSelf: "flex-end", color: "#0a0e1a", fontWeight: 700 }}>↑</button>
              </div>
            )}
          </div>
        ) : null}

        {/* ── RIGHT: Results panel ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#080d18" }}>

          {/* Landing */}
          {phase === "landing" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 76, height: 76, borderRadius: 20, background: "rgba(200,164,90,0.1)", border: "1px solid rgba(200,164,90,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 0 60px rgba(200,164,90,0.07)" }}>📋</div>
              <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 10px", letterSpacing: -0.5 }}>Agente de Briefing + MKTCloud</h1>
                <p style={{ color: "#6b7280", fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 440 }}>
                  Cria o briefing completo no padrão EQI e monta o fluxo do Journey Builder no Marketing Cloud — tudo em um só lugar.
                </p>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                {["📧 E-mail", "💬 WhatsApp", "🔔 Push (OneSignal)", "⚡ Journey Builder", "◆ Engagement Splits", "📄 Export Word"].map(t => (
                  <span key={t} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 11px", fontSize: 11, color: "#9ca3af" }}>{t}</span>
                ))}
              </div>
              <button onClick={startBriefing} style={{ background: "linear-gradient(135deg,#c8a45a,#e8c87a)", border: "none", color: "#0a0e1a", padding: "13px 34px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(200,164,90,0.22)" }}>
                Criar novo briefing
              </button>
            </div>
          )}

          {/* Result tabs */}
          {showChat && (briefingResult || fluxo) && (
            <div style={{ padding: "20px 24px" }}>
              {/* Tab nav */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[
                  { key: "briefing", label: "📋 Briefing", show: !!briefingResult },
                  { key: "flow", label: "⚡ Fluxo MKTCloud", show: !!fluxo },
                ].filter(t => t.show).map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "7px 16px", borderRadius: 8, border: activeTab === tab.key ? "1px solid rgba(200,164,90,0.4)" : "1px solid rgba(255,255,255,0.08)", background: activeTab === tab.key ? "rgba(200,164,90,0.1)" : "rgba(255,255,255,0.03)", color: activeTab === tab.key ? "#c8a45a" : "#9ca3af", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400 }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Briefing Tab */}
              {activeTab === "briefing" && b && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Header card */}
                  <div style={{ background: "rgba(12,31,63,0.6)", border: "1px solid rgba(200,164,90,0.2)", borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#e8c87a" }}>{b.nomeCampanha}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{b.areaSolicitante} · {b.estrategia?.[0]?.canal}</div>
                    </div>
                    <button onClick={handleCopy} style={{ background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.09)"}`, color: copied ? "#4ade80" : "#9ca3af", padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>
                      {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                  {/* Fields grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["Contato", b.contato], ["Responsável", b.responsavel], ["Segmentação", b.segmentacao], ["Áreas impactadas", b.areasImpactadas]].filter(([,v])=>v&&v!=="A definir").map(([l,v]) => (
                      <div key={l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 13, color: "#e8eaf0" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {b.objetivo && (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px" }}>
                      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Objetivo</div>
                      <div style={{ fontSize: 13, color: "#e8eaf0", lineHeight: 1.6 }}>{b.objetivo}</div>
                    </div>
                  )}
                  {/* Estratégia */}
                  <div>
                    <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Estratégia de disparos</div>
                    {(b.estrategia || []).map((e, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px", display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: 10, fontSize: 12, marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: "#c8a45a" }}>{e.copy}</div>
                        <div><span style={{ color: "#6b7280" }}>Canal: </span>{e.canal}</div>
                        <div><span style={{ color: "#6b7280" }}>Data: </span>{e.dataDisparo}</div>
                        <div style={{ color: "#9ca3af", fontSize: 11 }}>{e.observacoes}</div>
                      </div>
                    ))}
                  </div>
                  {/* Conteúdo */}
                  {c && (
                    <div style={{ background: "rgba(200,164,90,0.04)", border: "1px solid rgba(200,164,90,0.15)", borderRadius: 10, padding: "14px" }}>
                      <div style={{ fontSize: 11, color: "#c8a45a", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 12 }}>✦ Estratégia de conteúdo — {c.canal}</div>
                      {c.assuntoOpcao1 && (
                        <div style={{ background: "rgba(200,164,90,0.07)", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Assunto</div>
                          <div style={{ fontSize: 13, color: "#e8eaf0", marginBottom: 3 }}>① {c.assuntoOpcao1}</div>
                          {c.assuntoOpcao2 && <div style={{ fontSize: 13, color: "#e8eaf0" }}>② {c.assuntoOpcao2}</div>}
                          {c.preHeader && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Pré-header: {c.preHeader}</div>}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        {c.tom && <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: "9px 11px" }}><div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Tom</div><div style={{ fontSize: 12 }}>{c.tom}</div></div>}
                        {c.ctaSugerido && <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: "9px 11px" }}><div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>CTA</div><div style={{ fontSize: 12, fontWeight: 600 }}>{c.ctaSugerido}</div></div>}
                      </div>
                      {c.estrutura?.length > 0 && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Estrutura</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{c.estrutura.map((bl, i) => <span key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "3px 8px", fontSize: 11, color: "#9ca3af" }}>{i+1}. {bl}</span>)}</div></div>}
                      {c.mensagensChave?.length > 0 && <div><div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Mensagens-chave</div>{c.mensagensChave.map((msg, i) => <div key={i} style={{ fontSize: 12, color: "#e8eaf0", display: "flex", gap: 7, marginBottom: 3 }}><span style={{ color: "#c8a45a" }}>•</span>{msg}</div>)}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Flow Tab */}
              {activeTab === "flow" && fluxo && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Journey config card */}
                  <div style={{ background: "rgba(12,31,63,0.6)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: "16px 18px" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#93c5fd", marginBottom: 10 }}>⚡ {fluxo.nomeJourney}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", fontSize: 12 }}>
                      {[
                        ["Tipo", fluxo.tipo],
                        ["Entry Source", `${fluxo.entrySource?.tipo} — ${fluxo.entrySource?.nome}`],
                        ["Frequência", fluxo.entrySource?.frequencia],
                        ["Re-entrada", fluxo.reentrada ? "Sim" : "Não"],
                        ["Timezone", fluxo.configuracoes?.timezone],
                        ["Send Window", fluxo.configuracoes?.sendWindow],
                      ].filter(([,v])=>v&&v!=="— ").map(([l,v]) => (
                        <div key={l}>
                          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div>
                          <div style={{ color: "#e8eaf0" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {fluxo.goal?.descricao && (
                      <div style={{ marginTop: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 7, padding: "8px 11px" }}>
                        <div style={{ fontSize: 10, color: "#22c55e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Goal</div>
                        <div style={{ fontSize: 12, color: "#e8eaf0" }}>{fluxo.goal.descricao}</div>
                        {fluxo.goal.criterio && <div style={{ fontSize: 11, color: "#9ca3af" }}>Critério: {fluxo.goal.criterio}</div>}
                      </div>
                    )}
                    {fluxo.exitCriteria?.descricao && (
                      <div style={{ marginTop: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "8px 11px" }}>
                        <div style={{ fontSize: 10, color: "#ef4444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Exit Criteria</div>
                        <div style={{ fontSize: 12, color: "#e8eaf0" }}>{fluxo.exitCriteria.descricao}</div>
                      </div>
                    )}
                  </div>

                  {/* Visual flow */}
                  <div>
                    <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Journey Steps</div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ width: "100%", maxWidth: 480 }}>
                        <FlowRenderer steps={fluxo.steps} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state while waiting for flow */}
              {activeTab === "flow" && !fluxo && (phase === "briefing-done") && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 14, color: "#6b7280", textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>⚡</div>
                  <div style={{ fontSize: 14 }}>Clique em <strong style={{ color: "#c8a45a" }}>Montar Fluxo MKTCloud</strong> no chat para estruturar o Journey Builder</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:2px}
      `}</style>
    </div>
  );
}
