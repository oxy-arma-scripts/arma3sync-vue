<template>
  <v-btn
    :disabled="disabled"
    text="Play"
    prepend-icon="mdi-play"
    color="success"
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
  () => !settings.value?.gamePath
        || gameState.value?.isRunning
        || !isSynced.value,
);
</script>
