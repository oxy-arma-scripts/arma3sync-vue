import type { GameState } from '~/app/models/game/types';

async function startGame(): Promise<void> {
  await window.ipc.methods.game.start();
}

export const useGameStore = defineStore('game', () => {
  const { value: gameState, loading } = useIPCBridge<GameState>('game');

  return {
    gameState,
    loading,
    startGame,
  };
});
