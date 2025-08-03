<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4" order="3" order-md="1">
        <v-row>
          <v-col>
            <v-card
              :loading="loading && 'primary'"
              :title="$t('mods.enabled.title')"
              prepend-icon="mdi-toy-brick-outline"
            >
              <template #append>
                <span v-if="activeMods.length > 0" class="text-caption text-disabled">
                  {{ $t('mods.enabled.count', activeMods.length) }}
                </span>
              </template>

              <template #text>
                <v-empty-state
                  v-if="activeMods.length === 0"
                  icon="mdi-toy-brick-search"
                  :title="$t('mods.enabled.errors.noMods.title')"
                  :text="$t('mods.enabled.errors.noMods.text')"
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

      <v-col order="2">
        <v-row>
          <v-col>
            <v-toolbar
              :title="$t('mod-sources.title')"
              color="transparent"
            >
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
                  @click="modStore.openModSourcePicker()"
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
              :title="$t('mod-sources.errors.noSources.title')"
              :text="$t('mod-sources.errors.noSources.text')"
              icon="mdi-folder-search"
            />

            <v-expansion-panels v-else multiple>
              <v-expansion-panel
                v-for="source in sources"
                :key="source.name"
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

                    <div class="d-flex align-center justify-end text-caption text-disabled">
                      <template v-if="source.enabledCount > 0">
                        {{ $t('mods.enabled.count', source.enabledCount) }} -
                      </template>
                      {{ $t('mods.count', source.mods.length) }}
                    </div>

                    <div class="text-end mr-2">
                      <v-btn
                        v-if="!source.mandatory"
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
                        icon="mdi-folder"
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
                  <v-list style="max-height: 500px; overflow-y: auto;">
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
                          <v-checkbox-btn :model-value="mod.active" density="compact" readonly />
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </v-list>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
const modStore = useModsStore();

const {
  activeMods,
  sources,
  isSynced,
  loading,
} = storeToRefs(modStore);

const specialSources = computed<Record<string, { title: string, icon: string }>>(() => ({
  '!cdlc': {
    title: t('mod-sources.specials.cdlc'),
    icon: 'mdi-puzzle',
  },
  '!workshop': {
    title: t('mod-sources.specials.workshop'),
    icon: 'mdi-steam',
  },
}));
</script>
