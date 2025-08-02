<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-row>
          <v-col>
            <v-card
              :loading="loading && 'primary'"
              title="Enabled mods"
              prepend-icon="mdi-toy-brick-outline"
            >
              <template #append>
                <span v-if="activeMods.length > 0" class="text-caption text-disabled">
                  {{ activeMods.length }} mods
                </span>
              </template>

              <template #text>
                <v-empty-state
                  v-if="activeMods.length === 0"
                  icon="mdi-toy-brick-search"
                  title="No mods enabled"
                  text="Browse mod sources on the right to enable some mods !"
                />

                <v-slide-x-transition v-else tag="v-list" group>
                  <v-list-item
                    v-for="mod in activeMods"
                    :key="mod.id"
                    :title="mod.name"
                    :subtitle="mod.source.name"
                    density="compact"
                  />
                </v-slide-x-transition>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col>
        <v-row>
          <v-col>
            <v-toolbar
              title="Mods sources"
              color="transparent"
            >
              <template #prepend>
                <v-icon icon="mdi-folder-outline" />
              </template>

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
                  @click="openModSourcePicker()"
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

            <v-empty-state
              v-if="sources.length === 0"
              icon="mdi-folder-search"
              title="No mod sources found"
              text="Add a source folder with the 'Add' button to start using mods !"
            />

            <v-expansion-panels v-else multiple>
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
                          @click.stop="removeModSource(source)"
                        />
                        <v-btn
                          v-tooltip:top="'Open folder'"
                          icon="mdi-folder"
                          density="comfortable"
                          variant="text"
                          size="small"
                          class="ml-2"
                          @click.stop="openModSourceFolder(source)"
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Mod, ModSource, ModsState } from '~/app/models/mods/types';

import logger from '~/lib/logger';

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

const activeMods = computed(() => {
  if (!mods.value) {
    return [];
  }

  return mods.value.active.map((id) => mods.value.list[id]);
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

async function openModSourcePicker() {
  await window.ipc.methods.addModSource();
}

async function removeModSource(source: ModSource) {
  await window.ipc.methods.removeModSource(source);
}

async function openModSourceFolder(source: ModSource) {
  const error = await window.ipc.methods.openModSourceFolder(source);
  if (error) {
    logger.error('Failed to source folder', { error });
  }
}
</script>
