import type { ModsetsState, Modset } from '~/app/models/modsets/types';

export type DisplayModset = Omit<Modset, 'mods'> & {
  mods: {
    id: string;
    active: boolean;
    notFound: boolean;
  }[];
  enabledCount: number;
};

async function createModset(modset: Modset): Promise<void> {
  await window.ipc.methods.modsets.add(toRawDeep(modset));
}

async function updateModset(modset: Modset): Promise<void> {
  await window.ipc.methods.modsets.edit(toRawDeep(modset));
}

async function deleteModset(modset: Modset): Promise<void> {
  await window.ipc.methods.modsets.remove(toRawDeep(modset));
}

async function applyModset(modset: Modset): Promise<void> {
  await window.ipc.methods.modsets.apply(toRawDeep(modset));
}

async function unapplyModset(modset: Modset): Promise<void> {
  await window.ipc.methods.modsets.unapply(toRawDeep(modset));
}

export const useModsetsStore = defineStore('modsets', () => {
  const modStore = useModsStore();

  const {
    value: modsetsState,
    isSynced,
    loading,
  } = useIPCBridge<ModsetsState>('modsets');

  const modIds = computed(() => new Set(Object.keys(modStore.mods.list)));

  const activeModIds = computed(
    () => new Set(modStore.mods.active.map(({ id }) => id))
  );

  const modsets = computed(
    (): DisplayModset[] =>
      modsetsState.value?.modsets.map((set) => {
        let enabledCount = 0;
        const mods = set.mods.map((mod) => {
          const active = activeModIds.value.has(mod.id);
          if (active) {
            enabledCount += 1;
          }

          return {
            ...mod,
            active,
            notFound: !modIds.value.has(mod.id),
          };
        });

        return {
          ...set,
          mods,
          enabledCount,
        };
      }) ?? []
  );

  return {
    modsetsState,
    modsets,
    isSynced,
    loading,
    createModset,
    updateModset,
    deleteModset,
    applyModset,
    unapplyModset,
  };
});
