import React from 'react';
import { Lock, Zap, Crown } from 'lucide-react';
import { useAppMode } from '../contexts/AppModeContext';

interface ProFeatureLockProps {
  featureName: string;
  description?: string;
  children: React.ReactNode;
}

export const ProFeatureLock: React.FC<ProFeatureLockProps> = ({
  featureName,
  description,
  children,
}) => {
  const { isPro, toggleMode } = useAppMode();

  if (!isPro) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div
          className="w-full max-w-lg rounded-2xl p-8 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 0 40px rgba(124,58,237,0.08)",
          }}
        >
          {/* Ícone */}
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.10) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <Lock size={22} style={{ color: "#7C3AED" }} />
          </div>

          {/* Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Crown size={12} style={{ color: "#F59E0B" }} />
            <span
              className="text-xs font-bold uppercase"
              style={{
                color: "#F59E0B",
                letterSpacing: "0.10em",
                fontFamily: "var(--font-ui)",
              }}
            >
              Plano Pro
            </span>
          </div>

          <h3
            className="font-black mb-2"
            style={{
              fontSize: 18,
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui)",
              letterSpacing: "-0.02em",
            }}
          >
            {featureName}
          </h3>

          <p
            className="mb-6"
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "var(--font-ui)",
              lineHeight: 1.6,
              maxWidth: 360,
              margin: "0 auto 24px",
            }}
          >
            {description ?? "Esta funcionalidade avançada está disponível exclusivamente no Plano Pro. Faça upgrade para acessar análises completas, simulações e todas as ferramentas de otimização."}
          </p>

          {/* Features do Pro */}
          <div
            className="flex flex-col gap-2 mb-6 text-left"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            {[
              "Análise avançada de campanhas",
              "Simulador de escala ilimitado",
              "Comparador multi-produto",
              "Relatórios exportáveis",
              "Dashboard completo com todos os gráficos",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#7C3AED",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {feat}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={toggleMode}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
              color: "#fff",
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
              letterSpacing: "-0.01em",
            }}
          >
            <Zap size={15} />
            Ativar Plano Pro
          </button>

          <p
            className="text-xs mt-4"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            Você está no Plano Free. Faça upgrade para desbloquear.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
