<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4" order="3" order-md="1">
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

      <v-col order="2">
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
              icon="mdi-folder-search"
              title="No mod sources found"
              text="Add a source folder with the 'Add' button to start using mods !"
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
                        @click.stop="modStore.removeModSource(source)"
                      />
                      <v-btn
                        v-tooltip:top="'Open folder'"
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
const SOURCE_ICONS: Record<string, string> = {
  'Creator DLCs': 'mdi-puzzle',
  'Steam Workshop': 'mdi-steam',
};

const modStore = useModsStore();

const {
  activeMods,
  sources,
  isSynced,
  loading,
} = storeToRefs(modStore);

</script>
