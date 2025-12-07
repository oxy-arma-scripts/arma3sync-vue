<template>
  <v-row>
    <v-col>
      <v-toolbar :title="$t('mod-sources.title')" color="transparent">
        <template #prepend>
          <v-icon icon="mdi-folder-outline" />
        </template>

        <template #append>
          <v-slide-x-reverse-transition>
            <div v-if="!isSynced" class="text-red mr-4">
              {{ $t('notSynced') }}
            </div>
          </v-slide-x-reverse-transition>

          <v-btn
            :text="$t('add')"
            append-icon="mdi-folder-plus"
            variant="tonal"
            color="green"
            @click="modStore.createModSourceFromPicker()"
          />
        </template>
      </v-toolbar>

      <v-progress-linear v-if="loading" color="primary" indeterminate rounded />
    </v-col>
  </v-row>

  <v-row>
    <v-col>
      <v-empty-state
        v-if="sources.length === 0"
        :title="$t('mod-sources.errors.noSources.title')"
        :text="$t('mod-sources.errors.noSources.text')"
        icon="mdi-folder-search"
      />

      <v-expansion-panels v-else multiple>
        <v-expansion-panel
          v-for="source in sources"
          :key="source.path"
          :value="source.name"
        >
          <template #title>
            <v-row no-gutters class="ga-3">
              <div class="d-flex align-center">
                <v-icon
                  :icon="specialSources[source.name]?.icon || 'mdi-folder'"
                  start
                />

                {{ specialSources[source.name]?.title || source.name }}
              </div>

              <v-spacer />

              <div
                class="d-flex align-center justify-end text-caption text-disabled"
              >
                <template v-if="source.enabledCount > 0">
                  {{ $t('mods.enabled.count', source.enabledCount) }} -
                </template>
                {{ $t('mods.count', source.mods.length) }}
              </div>

              <div class="text-end mr-2">
                <v-btn
                  v-if="!source.native"
                  v-tooltip:top="$t('edit')"
                  icon="mdi-pencil"
                  density="comfortable"
                  variant="text"
                  size="small"
                  color="blue"
                  class="ml-2"
                  @click.stop="openForm(source)"
                />
                <v-btn
                  v-if="!source.native"
                  v-tooltip:top="$t('delete')"
                  icon="mdi-delete"
                  density="comfortable"
                  variant="text"
                  size="small"
                  color="red"
                  class="ml-2"
                  @click.stop="modStore.removeModSource(source)"
                />
                <v-btn
                  v-tooltip:top="$t('browse')"
                  icon="mdi-open-in-new"
                  density="comfortable"
                  variant="text"
                  size="small"
                  class="ml-2"
                  @click.stop="modStore.openModSourceFolder(source)"
                />
              </div>
            </v-row>
          </template>

          <template #text>
            <v-empty-state
              v-if="source.mods.length === 0"
              :title="$t('mod-sources.errors.noMods.title')"
              :text="$t('mod-sources.errors.noMods.text')"
              icon="mdi-toy-brick-remove"
            />
            <v-list v-else style="max-height: 500px; overflow-y: auto">
              <v-list-item
                v-for="mod in source.mods"
                :key="mod.id"
                :title="mod.name"
                :subtitle="mod.subpath !== mod.id ? mod.subpath : undefined"
                density="compact"
                @click="modStore.setModActive(mod, !mod.active)"
              >
                <template #prepend>
                  <v-list-item-action start>
                    <v-checkbox-btn
                      :model-value="mod.active"
                      density="compact"
                      readonly
                    />
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <ModSourceFormDialog
    v-model="showForm"
    :source="editedSource"
    @update:source="onSourceUpdate($event)"
  />
</template>

<script setup lang="ts">
import type { ModSource } from '~/app/models/mods/types';
import type { DisplayModSource } from '~/stores/useModsStore';

const { t } = useI18n();

const modStore = useModsStore();

const showForm = shallowRef(false);
const editedSource = ref<ModSource | undefined>();

const { sources, isSynced, loading } = storeToRefs(modStore);

const specialSources = computed<
  Record<string, { title: string; icon: string }>
>(() => ({
  '!cdlc': {
    title: t('mod-sources.specials.cdlc'),
    icon: 'mdi-puzzle',
  },
  '!workshop': {
    title: t('mod-sources.specials.workshop'),
    icon: 'mdi-steam',
  },
}));

function openForm(source?: DisplayModSource): void {
  const ignoreKeys = new Set<string>(['mods', 'enabledCount']);

  editedSource.value = Object.fromEntries(
    Object.entries(source).filter(([key]) => !ignoreKeys.has(key))
  ) as ModSource;

  showForm.value = true;
}

async function onSourceUpdate(source: ModSource): Promise<void> {
  if (editedSource.value) {
    await modStore.updateModSource(source);
    return;
  }

  await modStore.createModSource(source);
}
</script>
