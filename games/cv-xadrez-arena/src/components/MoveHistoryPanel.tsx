import { useEffect, useRef } from 'react';
import { History, X } from 'lucide-react';
import type { ChessStatus, MoveHistoryEntry } from '../game/chessRules';
import {
  AI_DIFFICULTIES,
  PIECE_LABELS,
  type AiDifficulty,
  type PieceType,
  type PlayerColor,
} from '../game/constants';

interface MoveHistoryPanelProps {
  moves: MoveHistoryEntry[];
  status: ChessStatus;
  difficulty: AiDifficulty;
  humanColor: PlayerColor;
  capturedByWhite: number;
  capturedByBlack: number;
  capturedByHuman: number;
  capturedByAi: number;
  onClose: () => void;
}

interface TurnGroup {
  moveNumber: number;
  white?: MoveHistoryEntry;
  black?: MoveHistoryEntry;
}

const WHITE_PIECE_GLYPHS: Record<PieceType, string> = {
  p: '♙',
  n: '♘',
  b: '♗',
  r: '♖',
  q: '♕',
  k: '♔',
};

const BLACK_PIECE_GLYPHS: Record<PieceType, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

function groupMovesByTurn(moves: MoveHistoryEntry[]): TurnGroup[] {
  const groups: TurnGroup[] = [];
  for (const entry of moves) {
    let group = groups[groups.length - 1];
    if (!group || group.moveNumber !== entry.moveNumber) {
      group = { moveNumber: entry.moveNumber };
      groups.push(group);
    }
    if (entry.color === 'w') {
      group.white = entry;
    } else {
      group.black = entry;
    }
  }
  return groups;
}

function MoveLine({
  entry,
  humanColor,
  showNumber,
}: {
  entry: MoveHistoryEntry;
  humanColor: PlayerColor;
  showNumber?: number;
}) {
  const isWhite = entry.color === 'w';
  const isHuman = entry.color === humanColor;
  const pieceName = PIECE_LABELS[entry.piece];
  const promoSuffix = entry.promotion ? ` (= ${PIECE_LABELS[entry.promotion]})` : '';

  return (
    <div className="flex items-start justify-between gap-2 text-xs leading-snug">
      <div className="flex items-baseline gap-1.5 min-w-0">
        {showNumber !== undefined ? (
          <span className="font-mono-tabular text-[#64748b] w-5 shrink-0 text-right">
            {showNumber}.
          </span>
        ) : (
          <span className="w-5 shrink-0" aria-hidden="true" />
        )}
        <span
          className={`w-2 h-2 rounded-[2px] shrink-0 self-center border ${
            isWhite ? 'bg-[#f8fafc] border-[#38bdf8]' : 'bg-[#111827] border-[#94a3b8]'
          }`}
          aria-hidden="true"
        />
        <span className="text-[#e2e8f0] break-words">
          <strong className={isWhite ? 'text-white' : 'text-[#cbd5e1]'}>
            {isWhite ? 'Brancas' : 'Pretas'}:
          </strong>{' '}
          {pieceName}{' '}
          <span className="font-mono-tabular font-semibold text-[#22d3ee]">
            {entry.from.toUpperCase()} → {entry.to.toUpperCase()}
          </span>
          <span className="ml-1 font-mono-tabular text-[11px] text-[#94a3b8]">
            ({entry.san})
          </span>
          {entry.captured && (
            <span className="ml-1 text-[11px] font-medium text-[#f87171]">
              × {PIECE_LABELS[entry.captured]}
            </span>
          )}
          {promoSuffix && <span className="text-[#a78bfa]">{promoSuffix}</span>}
        </span>
      </div>
      <span
        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
          isHuman
            ? 'bg-[#0891b2]/20 border-[#22d3ee]/45 text-[#22d3ee]'
            : 'bg-[#2563eb]/20 border-[#60a5fa]/35 text-[#93c5fd]'
        }`}
      >
        {isHuman ? 'Você' : 'IA'}
      </span>
    </div>
  );
}

export function MoveHistoryPanel({
  moves,
  status,
  difficulty,
  humanColor,
  capturedByWhite,
  capturedByBlack,
  capturedByHuman,
  capturedByAi,
  onClose,
}: MoveHistoryPanelProps) {
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const groups = groupMovesByTurn(moves);
  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;
  const diffInfo = AI_DIFFICULTIES[difficulty];

  const capturedByWhiteGlyphs = moves
    .filter((m) => m.color === 'w' && m.captured)
    .map((m) => BLACK_PIECE_GLYPHS[m.captured!]);
  const capturedByBlackGlyphs = moves
    .filter((m) => m.color === 'b' && m.captured)
    .map((m) => WHITE_PIECE_GLYPHS[m.captured!]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [moves.length]);

  return (
    <aside
      data-testid="move-history-panel"
      aria-label="Informações e histórico da partida"
      className="pointer-events-auto fixed left-3 right-3 sm:left-auto sm:right-5 top-36 sm:top-20 z-20 sm:w-[390px] max-h-[calc(100vh-13rem)] sm:max-h-[calc(100vh-11rem)] flex flex-col bg-[#0a1022] border border-[#06b6d4]/45 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.72)] overflow-hidden cv-animate-in"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1e2d4d] bg-[#0e1529]">
        <div className="flex items-center gap-2 min-w-0">
          <History className="w-4 h-4 text-[#22d3ee] shrink-0" />
          <h2 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.14em] text-white truncate">
            INFORMAÇÕES DA PARTIDA
          </h2>
        </div>

        <button
          type="button"
          tabIndex={-1}
          data-testid="move-history-close-btn"
          aria-label="Fechar painel da partida"
          title="Fechar [TAB]"
          onClick={(e) => {
            e.currentTarget.blur();
            onClose();
          }}
          className="p-1.5 rounded-lg bg-[#121a33] hover:bg-[#1e2d4d] border border-white/10 text-[#94a3b8] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Resumo da Partida */}
      <div className="px-3.5 py-2.5 border-b border-[#1e2d4d] bg-[#0c1428] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#121a33] border border-[#1e2d4d] px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Lance atual</div>
            <div
              data-testid="tab-panel-move-number"
              className="text-xs sm:text-sm font-semibold font-mono-tabular text-white mt-0.5"
            >
              Lance {status.moveNumber}
            </div>
          </div>

          <div className="rounded-lg bg-[#121a33] border border-[#1e2d4d] px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Último lance</div>
            <div
              data-testid="tab-panel-last-move"
              className="text-xs sm:text-sm font-semibold font-mono-tabular text-[#22d3ee] mt-0.5 truncate"
            >
              {lastMove
                ? `${lastMove.san} (${lastMove.from.toUpperCase()}→${lastMove.to.toUpperCase()})`
                : 'Nenhum'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-0.5">
          <span className={status.inCheck ? 'font-semibold text-[#f87171]' : 'text-[#cbd5e1]'}>
            {status.outcomeText}
          </span>
          <span className="text-[#93c5fd] font-medium">
            Nível {difficulty} · {diffInfo.name}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-[#94a3b8] px-0.5">
          <span>
            Você:{' '}
            <strong className="text-[#22d3ee]">
              {humanColor === 'w' ? 'Brancas' : 'Pretas'}
            </strong>
          </span>
          <span>
            Computador:{' '}
            <strong className="text-[#93c5fd]">
              {humanColor === 'w' ? 'Pretas' : 'Brancas'}
            </strong>
          </span>
        </div>

        {/* Capturas por lado (Brancas/Pretas e Você/IA) */}
        <div
          data-testid="tab-panel-captures"
          className="rounded-lg bg-[#121a33] border border-[#1e2d4d] px-2.5 py-2 space-y-1.5"
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#94a3b8]">
            <span>Capturas</span>
            <span className="font-mono-tabular text-[#cbd5e1]">
              Você {capturedByHuman} · IA {capturedByAi}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between gap-1 bg-[#0a1022]/80 rounded px-2 py-1 border border-white/5">
              <span className="text-[#e2e8f0] truncate">
                Brancas <span className="text-[10px] text-[#94a3b8]">({humanColor === 'w' ? 'Você' : 'IA'})</span>
              </span>
              <span className="font-mono-tabular font-bold text-[#22d3ee]">{capturedByWhite}</span>
            </div>
            <div className="flex items-center justify-between gap-1 bg-[#0a1022]/80 rounded px-2 py-1 border border-white/5">
              <span className="text-[#e2e8f0] truncate">
                Pretas <span className="text-[10px] text-[#94a3b8]">({humanColor === 'b' ? 'Você' : 'IA'})</span>
              </span>
              <span className="font-mono-tabular font-bold text-[#60a5fa]">{capturedByBlack}</span>
            </div>
          </div>
          {(capturedByWhiteGlyphs.length > 0 || capturedByBlackGlyphs.length > 0) && (
            <div className="flex flex-col gap-0.5 text-xs leading-none pt-0.5">
              {capturedByWhiteGlyphs.length > 0 && (
                <div className="text-[#cbd5e1] truncate">
                  <span className="text-[10px] text-[#94a3b8] mr-1">Brancas capturaram:</span>
                  {capturedByWhiteGlyphs.join(' ')}
                </div>
              )}
              {capturedByBlackGlyphs.length > 0 && (
                <div className="text-[#cbd5e1] truncate">
                  <span className="text-[10px] text-[#94a3b8] mr-1">Pretas capturaram:</span>
                  {capturedByBlackGlyphs.join(' ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Histórico Completo de Lances */}
      <div className="overflow-y-auto px-3.5 py-2.5 space-y-2 flex-1">
        {groups.length === 0 ? (
          <div
            data-testid="move-history-empty"
            className="text-xs text-[#94a3b8] text-center py-5 px-3"
          >
            Nenhum lance registrado ainda. O histórico será atualizado após cada jogada legal concluída.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.moveNumber}
              className="rounded-xl bg-[#0e1529]/85 border border-[#1e2d4d] px-2.5 py-2 space-y-1.5"
            >
              {group.white && (
                <MoveLine
                  entry={group.white}
                  humanColor={humanColor}
                  showNumber={group.moveNumber}
                />
              )}
              {group.black && (
                <MoveLine
                  entry={group.black}
                  humanColor={humanColor}
                  showNumber={group.white ? undefined : group.moveNumber}
                />
              )}
            </div>
          ))
        )}
        <div ref={listEndRef} />
      </div>

      <div className="px-3.5 py-2 border-t border-[#1e2d4d] bg-[#0a1022] flex items-center justify-between text-[11px] text-[#94a3b8]">
        <span>Total: {moves.length} {moves.length === 1 ? 'lance' : 'lances'}</span>
        <span className="text-[#38bdf8] font-medium">TAB para fechar</span>
      </div>
    </aside>
  );
}
