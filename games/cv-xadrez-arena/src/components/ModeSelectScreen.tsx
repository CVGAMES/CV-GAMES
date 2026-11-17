import { ArrowLeft, ArrowRight, Bot } from 'lucide-react';
import { CvBrandMark } from './CvBrandMark';

interface ModeSelectScreenProps {
  onSelectVsComputer: () => void;
  onBack: () => void;
}

export function ModeSelectScreen({ onSelectVsComputer, onBack }: ModeSelectScreenProps) {
  return (
    <div
      data-testid="mode-select-screen"
      className="fixed inset-0 z-20 overflow-y-auto bg-[rgba(6,11,24,0.84)] text-[#f1f5f9] px-5 py-6 sm:px-8 sm:py-10 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-2xl cv-animate-in">
        <div className="flex items-center justify-between gap-4 mb-6">
          <CvBrandMark compact />
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e1529] hover:bg-[#16213e] border border-[#1e2d4d] text-xs sm:text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="bg-[#0e1529] border border-[#06b6d4]/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22d3ee] mb-1.5">
            CV XADREZ ARENA 3D
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Escolha o Modo de Jogo
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1.5 mb-6">
            Selecione o formato da partida para avançar para a dificuldade da inteligência artificial.
          </p>

          <button
            type="button"
            data-testid="mode-vs-cpu-btn"
            onClick={onSelectVsComputer}
            className="w-full text-left group bg-[#121c38] hover:bg-[#162347] border-2 border-[#06b6d4]/60 hover:border-[#22d3ee] rounded-2xl p-6 transition-all cursor-pointer shadow-[0_12px_32px_rgba(6,182,212,0.12)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4]/25 to-[#8b5cf6]/25 border border-[#06b6d4]/45 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-[#22d3ee]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#22d3ee]">
                    ÚNICO MODO DISPONÍVEL
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mt-1">
                    JOGADOR VS COMPUTADOR
                  </h2>
                  <p className="text-sm text-[#cbd5e1] mt-2 leading-relaxed">
                    Enfrente o oponente autônomo em 4 níveis de dificuldade. Sua cor (Brancas ou Pretas) é sorteada no início de cada partida.
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] flex items-center justify-center text-white shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
