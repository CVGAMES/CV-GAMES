import { BookOpen, ExternalLink, Play, Settings } from 'lucide-react';
import { CvBrandMark } from './CvBrandMark';

interface MainMenuScreenProps {
  onPlayNow: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export function MainMenuScreen({
  onPlayNow,
  onHowToPlay,
  onSettings,
}: MainMenuScreenProps) {
  const portalHomeUrl = new URL('../../../index.html', window.location.href).href;
  return (
    <div
      data-testid="main-menu-screen"
      className="fixed inset-0 z-20 overflow-y-auto bg-[rgba(6,11,24,0.68)] text-[#f1f5f9] flex flex-col justify-between p-5 sm:p-8"
    >
      {/* Topo com marca CV GAMES */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4">
        <CvBrandMark />
        <a
          href={portalHomeUrl}
          target="_top"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e1529]/90 border border-[#1e2d4d] hover:border-[#06b6d4]/60 text-xs sm:text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors whitespace-nowrap"
        >
          <span>VOLTAR AO CV GAMES</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#22d3ee]" />
        </a>
      </header>

      {/* Bloco central do menu sobre o tabuleiro 3D animado */}
      <main className="w-full max-w-xl mx-auto my-auto py-8 flex flex-col items-center text-center cv-animate-in">
        <div className="w-full bg-[#0a1022]/90 border border-[#06b6d4]/30 rounded-3xl p-6 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a78bfa] mb-2">
            EXCLUSIVO CV GAMES
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
            CV XADREZ <span className="text-[#22d3ee]">ARENA 3D</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#cbd5e1] mt-3">
            UMA BATALHA DE ESTRATÉGIA E FÍSICA
          </p>

          <p className="text-sm text-[#94a3b8] mt-4 max-w-md mx-auto leading-relaxed">
            Caminhe sobre o tabuleiro em 3D, carregue cada peça manualmente e dispute espaço contra o computador em partidas completas de xadrez.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              data-testid="menu-play-btn"
              onClick={onPlayNow}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white font-display font-bold text-lg tracking-wide shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>JOGAR AGORA</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="menu-howto-btn"
                onClick={onHowToPlay}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111a33] hover:bg-[#172347] border border-[#1e2d4d] hover:border-[#8b5cf6]/60 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#a78bfa]" />
                <span>COMO JOGAR</span>
              </button>

              <button
                type="button"
                data-testid="menu-settings-btn"
                onClick={onSettings}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111a33] hover:bg-[#172347] border border-[#1e2d4d] hover:border-[#06b6d4]/60 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#22d3ee]" />
                <span>CONFIGURAÇÕES</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé discreto */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94a3b8]">
        <span>CV XADREZ ARENA 3D · Experiência 3D com Física e Xadrez Oficial</span>
        <span className="font-mono-tabular text-[#64748b]">cvgames.com.br</span>
      </footer>
    </div>
  );
}
