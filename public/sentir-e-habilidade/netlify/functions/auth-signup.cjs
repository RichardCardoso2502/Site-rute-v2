const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
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

  try {
    const { name, email, password } = JSON.parse(event.body || "{}");
    if (!name || !name.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "nome_obrigatorio" }),
      };
    }
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "email_invalido" }),
      };
    }
    if (!password || password.length < 6) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "senha_curta" }),
      };
    }

    const store = getStore("users");
    const existing = await store.get(`user-${email.toLowerCase()}`, {
      type: "json",
    });
    if (existing) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ error: "email_ja_cadastrado" }),
      };
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    await store.setJSON(`user-${email.toLowerCase()}`, {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        user: { name: name.trim(), email: email.toLowerCase() },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "falha_ao_cadastrar",
        detail: e.message,
      }),
    };
  }
};