import type { Mod, ModSource, ModsState } from '~/app/models/mods/types';

import { renderLogger } from '~/lib/logger';
import toRawDeep from '~/utils/toRawDeep';

type DisplayMod = Omit<Mod & { active: boolean }, 'source'>;
export type DisplayModSource = ModSource & {
  mods: DisplayMod[];
  enabledCount: number;
};

function createModSourceFromPicker(): Promise<ModSource[]> {
  return window.ipc.methods.openModSourcePicker();
}

async function createModSource(source: ModSource): Promise<void> {
  await window.ipc.methods.addModSources([toRawDeep(source)]);
}

async function updateModSource(source: ModSource): Promise<void> {
  await window.ipc.methods.editModSource(toRawDeep(source));
}

async function removeModSource(source: ModSource): Promise<void> {
  await window.ipc.methods.removeModSource(toRawDeep(source));
}

async function openModSourceFolder(source: ModSource): Promise<void> {
  const error = await window.ipc.methods.openModSourceFolder(toRawDeep(source));
  if (error) {
    renderLogger.error('Failed to open source folder', { error });
  }
}

export const useModsStore = defineStore('mods', () => {
  const { locale } = useI18n();

  const { value: mods, isSynced, loading } = useIPCBridge<ModsState>('mods');

  const sources = computed(() => {
    if (!mods.value) {
      return [];
    }

    const res = new Map<string, DisplayModSource>(
      mods.value.sources.map((source) => [
        source.name,
        {
          ...source,
          mods: [] as DisplayMod[],
          enabledCount: 0,
        },
      ]) ?? []
    );

    const activeMods = new Set(mods.value.active);

    // Map mods to sources

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

    // Sort mods
    const collator = new Intl.Collator(locale.value);

    const nativeComparator = (modA: DisplayMod, modB: DisplayMod): number =>
      collator.compare(modA.name, modB.name);

    const comparator = (modA: DisplayMod, modB: DisplayMod): number =>
      collator.compare(modA.subpath, modB.subpath);

    for (const entry of res.values()) {
      entry.mods.sort(entry.native ? nativeComparator : comparator);
    }

    return [...res.values()];
  });

  const activeMods = computed(() => {
    if (!mods.value) {
      return [];
    }

    return mods.value.active
      .map((id) => mods.value.list[id])
      .toSorted((modA, modB) =>
        modA.name.localeCompare(modB.name, locale.value)
      );
  });

  function setModActive(
    mod: { id: string; active: boolean },
    value: boolean
  ): void {
    if (!mods.value) {
      return;
    }

    mod.active = value;

    if (value) {
      mods.value.active.push(mod.id);
      return;
    }
    mods.value.active = mods.value.active.filter((id) => id !== mod.id);
  }

  return {
    mods,
    sources,
    activeMods,
    isSynced,
    loading,
    setModActive,
    createModSourceFromPicker,
    createModSource,
    updateModSource,
    removeModSource,
    openModSourceFolder,
  };
});
