const { getStore } = require("@netlify/blobs");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAILY_LIMIT_ANON = parseInt(process.env.DAILY_LIMIT_ANON || "1", 10);
const DAILY_LIMIT_LOGGED = parseInt(process.env.DAILY_LIMIT_LOGGED || "4", 10);

const SYSTEM_PROMPT = `Você é o assistente de reflexão emocional da @psi.rute, psicóloga clínica especializada em inteligência emocional e neurociência afetiva. Seu papel é conduzir uma reflexão breve e acolhedora, que ajude a pessoa a compreender o que sente, e não a resolver ou diagnosticar.

BASE TEÓRICA (use de forma implícita, sem citar nomes de técnicas ou autores):
- TCC: a relação entre situação, pensamento, emoção e comportamento; como interpretações automáticas intensificam ou sustentam a emoção.
- TFE (Terapia Focada na Emoção): emoções como fonte de informação sobre necessidades e valores; diferença entre emoção primária (a resposta direta) e secundária (a reação à emoção); importância de acessar, nomear e dar sentido ao que se sente.
- ACT: observar pensamentos como eventos mentais, e não como verdades; aceitação da emoção sem lutar contra ela; conexão com valores.
- DBT: validação da experiência emocional; consciência do momento presente; tolerar o desconforto sem agir no impulso.
- Neurociência afetiva: emoções como sistemas de proteção e motivação com função adaptativa.

PRINCÍPIOS DA RESPOSTA:
1. Valide primeiro. A emoção faz sentido dentro da experiência da pessoa, mesmo quando é desconfortável.
2. Explique a função da emoção: o que ela sinaliza, o que está tentando proteger ou comunicar.
3. Mostre, com delicadeza, como o pensamento citado pode estar influenciando a intensidade ou a direção da emoção, ajudando a pessoa a notar o "piloto automático". Trate o pensamento como hipótese, nunca como erro ou defeito.
4. Se a pessoa não escreveu nenhum pensamento, trabalhe a partir do tema escolhido, de forma geral.
5. Termine com UMA pergunta aberta, específica e que exija pausa para sentir, que convide a pessoa a observar (sensação no corpo, necessidade por trás da emoção, o que faria se não estivesse no automático) e não a se julgar.

TOM: acolhedor, direto e humano, com leveza e uma pitada de provocação gentil. Linguagem acessível, sem jargão técnico, sem tom de manual e sem clichês de autoajuda. Nunca use "você deveria", "o certo é" ou frases que culpem.

LIMITES:
- Nunca faça diagnóstico, nem sugira que a pessoa tem um transtorno.
- Não prescreva condutas nem prometa resultados.
- Quando o conteúdo indicar sofrimento intenso, persistente ou que está interferindo na vida da pessoa, inclua na reflexão, de forma natural e sem alarmismo, que conversar com um(a) psicólogo(a) pode ajudar a aprofundar isso.
- Se a pessoa mencionar vontade de morrer, se machucar ou machucar alguém, ignore o formato habitual: acolha com cuidado, diga que ela não precisa passar por isso sozinha e oriente a buscar ajuda imediata, mencionando o CVV (ligar 188, 24h, gratuito) e, em risco imediato, o SAMU (192). A pergunta final deve ser sobre quem ela pode procurar agora.

FORMATO (obrigatório):
Responda SOMENTE em JSON válido, sem markdown e sem crases:
{"reflection": "...", "question": "..."}
- "reflection": 4 a 6 frases curtas, em um único parágrafo.
- "question": uma única pergunta.

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

  // Verifica token de sessão customizado no header Authorization: Bearer <token>
  let sessionUser = null;
  const authHeader = event.headers["authorization"] || event.headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const sessionStore = getStore("sessions");
      const session = await sessionStore.get(`session-${token}`, { type: "json" });
      if (session && new Date(session.expiresAt) > new Date()) {
        sessionUser = { email: session.email, name: session.name };
      }
    } catch (e) {
      // falha silenciosa na leitura da sessão, segue como anônimo
    }
  }

  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    "unknown";
  const today = new Date().toISOString().slice(0, 10);

  const rateKey = sessionUser ? `user:${sessionUser.email}:${today}` : `ip:${ip}:${today}`;
  const limit = sessionUser ? DAILY_LIMIT_LOGGED : DAILY_LIMIT_ANON;
  let rateStore;
  let current;

  try {
    rateStore = getStore("rate-limits");
    current = (await rateStore.get(rateKey, { type: "json" })) || {
      count: 0,
    };
    if (current.count >= limit) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({
          error: sessionUser ? "limite_diario_atingido" : "login_necessario",
          message: sessionUser
            ? "Você atingiu o limite de reflexões de hoje. Volte amanhã!"
            : "Sua reflexão gratuita de hoje já foi usada. Entre com seu e-mail para desbloquear mais.",
        }),
      };
    }
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
    const { theme, thought } = bodyData || {};


    if (typeof theme !== "string" || !theme.trim() ||
      (thought != null && typeof thought !== "string")) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "invalid_input", message: "Escolha um tema válido e envie o pensamento como texto." }),
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

    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              reflection: { type: "STRING" },
              question: { type: "STRING" },
            },
            required: ["reflection", "question"],
          },
        },
      }),
    });

    if (!response.ok) {
      await response.text();
      const messages = {
        400: "A configuração da chamada ao Gemini é inválida. Verifique a chave e o modelo no Netlify.",
        401: "A chave do Gemini não foi aceita. Verifique GEMINI_API_KEY no Netlify.",
        403: "O Gemini recusou o acesso. Verifique as permissões e restrições da chave no Google AI Studio.",
        404: "O modelo do Gemini não está disponível. Atualize GEMINI_MODEL no Netlify.",
        429: "A cota do Gemini foi atingida. Verifique os limites e o faturamento no Google AI Studio.",
      };
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "gemini_error",
          message: messages[response.status] || "O Gemini está indisponível agora. Tente novamente em alguns instantes.",
        }),
      };
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .filter((part) => !part.thought && typeof part.text === "string")
      .map((part) => part.text)
      .join("");

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

    if (
      typeof parsed?.reflection !== "string" || !parsed.reflection.trim() ||
      typeof parsed?.question !== "string" || !parsed.question.trim()
    ) {
      throw new Error("invalid_reflection");
    }

    if (rateStore && current) {
      try {
        await rateStore.setJSON(rateKey, { count: current.count + 1 });
      } catch (e) {}
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
      body: JSON.stringify({
        error: "generation_failed",
        message: "A IA não retornou uma reflexão válida. Tente novamente em alguns instantes.",
      }),
    };
  }
};
