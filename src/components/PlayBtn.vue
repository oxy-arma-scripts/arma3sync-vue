<template>
  <div class="d-flex align-center ga-4">
    <GameServerSelect v-model="currentGameServer" />

    <v-btn
      :text="$t('play')"
      :disabled="disabled"
      :color="disabled ? 'grey' : 'success'"
      prepend-icon="mdi-play"
      size="x-large"
      variant="flat"
      @click="gameStore.startGame({ gameServer: currentGameServer })"
    />
  </div>
</template>

<script setup lang="ts">
import type { GameServer } from '~/app/models/gameServers/types';

const gameStore = useGameStore();

const { gameState } = storeToRefs(gameStore);
const { settings, isSynced: settingsIsSynced } =
  storeToRefs(useSettingsStore());

const currentGameServer = ref<GameServer | undefined>();

const disabled = computed(
  () =>
    !settings.value?.game.path ||
    gameState.value?.isRunning ||
    !settingsIsSynced.value
);
</script>
