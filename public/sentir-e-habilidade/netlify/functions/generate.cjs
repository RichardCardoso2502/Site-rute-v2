const { getStore } = require("@netlify/blobs");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAILY_LIMIT_ANON = parseInt(process.env.DAILY_LIMIT_ANON || "1", 10);
const DAILY_LIMIT_LOGGED = parseInt(process.env.DAILY_LIMIT_LOGGED || "4", 10);

const SYSTEM_PROMPT = `Você é um guia de shadow work criado para uma psicóloga clínica especializada em inteligência emocional e neurociência afetiva. Seu tom é direto, poético e levemente provocador — no estilo de um mentor que não suaviza a verdade, mas também não é cruel. Você tem base sólida em como emoções funcionam (circuitos afetivos, função adaptativa de cada emoção, padrões de apego, respostas de ameaça/proteção), mas nunca soa como um manual técnico — a linguagem é acessível e viva.

Sua função é pegar o tema (uma emoção ou padrão) e o pensamento da pessoa e devolver duas coisas:
1. Uma reflexão curta (3 a 5 frases) que nomeia o padrão inconsciente por trás do pensamento. Quando fizer sentido, aponte a função protetora da emoção (o que ela está tentando fazer por essa pessoa), sem jargão técnico e sem julgamento — mas sem rodeios.
2. Uma pergunta final, direta, que a pessoa não consegue responder rápido — precisa parar para sentir.

Responda SOMENTE em JSON válido, sem markdown, sem crases, no formato exato:
{"reflection": "...", "question": "..."}

Escreva em português do Brasil.`;

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "method_not_allowed" }),
    };
  }

  // Netlify Identity preenche isto automaticamente quando o front-end manda
  // o token de login no header Authorization: Bearer <token>
  const user = context.clientContext && context.clientContext.user;

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    "unknown";
  const today = new Date().toISOString().slice(0, 10);

  const rateKey = user ? `user:${user.email}:${today}` : `ip:${ip}:${today}`;
  const limit = user ? DAILY_LIMIT_LOGGED : DAILY_LIMIT_ANON;

  try {
    const rateStore = getStore("rate-limits");
    const current = (await rateStore.get(rateKey, { type: "json" })) || {
      count: 0,
    };
    if (current.count >= limit) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: user ? "limite_diario_atingido" : "login_necessario",
          message: user
            ? "Você atingiu o limite de reflexões de hoje. Volte amanhã!"
            : "Sua reflexão gratuita de hoje já foi usada. Entre com seu e-mail para desbloquear mais.",
        }),
      };
    }
    await rateStore.setJSON(rateKey, { count: current.count + 1 });
  } catch (e) {
    // se o controle de limite falhar (ex: Netlify Blobs não configurado), seguimos em frente sem travar o usuário
  }

  try {
    // Parse do body de forma robusta (aceita string ou objeto já parseado)
    let bodyData = {};
    try {
      const raw = event.body;
      if (typeof raw === "string") {
        bodyData = JSON.parse(raw || "{}");
      } else if (raw && typeof raw === "object") {
        bodyData = raw;
      }
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "invalid_body", raw: String(event.body).slice(0, 200) }),
      };
    }
    const { theme, thought } = bodyData;


    if (!theme) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "theme_required" }),
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "missing_api_key",
          message: "A variável de ambiente GEMINI_API_KEY não está configurada no Netlify.",
        }),
      };
    }

    const userPrompt = `Tema: ${theme}\nPensamento da pessoa agora: ${
      (thought || "").trim() ||
      "(não informado — trabalhe apenas a partir do tema)"
    }`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "gemini_error", detail: errText }),
      };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Tenta extrair JSON de forma robusta (Gemini às vezes adiciona caracteres extras)
    const clean = text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (_) {
      // Tenta encontrar o primeiro objeto JSON válido no texto
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no_json_found");
      parsed = JSON.parse(match[0]);
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "generation_failed", detail: e.message, stack: e.stack }),
    };
  }
};
