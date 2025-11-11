import type { Ref, ShallowRef, ComputedRef } from 'vue';

import hash from 'object-hash';

import toRawDeep from '~/utils/toRawDeep';

const hashVueObject = (obj: hash.NotUndefined): string => hash(toRawDeep(obj));

type IPCBridgeComposable<Type extends hash.NotUndefined> = {
  value: Ref<Type | null>;
  isSynced: ComputedRef<boolean>;
  loading: ShallowRef<boolean>;
};

export default function useIPCBridge<Type extends hash.NotUndefined>(
  key: keyof typeof window.ipc.bridges,
  onUpdate?: (value: Type) => void
): IPCBridgeComposable<Type> {
  const loading = shallowRef(true);
  const localValue = ref<Type | null>(null);
  const localHash = shallowRef<string>('');
  const remoteHash = shallowRef<string>('');

  const isSynced = computed<boolean>(
    () => localHash.value === remoteHash.value
  );

  const updateLocalValue = (value: Type): void => {
    localValue.value = value;
    remoteHash.value = hashVueObject(value);
    onUpdate?.(value);
  };

  const bridge = window.ipc.bridges[key];
  // Listen to updates from backend
  bridge.watch((value) => {
    updateLocalValue(value as Type);
  });
  // Set the initial value
  onMounted(async () => {
    const value = await bridge.get();
    updateLocalValue(value as Type);
    loading.value = false;
  });

  // Notify updates if possible
  if ('set' in bridge) {
    // Calculate hash after updates
    watch(
      localValue,
      (value) => {
        localHash.value = hashVueObject(value);
      },
      { deep: true }
    );

    watchDebounced(
      localValue,
      (value) => {
        if (isSynced.value) {
          return;
        }
        bridge.set(toRaw(value));
      },
      { debounce: 500, deep: true }
    );
  }

  return {
    value: localValue,
    isSynced,
    loading,
  };
}
