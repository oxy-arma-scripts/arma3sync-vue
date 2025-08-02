import type { GameState } from '~/app/models/game/types';

export const useGameStore = defineStore('game', () => {
  const {
    value: gameState,
    loading,
  } = useIPCBridge<GameState>('game');

  async function startGame() {
    await window.ipc.methods.startGame();
  }

  return {
    gameState,
    loading,
    startGame,
  };
});
