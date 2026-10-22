import React, { useState, useEffect } from "react";

const THEME_GROUPS = [
  {
    group: "Emoções primárias",
    options: [
      { id: "raiva", label: "Raiva" },
      { id: "medo", label: "Medo" },
      { id: "tristeza", label: "Tristeza / luto" },
      { id: "nojo", label: "Nojo / repulsa" },
      { id: "alegria", label: "Alegria" },
      { id: "surpresa", label: "Surpresa" },
    ],
  },
  {
    group: "Emoções sociais / autoconscientes",
    options: [
      { id: "vergonha", label: "Vergonha" },
      { id: "culpa", label: "Culpa" },
      { id: "inveja", label: "Inveja" },
      { id: "ciume", label: "Ciúme" },
      { id: "solidao", label: "Solidão" },
      { id: "rejeicao", label: "Rejeição / abandono" },
      { id: "humilhacao", label: "Humilhação" },
      { id: "orgulho", label: "Orgulho" },
    ],
  },
  {
    group: "Estados e padrões comuns na clínica",
    options: [
      { id: "ansiedade", label: "Ansiedade" },
      { id: "perfeccionismo", label: "Perfeccionismo" },
      { id: "autossabotagem", label: "Autossabotagem" },
      { id: "inseguranca", label: "Insegurança / autoestima" },
      { id: "sobrecarga", label: "Sobrecarga / exaustão" },
      { id: "frustracao", label: "Frustração" },
      { id: "impostor", label: "Síndrome do impostor" },
      { id: "controle", label: "Necessidade de controle" },
    ],
  },
  {
    group: "Vínculo e sentido",
    options: [
      { id: "identidade", label: "Identidade / quem sou eu" },
      { id: "relacionamentos", label: "Relacionamentos" },
      { id: "apego", label: "Padrões de apego" },
      { id: "gratidao", label: "Gratidão" },
      { id: "dinheiro", label: "Dinheiro / escassez" },
      { id: "proposito", label: "Propósito / vazio existencial" },
    ],
  },
];

const THEMES = THEME_GROUPS.flatMap((g) => g.options);
const HISTORY_KEY = "sentir-e-habilidade:history";

export default function App() {
  const [theme, setTheme] = useState(THEMES[0].id);
  const [thought, setThought] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Captura de lead
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadError, setLeadError] = useState(null);

  // Painel admin
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Auth customizado (nome, email, senha)
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sentir-e-habilidade:token");
    const userStr = localStorage.getItem("sentir-e-habilidade:user");
    if (token && userStr) {
      try {
        setAuthToken(token);
        setAuthUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem("sentir-e-habilidade:token");
        localStorage.removeItem("sentir-e-habilidade:user");
      }
    }
  }, []);

  async function handleSignup() {
    if (!authName || !authEmail || !authPassword) {
      setAuthError("Preencha todos os campos.");
      return;
    }
    if (!authEmail.includes("@")) {
      setAuthError("Digite um e-mail válido.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/.netlify/functions/auth-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "falha_ao_cadastrar");
      setAuthError(null);
      setAuthMode("login");
      setAuthEmail(authEmail);
      setAuthPassword("");
      setAuthName("");
    } catch (e) {
      setAuthError(e.message || "Não foi possível cadastrar. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin() {
    if (!authEmail || !authPassword) {
      setAuthError("Preencha e-mail e senha.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/.netlify/functions/auth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "credenciais_invalidas");
      setAuthToken(data.token);
      setAuthUser(data.user);
      localStorage.setItem("sentir-e-habilidade:token", data.token);
      localStorage.setItem("sentir-e-habilidade:user", JSON.stringify(data.user));
      setShowAuthModal(false);
      setLoginRequired(false);
      setError(null);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch (e) {
      setAuthError(e.message || "E-mail ou senha incorretos.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/.netlify/functions/auth-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: authToken }),
      });
    } catch (e) {
      // ignora erro de logout
    }
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem("sentir-e-habilidade:token");
    localStorage.removeItem("sentir-e-habilidade:user");
  }

  const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? theme;

  // Histórico fica salvo no navegador da própria pessoa (localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {
      // sem histórico ainda
    }
  }, []);

  function saveToHistory(entry) {
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      // falha silenciosa
    }
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      // ok
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setLeadSubmitted(false);
    setLeadEmail("");
    setLeadError(null);
    setLoginRequired(false);

    try {
      const headers = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ theme: themeLabel, thought }),
      });

      const parsed = await response.json().catch(() => null);

      if (!parsed) {
        setError("O endpoint da IA não retornou JSON. Verifique se a aplicação e a função generate foram publicadas no Netlify.");
        return;
      }

      if (response.status === 429) {
        setError(
          parsed.message ||
            "Você atingiu o limite de reflexões por hoje. Volte amanhã!"
        );
        if (parsed.error === "login_necessario") setLoginRequired(true);
        return;
      }

      if (!response.ok) {
        setError(parsed.message || "Não consegui gerar agora. Tenta de novo em alguns segundos.");
        return;
      }

      if (typeof parsed.reflection !== "string" || typeof parsed.question !== "string") {
        throw new Error("invalid_response");
      }

      setResult(parsed);
      saveToHistory({
        theme: themeLabel,
        thought: thought.trim(),
        reflection: parsed.reflection,
        question: parsed.question,
        date: new Date().toISOString(),
      });
    } catch (e) {
      setError("Não consegui gerar agora. Tenta de novo em alguns segundos.");
    } finally {
      setLoading(false);
    }
  }

  async function submitLead() {
    const email = leadEmail.trim();
    if (!email || !email.includes("@")) {
      setLeadError("Digite um e-mail válido.");
      return;
    }
    setLeadSaving(true);
    setLeadError(null);
    try {
      const response = await fetch("/.netlify/functions/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          theme: themeLabel,
          thought: thought.trim(),
          reflection: result?.reflection || "",
          question: result?.question || "",
        }),
      });
      if (!response.ok) throw new Error("save_failed");
      setLeadSubmitted(true);
    } catch (e) {
      setLeadError("Não consegui salvar agora. Tenta de novo.");
    } finally {
      setLeadSaving(false);
    }
  }

  async function loadLeads(password) {
    setLeadsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/leads", {
        headers: { "x-admin-password": password },
      });
      if (!response.ok) {
        setAdminError("Senha incorreta.");
        setAdminUnlocked(false);
        return;
      }
      const data = await response.json();
      setLeads(data.leads || []);
      setAdminUnlocked(true);
      setAdminError(null);
    } catch (e) {
      setAdminError("Não consegui carregar os leads agora.");
    } finally {
      setLeadsLoading(false);
    }
  }

  function checkAdminPassword() {
    loadLeads(adminInput);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f0f0c",
        color: "#e9ded2",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #3a231d",
            paddingBottom: 16,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              letterSpacing: "2px",
              fontSize: 13,
              color: "#c9a34e",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Sentir é Habilidade
          </span>
          {authUser ? (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #4a2e24",
                color: "#8a7566",
                fontSize: 11,
                padding: "6px 10px",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Sair
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background: "none",
                border: "1px solid #4a2e24",
                color: "#c9a34e",
                fontSize: 11,
                padding: "6px 10px",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Entrar
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#8a7566",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            letterSpacing: "0.5px",
            marginBottom: 32,
          }}
        >
          por <span style={{ color: "#c9a34e" }}>@psi.rute</span>
        </div>

        <div
          style={{
            display: "inline-block",
            border: "1px solid #a8502f",
            color: "#d2703f",
            fontSize: 11,
            letterSpacing: "1.5px",
            padding: "4px 10px",
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          Experimente grátis
        </div>

        <h1
          style={{
            fontSize: 38,
            lineHeight: 1.15,
            margin: "0 0 16px",
            fontWeight: 400,
          }}
        >
          Uma pergunta.
          <br />
          Uma pausa. Veja o que
          <br />
          vem à <span style={{ fontStyle: "italic", color: "#c9a34e" }}>tona.</span>
        </h1>

        <p
          style={{
            color: "#a89686",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 32,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          Suas emoções carregam informação — a neurociência afetiva mostra
          isso todos os dias. Escolha o que está vivo em você agora e receba
          uma reflexão e uma pergunta pra ir mais fundo. Sem login, sem
          enrolação.
        </p>

        {/* Theme select */}
        <label
          style={{
            display: "block",
            fontSize: 12,
            letterSpacing: "1px",
            color: "#c9a34e",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          Qual tema você quer trabalhar?
        </label>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: "100%",
              background: "#2b1410",
              border: "1px solid #4a2e24",
              color: "#e9ded2",
              padding: "14px 16px",
              fontSize: 16,
              appearance: "none",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {THEME_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#c9a34e",
              pointerEvents: "none",
            }}
          >
            ↓
          </span>
        </div>

        {/* Thought textarea */}
        <label
          style={{
            display: "block",
            fontSize: 12,
            letterSpacing: "1px",
            color: "#c9a34e",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          O que está passando pela sua cabeça agora? (opcional)
        </label>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          rows={4}
          placeholder="Escreva livremente, sem se preocupar em fazer sentido..."
          style={{
            width: "100%",
            background: "#2b1410",
            border: "1px solid #4a2e24",
            color: "#e9ded2",
            padding: "14px 16px",
            fontSize: 16,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            resize: "vertical",
            marginBottom: 24,
            boxSizing: "border-box",
          }}
        />

        {/* Button */}
        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#7a2318" : "#a3271c",
            color: "#f3e8d8",
            border: "none",
            padding: "18px 0",
            fontSize: 18,
            fontStyle: "italic",
            fontFamily: "'Georgia', serif",
            cursor: loading ? "default" : "pointer",
            marginBottom: 24,
          }}
        >
          {loading ? "Gerando..." : "Gerar minha reflexão"}
        </button>

        {error && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                color: "#d2703f",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 14,
                margin: "0 0 10px",
              }}
            >
              {error}
            </p>
            {loginRequired && (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: "#3a231d",
                  color: "#e9ded2",
                  border: "1px solid #c9a34e",
                  padding: "10px 16px",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                }}
              >
                Entrar e desbloquear mais reflexões
              </button>
            )}
          </div>
        )}

        {result && (
          <div
            style={{
              borderTop: "1px solid #3a231d",
              paddingTop: 24,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: "1.5px",
                color: "#c9a34e",
                textTransform: "uppercase",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Reflexão
            </span>
            <p style={{ fontSize: 18, lineHeight: 1.6, margin: "10px 0 24px" }}>
              {result.reflection}
            </p>

            <span
              style={{
                fontSize: 11,
                letterSpacing: "1.5px",
                color: "#c9a34e",
                textTransform: "uppercase",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Pergunta
            </span>
            <p
              style={{
                fontSize: 20,
                lineHeight: 1.5,
                fontStyle: "italic",
                color: "#f3e8d8",
                margin: "10px 0 0",
              }}
            >
              {result.question}
            </p>

            {/* Oferta do caderno / captura de e-mail */}
            <div
              style={{
                marginTop: 32,
                padding: 20,
                background: "#2b1410",
                border: "1px solid #4a2e24",
              }}
            >
              {leadSubmitted ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Prontinho ✓ Fica de olho no seu e-mail — o{" "}
                  <em>Caderno Trilhando Autoconhecimento</em> chega em breve.
                </p>
              ) : (
                <>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 13,
                      letterSpacing: "0.5px",
                      color: "#c9a34e",
                      textTransform: "uppercase",
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Quer ir mais fundo?
                  </p>
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "#c9bba9",
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Deixe seu e-mail e receba o{" "}
                    <strong style={{ color: "#e9ded2" }}>
                      Caderno Trilhando Autoconhecimento
                    </strong>
                    , com exercícios pra continuar essa reflexão.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="seu@email.com"
                      style={{
                        flex: "1 1 200px",
                        background: "#1f0f0c",
                        border: "1px solid #4a2e24",
                        color: "#e9ded2",
                        padding: "12px 14px",
                        fontSize: 15,
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={submitLead}
                      disabled={leadSaving}
                      style={{
                        background: "#a3271c",
                        color: "#f3e8d8",
                        border: "none",
                        padding: "12px 18px",
                        fontSize: 14,
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        cursor: leadSaving ? "default" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {leadSaving ? "Enviando..." : "Quero receber"}
                    </button>
                  </div>
                  {leadError && (
                    <p
                      style={{
                        color: "#d2703f",
                        fontSize: 13,
                        marginTop: 8,
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {leadError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Histórico (salvo no navegador da pessoa) */}
        <div
          style={{
            borderTop: "1px solid #3a231d",
            marginTop: 40,
            paddingTop: 20,
          }}
        >
          <button
            onClick={() => setShowHistory((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "#c9a34e",
              fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {showHistory ? "Ocultar" : "Ver"} histórico
            {history.length > 0 && (
              <span
                style={{
                  background: "#3a231d",
                  color: "#e9ded2",
                  borderRadius: 10,
                  fontSize: 11,
                  padding: "1px 8px",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {history.length}
              </span>
            )}
          </button>

          {showHistory && (
            <div style={{ marginTop: 20 }}>
              {history.length === 0 ? (
                <p
                  style={{
                    color: "#8a7566",
                    fontSize: 14,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Nenhuma reflexão salva ainda.
                </p>
              ) : (
                <>
                  {history.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: "2px solid #4a2e24",
                        paddingLeft: 16,
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: "1px",
                            color: "#c9a34e",
                            textTransform: "uppercase",
                            fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          {h.theme}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#6b5a4d",
                            fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          {new Date(h.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {h.thought && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#8a7566",
                            fontStyle: "italic",
                            margin: "0 0 8px",
                            fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          "{h.thought}"
                        </p>
                      )}
                      <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 8px" }}>
                        {h.reflection}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontStyle: "italic",
                          color: "#f3e8d8",
                          margin: 0,
                        }}
                      >
                        {h.question}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={clearHistory}
                    style={{
                      background: "none",
                      border: "1px solid #4a2e24",
                      color: "#8a7566",
                      fontSize: 12,
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      marginTop: 4,
                    }}
                  >
                    Limpar histórico
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Área da psicóloga (admin) */}
        <div
          style={{
            borderTop: "1px solid #3a231d",
            marginTop: 24,
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          {!showAdminGate && (
            <button
              onClick={() => setShowAdminGate(true)}
              style={{
                background: "none",
                border: "none",
                color: "#5a4a3d",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              área da psicóloga
            </button>
          )}

          {showAdminGate && !adminUnlocked && (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="password"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAdminPassword()}
                  placeholder="senha"
                  style={{
                    background: "#2b1410",
                    border: "1px solid #4a2e24",
                    color: "#e9ded2",
                    padding: "8px 12px",
                    fontSize: 13,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    width: 140,
                  }}
                />
                <button
                  onClick={checkAdminPassword}
                  disabled={leadsLoading}
                  style={{
                    background: "#3a231d",
                    color: "#e9ded2",
                    border: "none",
                    padding: "8px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {leadsLoading ? "Entrando..." : "Entrar"}
                </button>
              </div>
              {adminError && (
                <p
                  style={{
                    color: "#d2703f",
                    fontSize: 12,
                    marginTop: 8,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {adminError}
                </p>
              )}
            </div>
          )}

          {adminUnlocked && (
            <div style={{ textAlign: "left", marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    letterSpacing: "1px",
                    color: "#c9a34e",
                    textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Leads captados ({leads.length})
                </span>
                <button
                  onClick={() => loadLeads(adminInput)}
                  disabled={leadsLoading}
                  style={{
                    background: "none",
                    border: "1px solid #4a2e24",
                    color: "#8a7566",
                    fontSize: 12,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {leadsLoading ? "Carregando..." : "Atualizar"}
                </button>
              </div>

              {leads.length === 0 ? (
                <p
                  style={{
                    color: "#8a7566",
                    fontSize: 14,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Nenhum lead captado ainda.
                </p>
              ) : (
                leads.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      borderLeft: "2px solid #4a2e24",
                      paddingLeft: 14,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 14,
                          color: "#e9ded2",
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {l.email}
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6b5a4d",
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {new Date(l.date).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#8a7566",
                        margin: "0 0 4px",
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      Tema: {l.theme}
                    </p>
                    {l.thought && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#8a7566",
                          fontStyle: "italic",
                          margin: "0 0 4px",
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        "{l.thought}"
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 13,
                        color: "#c9bba9",
                        margin: 0,
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {l.question}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {showAuthModal && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            background: "#2b1410",
            border: "1px solid #4a2e24",
            borderRadius: 12,
            padding: 32,
            width: "min(400px, 90vw)",
            maxHeight: "90vh",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <button
            onClick={() => setShowAuthModal(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "none",
              border: "none",
              color: "#8a7566",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>

          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "1px",
                color: "#c9a34e",
                fontFamily: "'Georgia', serif",
              }}
            >
              {authMode === "login" ? "Entrar" : "Criar conta"}
            </span>
          </div>

          {authError && (
            <p
              style={{
                color: "#d2703f",
                fontSize: 13,
                marginBottom: 16,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {authError}
            </p>
          )}

          {authMode === "login" ? (
            <>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#c9a34e",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textAlign: "left",
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#c9a34e",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textAlign: "left",
                }}
              >
                Senha
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 20,
                }}
              />

              <button
                onClick={handleLogin}
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: authLoading ? "#7a2318" : "#a3271c",
                  color: "#f3e8d8",
                  border: "none",
                  padding: "14px 0",
                  fontSize: 16,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: authLoading ? "default" : "pointer",
                  borderRadius: 6,
                }}
              >
                {authLoading ? "Entrando..." : "Entrar"}
              </button>

              <p
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "#c9bba9",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline-block",
                }}
                onClick={() => setAuthMode("signup")}
              >
                Não tem conta? Cadastre-se
              </p>
            </>
          ) : (
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 20,
                }}
              />

              <button
                onClick={handleLogin}
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: authLoading ? "#7a2318" : "#a3271c",
                  color: "#f3e8d8",
                  border: "none",
                  padding: "14px 0",
                  fontSize: 16,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: authLoading ? "default" : "pointer",
                  borderRadius: 6,
                }}
              >
                {authLoading ? "Entrando..." : "Entrar"}
              </button>

              <p
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "#c9bba9",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline-block",
                }}
                onClick={() => setAuthMode("signup")}
              >
                Não tem conta? Cadastre-se
              </p>
            </>
            <>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#c9a34e",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textAlign: "left",
                }}
              >
                Nome completo
              </label>
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="Seu nome"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#c9a34e",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textAlign: "left",
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#c9a34e",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textAlign: "left",
                }}
              >
                Senha (mín. 6 caracteres)
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "#1f0f0c",
                  border: "1px solid #4a2e24",
                  color: "#e9ded2",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  boxSizing: "border-box",
                  marginBottom: 20,
                }}
              />

              <button
                onClick={handleSignup}
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: authLoading ? "#7a2318" : "#a3271c",
                  color: "#f3e8d8",
                  border: "none",
                  padding: "14px 0",
                  fontSize: 16,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: authLoading ? "default" : "pointer",
                  borderRadius: 6,
                }}
              >
                {authLoading ? "Criando..." : "Criar conta"}
              </button>

              <p
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "#c9bba9",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline-block",
                }}
                onClick={() => setAuthMode("login")}
              >
                Já tem conta? Faça login
              </p>
            </>
          )}
        </div>
      </div>
    )

    </div>
  );
}
