<template>
  <v-container>
    <v-row>
      <v-col>
        <v-toolbar
          title="Mods sources"
          color="transparent"
        >
          <template #append>
            <v-btn
              text="Add"
              append-icon="mdi-folder-plus"
              variant="tonal"
              color="green"
              @click="() => {}"
            />
          </template>
        </v-toolbar>
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
                <v-row no-gutters>
                  <v-col class="d-flex align-center" cols="4">
                    <v-icon
                      :icon="SOURCE_ICONS[source.name] || 'mdi-folder'"
                      start
                    />

                    {{ source.name }}
                  </v-col>

                  <v-spacer />

                  <v-col class="text-end mr-2" cols="4">
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
                  </v-col>
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
type ModSourceWithMods = ModSource & { mods: DisplayMod[] };

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
      ...source,
      ...res.get(source.name),
    };
    entry.mods.push({ ...mod, active: activeMods.has(mod.id) });
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
