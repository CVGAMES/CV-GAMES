import { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import type { LoadingProgressState } from '../game/loadingProgress';
import { CvBrandMark } from './CvBrandMark';

interface LoadingScreenProps {
  loadingState: LoadingProgressState;
  onRetry: () => void;
  onComplete: () => void;
}

export function LoadingScreen({
  loadingState,
  onRetry,
  onComplete,
}: LoadingScreenProps) {
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!loadingState.ready || loadingState.error) {
      completedRef.current = false;
      return;
    }
    if (completedRef.current) return;
    const t = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    }, 180);
    return () => window.clearTimeout(t);
  }, [loadingState.ready, loadingState.error]);

  return (
    <div
      data-testid="loading-screen"
      className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#060b18] text-[#f1f5f9] px-6"
    >
      <div className="w-full max-w-md flex flex-col items-center text-center cv-animate-in">
        <div className="mb-8">
          <CvBrandMark size="hero" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          CV XADREZ <span className="text-[#22d3ee]">ARENA 3D</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#a78bfa] mt-2.5">
          UMA BATALHA DE ESTRATÉGIA E FÍSICA
        </p>

        {!loadingState.error ? (
          <div className="w-full mt-10 bg-[#0e1529]/85 border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2">
              <span className="font-semibold text-[#e2e8f0]">Preparando a arena...</span>
              <span
                data-testid="loading-percent"
                className="font-mono-tabular text-[#22d3ee] font-bold"
              >
                {loadingState.progress}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#060b18] border border-[#1e2d4d] overflow-hidden">
              <div
                data-testid="loading-bar"
                className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] via-[#2563eb] to-[#8b5cf6] transition-all duration-150"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>

            <div
              data-testid="loading-stage"
              className="text-xs text-[#94a3b8] mt-3 font-medium tracking-wide"
            >
              {loadingState.stageLabel}
            </div>
          </div>
        ) : (
          <div
            data-testid="loading-error"
            className="w-full mt-9 bg-[#1a1026] border border-[#f87171]/45 rounded-2xl p-5 text-center shadow-xl"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#fca5a5] mb-1.5">
              Falha ao carregar a arena
            </div>
            <p className="text-xs sm:text-sm text-[#e2e8f0] leading-relaxed mb-4">
              {loadingState.error}
            </p>
            <button
              type="button"
              data-testid="loading-retry-btn"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
