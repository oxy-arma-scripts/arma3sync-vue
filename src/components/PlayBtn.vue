<template>
  <v-btn
    :text="$t('play')"
    :disabled="disabled"
    :color="disabled ? 'grey' : 'success'"
    prepend-icon="mdi-play"
    size="x-large"
    variant="flat"
    @click="gameStore.startGame()"
  />
</template>

<script setup lang="ts">
const gameStore = useGameStore();

const { settings, isSynced } = storeToRefs(useSettingsStore());
const { gameState } = storeToRefs(gameStore);

const disabled = computed(
  () =>
    !settings.value?.game.path || gameState.value?.isRunning || !isSynced.value
);
</script>
