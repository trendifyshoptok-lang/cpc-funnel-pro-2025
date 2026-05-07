import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, X, ArrowRight, Zap, Map, BarChart2, TrendingUp, User } from "lucide-react";

interface OnboardingProps {
  onComplete: (name?: string) => void;
  onSkip: () => void;
  userName?: string;
}

const STEPS = [
  {
    icon: Map,
    title: "Mapeie um Produto",
    description: "Comece cadastrando um produto afiliado com preço, comissão e mercado-alvo.",
    tab: "mapping",
  },
  {
    icon: Zap,
    title: "Configure o Setup",
    description: "Adicione keywords, anúncios e custos operacionais para calcular seu break-even.",
    tab: "setup",
  },
  {
    icon: BarChart2,
    title: "Analise as Campanhas",
    description: "Registre resultados de campanhas e descubra o CPC ideal para escalar.",
    tab: "analysis",
  },
  {
    icon: TrendingUp,
    title: "Escale com Segurança",
    description: "Use o Simulador de Escala para projetar lucros antes de aumentar o orçamento.",
    tab: "scale",
  },
];

const STORAGE_KEY = "onboarding_done";

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip, userName: existingName }) => {
  const [visible, setVisible] = useState(false);
  // -1 = tela de nome, 0..3 = passos do tour
  const [step, setStep] = useState<number>(-1);
  const [nameInput, setNameInput] = useState(existingName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  useEffect(() => {
    if (step === -1 && visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, visible]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    onComplete(nameInput.trim() || undefined);
  };

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    onComplete(nameInput.trim() || undefined);
    onSkip();
  };

  const advanceFromName = () => {
    if (nameInput.trim()) {
      onComplete(nameInput.trim());
    }
    localStorage.setItem(STORAGE_KEY, "1");
    setStep(0);
  };

  if (!visible) return null;

  // ── Tela 0: pergunta o nome ──────────────────────────────
  if (step === -1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm">

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800">Bem-vindo ao CPC Funnel Pro</span>
            </div>
            <button onClick={skip} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-7">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Como você se chama?</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Vou personalizar o painel com seu nome.
                </p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && advanceFromName()}
              placeholder="Seu primeiro nome..."
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-300"
            />
          </div>

          <div className="flex items-center justify-between px-6 pb-5 gap-3">
            <button onClick={skip} className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
              Pular
            </button>
            <button
              onClick={advanceFromName}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Continuar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Passos do tour ──────────────────────────────────────
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {nameInput.trim() ? `Olá, ${nameInput.trim()}! Veja como funciona` : "Como funciona"}
            </span>
          </div>
          <button onClick={skip} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-blue-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Icon size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
                Passo {step + 1} de {STEPS.length}
              </p>
              <h3 className="text-sm font-bold text-slate-900">{current.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{current.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 gap-3">
          <button onClick={skip} className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
            Pular tutorial
          </button>
          <button
            onClick={() => {
              if (step < STEPS.length - 1) setStep((s) => s + 1);
              else finish();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {step < STEPS.length - 1 ? (
              <>Próximo <ArrowRight size={14} /></>
            ) : (
              <>Começar <CheckCircle size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
