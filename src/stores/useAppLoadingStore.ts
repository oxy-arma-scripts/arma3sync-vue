import type { LoadingState } from '~/app/models/loadingState/types';

export const useAppLoadingStore = defineStore('app-loading', () => {
  const {
    value: loadingState,
  } = useIPCBridge<LoadingState>('loadingState');

  const current = computed(() => {
    if (!loadingState.value) {
      return undefined;
    }

    const entries = Object.entries(loadingState.value);
    return entries.find(([, v]) => !v)?.[0];
  });

  const progress = computed(() => {
    if (!loadingState.value) {
      return 0;
    }

    const values = Object.values(loadingState.value);
    const loaded = values.filter((v) => !!v).length;
    return loaded / values.length;
  });

  const complete = computed(() => progress.value === 1);

  return {
    state: computed(() => loadingState.value),
    progress,
    complete,
    current,
  };
});
