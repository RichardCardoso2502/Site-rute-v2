const { getStore } = require("@netlify/blobs");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const store = getStore("leads");

  // Salvar um novo lead (qualquer visitante pode chamar isso)
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      if (!body.email || !body.email.includes("@")) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "email_invalido" }),
        };
      }
      const key = `lead-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      await store.setJSON(key, { ...body, date: new Date().toISOString() });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "falha_ao_salvar" }),
      };
    }
  }

  // Listar leads (só com a senha de admin correta)
  if (event.httpMethod === "GET") {
    const password = event.headers["x-admin-password"];
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "senha_incorreta" }),
      };
    }
    try {
      const { blobs } = await store.list();
      const leads = [];
      for (const b of blobs) {
        const data = await store.get(b.key, { type: "json" });
        if (data) leads.push(data);
      }
      leads.sort((a, b) => new Date(b.date) - new Date(a.date));
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ leads }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "falha_ao_listar" }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: "method_not_allowed" }),
  };
};
