import type { Mod, ModSource, ModsState } from '~/app/models/mods/types';

import logger from '~/lib/logger';

type DisplayMod = Omit<Mod & { active: boolean }, 'source'>;
type DisplayModSource = ModSource & {
  mods: DisplayMod[],
  enabledCount: number,
};

export const useModsStore = defineStore('mods', () => {
  const {
    value: mods,
    isSynced,
    loading,
  } = useIPCBridge<ModsState>('mods');

  const sources = computed(() => {
    if (!mods.value) {
      return [];
    }

    const res = new Map<string, DisplayModSource>(
      mods.value.sources.map((source) => [source.name, {
        ...source,
        mods: [] as DisplayMod[],
        enabledCount: 0,
      }]) ?? [],
    );

    const activeMods = new Set(mods.value.active);

    // eslint-disable-next-line no-restricted-syntax
    for (const { source, ...mod } of Object.values(mods.value.list)) {
      const entry: DisplayModSource = {
        mods: [],
        enabledCount: 0,
        ...source,
        ...res.get(source.name),
      };
      const item = { ...mod, active: activeMods.has(mod.id) };

      entry.mods.push(item);
      entry.enabledCount += item.active ? 1 : 0;

      res.set(source.name, entry);
    }

    return [...res.values()];
  });

  const activeMods = computed(() => {
    if (!mods.value) {
      return [];
    }

    return mods.value.active.map((id) => mods.value.list[id]);
  });

  function setModActive(mod: { id: string, active: boolean }, value: boolean) {
    if (!mods.value) {
      return;
    }

    // eslint-disable-next-line no-param-reassign
    mod.active = value;

    if (value) {
      mods.value.active.push(mod.id);
      return;
    }
    mods.value.active = mods.value.active.filter((id) => id !== mod.id);
  }

  async function openModSourcePicker() {
    await window.ipc.methods.addModSource();
  }

  async function removeModSource(source: ModSource) {
    await window.ipc.methods.removeModSource(toRaw(source));
  }

  async function openModSourceFolder(source: ModSource) {
    const error = await window.ipc.methods.openModSourceFolder(source);
    if (error) {
      logger.error('Failed to source folder', { error });
    }
  }

  return {
    mods,
    sources,
    activeMods,
    isSynced,
    loading,
    setModActive,
    openModSourcePicker,
    removeModSource,
    openModSourceFolder,
  };
});
