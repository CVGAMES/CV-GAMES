import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { AI_DIFFICULTIES, type AiDifficulty } from '../game/constants';
import { CvBrandMark } from './CvBrandMark';

interface DifficultyScreenProps {
  difficulty: AiDifficulty;
  onSelectDifficulty: (level: AiDifficulty) => void;
  onStartMatch: () => void;
  onBack: () => void;
}

const LEVELS: AiDifficulty[] = [1, 2, 3, 4];

function DifficultyEmblem({ level }: { level: AiDifficulty }) {
  const accentStroke =
    level === 1
      ? '#22d3ee'
      : level === 2
        ? '#38bdf8'
        : level === 3
          ? '#60a5fa'
          : '#a78bfa';

  return (
    <div className="w-20 h-20 rounded-2xl bg-[#111a33] border border-[#06b6d4]/35 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
        <rect x="12" y="50" width="40" height="6" rx="2.5" fill={accentStroke} />
        {level === 1 && (
          <>
            <circle cx="32" cy="20" r="8" fill="#e0f2fe" stroke={accentStroke} strokeWidth="2.5" />
            <path
              d="M23 48 L26 32 L38 32 L41 48 Z"
              fill="#bae6fd"
              stroke={accentStroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="21" y="28" width="22" height="4.5" rx="2" fill={accentStroke} />
          </>
        )}
        {level === 2 && (
          <>
            <path
              d="M19 48 L22 24 L18 20 L18 13 L24 13 L24 17 L29 17 L29 13 L35 13 L35 17 L40 17 L40 13 L46 13 L46 20 L42 24 L45 48 Z"
              fill="#e0f2fe"
              stroke={accentStroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="26" y="33" width="12" height="15" rx="2" fill="#1d4ed8" />
          </>
        )}
        {level === 3 && (
          <>
            <path
              d="M17 48 L20 26 L13 17 L23 22 L32 11 L41 22 L51 17 L44 26 L47 48 Z"
              fill="#e0f2fe"
              stroke={accentStroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="9" r="3" fill={accentStroke} />
            <circle cx="13" cy="15.5" r="2.5" fill={accentStroke} />
            <circle cx="51" cy="15.5" r="2.5" fill={accentStroke} />
          </>
        )}
        {level === 4 && (
          <>
            <path d="M32 6 L32 16 M27 11 L37 11" stroke={accentStroke} strokeWidth="3" strokeLinecap="round" />
            <path
              d="M16 48 L19 25 L13 18 L24 22 L32 16 L40 22 L51 18 L45 25 L48 48 Z"
              fill="#f3e8ff"
              stroke={accentStroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="33" r="4" fill="#7c3aed" />
          </>
        )}
      </svg>
    </div>
  );
}

export function DifficultyScreen({
  difficulty,
  onSelectDifficulty,
  onStartMatch,
  onBack,
}: DifficultyScreenProps) {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const active = AI_DIFFICULTIES[difficulty];

  return (
    <div
      data-testid="difficulty-screen"
      className="fixed inset-0 z-20 overflow-y-auto bg-[rgba(6,11,24,0.88)] text-[#f1f5f9] px-4 py-5 md:px-8 md:py-7 flex flex-col items-center"
    >
      <div className="w-full max-w-5xl my-auto flex flex-col gap-5 cv-animate-in">
        {/* Cabeçalho compacto com marca CV GAMES e botão Voltar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#06b6d4]/20 pb-4">
          <div className="flex items-center gap-4">
            <CvBrandMark compact />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                CV XADREZ <span className="text-[#22d3ee]">ARENA 3D</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-0.5">
                Jogador vs Computador · Cor sorteada a cada partida (Brancas ou Pretas)
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="difficulty-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e1529] hover:bg-[#16213e] border border-[#1e2d4d] text-xs sm:text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </header>

        {/* Grade principal: Cartão Esquerdo + Cartão Direito */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARTÃO ESQUERDO: Avatar da IA + Nível selecionado + Resumo */}
          <section
            aria-label="Resumo da dificuldade selecionada"
            className="lg:col-span-5 bg-[#0e1529] border border-[#06b6d4]/25 rounded-2xl p-6 md:p-7 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-4 mb-5">
                <DifficultyEmblem level={difficulty} />
                <div>
                  <div className="text-xs font-semibold tracking-wide text-[#22d3ee] font-mono-tabular">
                    Nível {active.level} de 4
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-1 leading-tight">
                    {active.name}
                  </h2>
                </div>
              </div>

              <p className="text-sm md:text-base text-[#cbd5e1] leading-relaxed mb-6">
                {active.shortDesc}
              </p>

              <dl className="space-y-2.5 bg-[#121a33] border border-[#1e2d4d] rounded-xl p-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#94a3b8] shrink-0">Leitura</dt>
                  <dd className="text-white font-medium text-right">{active.searchDepthLabel}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-2">
                  <dt className="text-[#94a3b8] shrink-0">Foco tático</dt>
                  <dd className="text-[#e2e8f0] font-medium text-right">{active.tacticalFocus}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-2">
                  <dt className="text-[#94a3b8] shrink-0">Precisão</dt>
                  <dd className="text-[#a78bfa] font-medium text-right">{active.precisionLabel}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-2">
                  <dt className="text-[#94a3b8] shrink-0">Combate na arena</dt>
                  <dd className="text-[#22d3ee] font-medium text-right">{active.combatProfileLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[#94a3b8]">Modo de jogo</div>
                <div className="text-white font-semibold mt-0.5">Jogador vs Computador</div>
              </div>
              <div>
                <div className="text-[#94a3b8]">Combate físico</div>
                <div className="text-white font-semibold mt-0.5">6 socos · Agarrão · 10s</div>
              </div>
            </div>
          </section>

          {/* CARTÃO DIREITO: Seletor de dificuldade + Descrição dinâmica + Botão JOGAR */}
          <section
            aria-label="Configuração de dificuldade do computador"
            className="lg:col-span-7 bg-[#0e1529] border border-[#06b6d4]/25 rounded-2xl p-6 md:p-7 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Dificuldade do computador
                </h2>
                <span className="text-xs md:text-sm font-semibold text-[#22d3ee] font-mono-tabular whitespace-nowrap">
                  Nível {active.level} · {active.name}
                </span>
              </div>

              {/* 4 botões selecionáveis */}
              <div
                role="group"
                aria-label="Selecionar nível de dificuldade"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5"
              >
                {LEVELS.map((lvl) => {
                  const info = AI_DIFFICULTIES[lvl];
                  const isSelected = difficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      aria-pressed={isSelected}
                      data-difficulty={lvl}
                      onClick={() => onSelectDifficulty(lvl)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#0891b2] to-[#2563eb] border-[#22d3ee] text-white shadow-md'
                          : 'bg-[#121a33] border-[#1e2d4d] text-[#cbd5e1] hover:border-[#06b6d4]/50 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-mono-tabular opacity-85">
                        Nível {lvl}
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap truncate mt-0.5">
                        {info.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slider sincronizado */}
              <div className="mb-6">
                <label htmlFor="ai-difficulty-slider" className="sr-only">
                  Controle deslizante de dificuldade da IA
                </label>
                <input
                  id="ai-difficulty-slider"
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={difficulty}
                  onChange={(e) => onSelectDifficulty(Number(e.target.value) as AiDifficulty)}
                  className="w-full accent-[#06b6d4] cursor-pointer h-2 rounded-lg bg-[#1e293b]"
                />
                <div className="grid grid-cols-4 text-[11px] text-[#94a3b8] mt-1.5 font-mono-tabular">
                  <span className="text-left whitespace-nowrap">
                    1 <span className="hidden sm:inline">· Fácil</span>
                  </span>
                  <span className="text-center whitespace-nowrap">
                    2 <span className="hidden sm:inline">· Médio</span>
                  </span>
                  <span className="text-center whitespace-nowrap">
                    3 <span className="hidden sm:inline">· Difícil</span>
                  </span>
                  <span className="text-right whitespace-nowrap">
                    4 <span className="hidden sm:inline">· Extra Difícil</span>
                  </span>
                </div>
              </div>

              {/* Seção dinâmica "Como a IA joga neste nível" */}
              <div className="bg-[#121a33] border border-[#06b6d4]/20 rounded-xl p-4 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#22d3ee] mb-1.5">
                  Como a IA joga neste nível
                </h3>
                <p className="text-sm text-[#e2e8f0] leading-relaxed">
                  {active.playStyleDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              data-start="true"
              onClick={onStartMatch}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] active:from-[#0891b2] active:to-[#1d4ed8] text-white font-display font-bold text-base md:text-lg tracking-wide transition-all cursor-pointer shadow-[0_10px_28px_rgba(6,182,212,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>JOGAR – NÍVEL {active.level}</span>
            </button>
          </section>
        </div>

        {/* Rodapé informativo + seção expansível */}
        <footer className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm text-[#94a3b8]">
            <p>
              A dificuldade escolhida é salva automaticamente neste dispositivo.
            </p>
            <button
              type="button"
              aria-expanded={comparisonOpen}
              onClick={() => setComparisonOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-[#22d3ee] hover:text-white font-semibold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
            >
              <span>O que muda entre os níveis?</span>
              {comparisonOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {comparisonOpen && (
            <div className="bg-[#0e1529] border border-[#06b6d4]/25 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LEVELS.map((lvl) => {
                const info = AI_DIFFICULTIES[lvl];
                const isSelected = difficulty === lvl;
                return (
                  <div
                    key={lvl}
                    className={`rounded-xl p-3.5 border ${
                      isSelected
                        ? 'bg-[#132042] border-[#06b6d4]/60'
                        : 'bg-[#111930] border-white/10'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#22d3ee] font-mono-tabular">
                      Nível {lvl} – {info.name}
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-1.5 leading-relaxed">
                      {info.comparisonSummary}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
