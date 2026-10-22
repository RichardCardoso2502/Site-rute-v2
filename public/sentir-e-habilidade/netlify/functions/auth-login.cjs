const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

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
    const { email, password } = JSON.parse(event.body || "{}");
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "email_e_senha_sao_obrigatorios" }),
      };
    }

    const store = getStore("users");
    const user = await store.get(`user-${email.toLowerCase()}`, {
      type: "json",
    });
    if (!user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "credenciais_invalidas" }),
      };
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (user.passwordHash !== passwordHash) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "credenciais_invalidas" }),
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    await store.setJSON(`session-${token}`, {
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        token,
        user: { name: user.name, email: user.email },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "falha_ao_fazer_login",
        detail: e.message,
      }),
    };
  }
};