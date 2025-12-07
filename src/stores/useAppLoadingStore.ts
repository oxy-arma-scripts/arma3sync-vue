import type { LoadingState } from '~/app/models/loadingState/types';

export const useAppLoadingStore = defineStore('app-loading', () => {
  const { value: loadingState } = useIPCBridge<LoadingState>('loadingState');

  const current = computed<string>(() => {
    if (!loadingState.value) {
      return;
    }

    const entries = Object.entries(loadingState.value);
    return entries.find(([, val]) => !val)?.[0];
  });

  const progress = computed<number>(() => {
    if (!loadingState.value) {
      return 0;
    }

    const values = Object.values(loadingState.value);
    const loaded = values.filter((val) => !!val).length;
    return loaded / values.length;
  });

  const complete = computed<boolean>(() => progress.value === 1);

  return {
    state: computed(() => loadingState.value),
    progress,
    complete,
    current,
  };
});
