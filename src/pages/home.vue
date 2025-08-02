<template>
  <v-container>
    <v-row>
      <v-col>
        <v-toolbar
          title="Mods sources"
          color="transparent"
        >
          <template #append>
            <v-slide-x-reverse-transition>
              <div v-if="!isSynced" class="text-red mr-4">
                Not synced
              </div>
            </v-slide-x-reverse-transition>

            <v-btn
              text="Add"
              append-icon="mdi-folder-plus"
              variant="tonal"
              color="green"
              @click="() => {}"
            />
          </template>
        </v-toolbar>

        <v-progress-linear
          v-if="loading"
          color="primary"
          indeterminate
          rounded
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-expansion-panels multiple>
          <template v-for="source in sources">
            <v-expansion-panel
              v-if="source.mods.length > 0"
              :key="source.name"
              :value="source.name"
            >
              <template #title>
                <v-row no-gutters class="ga-3">
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="SOURCE_ICONS[source.name] || 'mdi-folder'"
                      start
                    />

                    {{ source.name }}
                  </div>

                  <v-spacer />

                  <div class="d-flex align-center justify-end text-caption text-disabled">
                    <template v-if="source.enabledCount > 0">
                      {{ source.enabledCount }} enabled -
                    </template>
                    {{ source.mods.length }} mods
                  </div>

                  <div class="text-end mr-2">
                    <v-btn
                      v-if="!source.mandatory"
                      v-tooltip:top="'Delete source'"
                      icon="mdi-delete"
                      density="comfortable"
                      variant="text"
                      size="small"
                      color="red"
                      class="ml-2"
                      @click.stop="() => {}"
                    />
                    <v-btn
                      v-tooltip:top="'Open folder'"
                      icon="mdi-folder"
                      density="comfortable"
                      variant="text"
                      size="small"
                      class="ml-2"
                      @click.stop="() => {}"
                    />
                  </div>
                </v-row>
              </template>

              <template #text>
                <div style="max-height: 500px; overflow-y: auto;">
                  <v-checkbox
                    v-for="mod in source.mods"
                    :key="mod.name"
                    :model-value="mod.active"
                    :label="mod.name"
                    density="compact"
                    hide-details
                    @update:model-value="setModActive(mod, $event)"
                  />
                </div>
              </template>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Mod, ModSource, ModsState } from '~/app/models/mods/types';

type DisplayMod = Omit<Mod & { active: boolean }, 'source'>;
type ModSourceWithMods = ModSource & {
  mods: DisplayMod[],
  enabledCount: number,
};

const SOURCE_ICONS: Record<string, string> = {
  'Creator DLCs': 'mdi-puzzle',
  'Steam Workshop': 'mdi-steam',
};

const {
  value: mods,
  isSynced,
  loading,
} = useIPCBridge<ModsState>('mods');

const sources = computed(() => {
  if (!mods.value) {
    return [];
  }

  const activeMods = new Set(mods.value.active);
  const res = new Map<string, ModSourceWithMods>();

  // eslint-disable-next-line no-restricted-syntax
  for (const { source, ...mod } of Object.values(mods.value.list)) {
    const entry: ModSourceWithMods = {
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

function setModActive(mod: { id: string }, value: boolean) {
  if (!mods.value) {
    return;
  }

  if (value) {
    mods.value.active.push(mod.id);
    return;
  }
  mods.value.active = mods.value.active.filter((id) => id !== mod.id);
}
</script>
