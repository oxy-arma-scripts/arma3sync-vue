<template>
  <v-overlay
    :model-value="!loadingStore.complete"
    persistent
    absolute
    class="align-center justify-center"
  >
    <v-alert
      :title="`${$t(`loading.${loadingStore.current || 'unknown'}`)} (${percent})`"
      color="primary"
    >
      <template #prepend>
        <v-progress-circular indeterminate />
      </template>
    </v-alert>
  </v-overlay>

  <template v-if="loadingStore.complete">
    <slot />
  </template>
</template>

<script setup lang="ts">
const loadingStore = useAppLoadingStore();

const percent = computed(
  () => loadingStore.progress.toLocaleString(undefined, {
    style: 'percent',
    maximumFractionDigits: 0,
  }),
);
</script>
