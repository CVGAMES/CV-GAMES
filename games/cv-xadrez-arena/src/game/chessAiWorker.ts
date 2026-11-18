import { chooseBestMove, type AiMoveChoice } from './chessAi';
import type { AiDifficulty } from './constants';

interface ChessAiSearchRequest {
  id: number;
  fen: string;
  difficulty: AiDifficulty;
  randomSeed: number;
}

interface ChessAiSearchResponse {
  id: number;
  choice: AiMoveChoice | null;
  error?: string;
}

const workerScope = self as unknown as {
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<ChessAiSearchRequest>) => void,
  ) => void;
  postMessage: (message: ChessAiSearchResponse) => void;
};

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

workerScope.addEventListener('message', (event) => {
  const request = event.data;
  try {
    const choice = chooseBestMove(
      request.fen,
      request.difficulty,
      createSeededRandom(request.randomSeed),
    );
    workerScope.postMessage({ id: request.id, choice });
  } catch (error) {
    workerScope.postMessage({
      id: request.id,
      choice: null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
