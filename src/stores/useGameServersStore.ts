import type {
  GameServer,
  GameServersState,
} from '~/app/models/gameServers/types';

async function createServer(server: GameServer): Promise<void> {
  await window.ipc.methods.gameServers.add(toRawDeep(server));
}

async function updateServer(server: GameServer): Promise<void> {
  await window.ipc.methods.gameServers.edit(toRawDeep(server));
}

async function deleteServer(server: GameServer): Promise<void> {
  await window.ipc.methods.gameServers.remove(toRawDeep(server));
}

export const useGameServersStore = defineStore('game-servers', () => {
  const {
    value: serversState,
    loading,
    isSynced,
  } = useIPCBridge<GameServersState>('gameServers');

  return {
    serversState,
    loading,
    isSynced,
    createServer,
    updateServer,
    deleteServer,
  };
});
