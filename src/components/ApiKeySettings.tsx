import React, { useState } from "react";
import { Bot, Eye, EyeOff, Save, Trash2, X, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getApiKey, setApiKey, removeApiKey, hasApiKey } from "../hooks/useApiKey";

interface ApiKeySettingsProps {
  onClose?: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onClose }) => {
  const [inputValue, setInputValue] = useState(() => getApiKey() ?? "");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "removed">("idle");
  const [keyExists, setKeyExists] = useState(() => hasApiKey());

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setKeyExists(true);
    setShow(false);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const handleRemove = () => {
    removeApiKey();
    setInputValue("");
    setKeyExists(false);
    setStatus("removed");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const savedKey = getApiKey() ?? "";
  const maskedKey = savedKey.length > 8
    ? savedKey.slice(0, 4) + "••••••••••••" + savedKey.slice(-4)
    : "••••••";

  return (
    <div
      className="rounded-2xl w-full max-w-md"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-start justify-between p-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "rgba(14,116,144,0.15)",
              border: "1px solid rgba(14,116,144,0.25)",
            }}
          >
            <Bot size={16} style={{ color: "var(--accent-glow)" }} />
          </div>
          <div>
            <h3
              className="font-bold"
              style={{
                fontSize: 14,
                color: "var(--text-primary)",
                fontFamily: "var(--font-ui)",
                letterSpacing: "-0.01em",
              }}
            >
              Configuração da IA
            </h3>
            <p
              className="mt-0.5"
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-ui)",
                lineHeight: 1.4,
                maxWidth: 280,
              }}
            >
              Use sua própria chave da API para personalizar o consumo da IA.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-subtle)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4">
        {/* Status banners */}
        {status === "saved" && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(5,150,105,0.10)",
              border: "1px solid rgba(5,150,105,0.25)",
            }}
          >
            <CheckCircle2 size={13} style={{ color: "#10B981", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#10B981", fontFamily: "var(--font-ui)" }}>
              Chave salva com sucesso!
            </span>
          </div>
        )}

        {status === "removed" && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <Trash2 size={13} style={{ color: "#EF4444", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#EF4444", fontFamily: "var(--font-ui)" }}>
              Chave removida.
            </span>
          </div>
        )}

        {/* Aviso: sem chave */}
        {!keyExists && status === "idle" && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.22)",
            }}
          >
            <AlertTriangle size={13} style={{ color: "#F59E0B", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#F59E0B", fontFamily: "var(--font-ui)" }}>
              Nenhuma chave configurada. A IA não funcionará sem ela.
            </span>
          </div>
        )}

        {/* Campo */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-ui)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Chave da API
          </label>

          {/* Modo leitura: mostra chave mascarada */}
          {keyExists && !show ? (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--text-secondary)",
                letterSpacing: "0.05em",
              }}
            >
              <span className="flex-1 truncate">{maskedKey}</span>
              <button
                type="button"
                onClick={() => setShow(true)}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              >
                <Eye size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Cole aqui sua chave da API..."
                autoComplete="off"
                spellCheck={false}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-subtle)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(14,116,144,0.18)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ right: 10, color: "var(--text-muted)" }}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          <p
            className="mt-2"
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-ui)",
              lineHeight: 1.5,
            }}
          >
            Esta chave fica salva apenas no seu navegador (localStorage) e pode ser removida a qualquer momento.
          </p>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!inputValue.trim() && !show}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all"
            style={{
              background: inputValue.trim() ? "var(--accent)" : "var(--bg-subtle)",
              color: inputValue.trim() ? "#fff" : "var(--text-muted)",
              border: `1px solid ${inputValue.trim() ? "var(--accent)" : "var(--border-subtle)"}`,
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
              opacity: inputValue.trim() ? 1 : 0.55,
            }}
          >
            <Save size={13} />
            Salvar
          </button>

          {keyExists && (
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.20)",
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} />
              Remover
            </button>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 transition-colors"
            style={{
              fontSize: 11,
              color: "var(--accent-glow)",
              fontFamily: "var(--font-ui)",
              textDecoration: "none",
            }}
          >
            Obter chave gratuita
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
