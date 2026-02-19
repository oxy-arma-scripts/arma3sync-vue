import type { GameState, StartGameOptions } from '~/app/models/game/types';

async function startGame(options?: StartGameOptions): Promise<void> {
  await window.ipc.methods.game.start(toRawDeep(options));
}

export const useGameStore = defineStore('game', () => {
  const { value: gameState, loading } = useIPCBridge<GameState>('game');

  return {
    gameState,
    loading,
    startGame,
  };
});
