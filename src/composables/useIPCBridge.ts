import hash from 'object-hash';

const hashVueObject = (obj: hash.NotUndefined) => hash(toRaw(obj));

export default function useIPCBridge<T extends hash.NotUndefined>(
  key: keyof typeof window.ipc.bridges,
  onUpdate?: (value: T) => void,
) {
  const loading = shallowRef(true);
  const localValue = ref<T | null>(null);
  const localHash = shallowRef<string>('');
  const remoteHash = shallowRef<string>('');

  const isSynced = computed(() => localHash.value === remoteHash.value);

  const updateLocalValue = (value: T) => {
    localValue.value = value;
    remoteHash.value = hashVueObject(value);
    onUpdate?.(value);
  };

  const bridge = window.ipc.bridges[key];
  // Listen to updates from backend
  bridge.watch((value) => {
    updateLocalValue(value as T);
  });
  // Set the initial value
  onMounted(async () => {
    const value = await bridge.get();
    updateLocalValue(value as T);
    loading.value = false;
  });

  // Notify updates if possible
  if ('set' in bridge) {
    // Calculate hash after updates
    watch(localValue, (value) => {
      localHash.value = hashVueObject(value);
    }, { deep: true });

    watchDebounced(localValue, (value) => {
      if (isSynced.value) {
        return;
      }
      bridge.set(toRaw(value));
    }, { debounce: 500, deep: true });
  }

  return {
    value: localValue,
    isSynced,
    loading,
  };
}
