<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          :loading="loading && 'primary'"
          :title="$t('settings.title')"
          prepend-icon="mdi-cog"
        >
          <template #append>
            <v-slide-x-reverse-transition>
              <span v-if="!isSynced" class="text-red">{{ $t('notSynced') }}</span>
            </v-slide-x-reverse-transition>
          </template>

          <template v-if="!loading" #text>
            <v-alert
              v-if="!settings"
              :title="$t('settings.errors.noSettings')"
              type="error"
            />
            <v-form v-else v-model="isValid" ref="formRef">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="settings.game.path"
                    :rules="rules.game.path"
                    :label="$t('settings.game.path')"
                    prepend-icon="mdi-folder"
                    variant="underlined"
                  >
                    <template #append>
                      <v-btn
                        v-if="settings.game.path"
                        :text="$t('browse')"
                        color="secondary"
                        density="comfortable"
                        class="mr-2"
                        @click="settingsStore.openGameFolder()"
                      />
                      <v-btn
                        :text="$t('pick')"
                        color="primary"
                        density="comfortable"
                        @click="settingsStore.openGameFolderPicker()"
                      />
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card
          :loading="loading && 'primary'"
          :title="$t('settings.display.title')"
          prepend-icon="mdi-brush-variant"
        >
          <template #append>
            <v-slide-x-reverse-transition>
              <span v-if="!isSynced" class="text-red">{{ $t('notSynced') }}</span>
            </v-slide-x-reverse-transition>
          </template>

          <template v-if="!loading" #text>
            <v-form v-if="settings" v-model="isValid">
              <v-row>
                <v-col cols="6">
                  <div class="d-flex flex-column">
                    <v-label :text="$t('settings.display.theme')" />
                    <v-btn-toggle
                      v-model="settings.display.theme"
                      color="primary"
                      mandatory
                    >
                      <v-btn
                        v-tooltip:top="$t('settings.display.themes.dark')"
                        value="dark"
                        icon="mdi-brightness-4"
                      />

                      <v-btn
                        v-tooltip:top="$t('settings.display.themes.light')"
                        value="light"
                        icon="mdi-brightness-6"
                      />

                      <v-btn
                        v-tooltip:top="$t('settings.display.themes.auto')"
                        value="auto"
                        icon="mdi-theme-light-dark"
                      />
                    </v-btn-toggle>
                  </div>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="settings.display.language"
                    :items="availableLocales"
                    :label="$t('settings.display.language')"
                    prepend-icon="mdi-translate"
                    variant="underlined"
                    hide-details
                  >
                    <template #selection="{ item }">
                      {{ $t(`settings.display.languages.${item.value}`) }}
                    </template>

                    <template #item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="$t(`settings.display.languages.${item.value}`)"
                      >
                        <template #prepend>
                          <v-img
                            :src="`https://flagcdn.com/${LANG_FLAGS[item.value] || item.value}.svg`"
                            width="32"
                            class="mr-2"
                          />
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-form>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-expansion-panels>
          <v-expansion-panel>
            <template #title>
              <v-row no-gutters>
                <v-col>
                  <v-icon
                    icon="mdi-hammer-wrench"
                    start
                  />

                  {{ $t('settings.game.arguments.title') }}
                </v-col>
              </v-row>
            </template>

            <template #text>
              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.loadingSpeedup.title')"
                    prepend-icon="mdi-speedometer"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noSplash"
                            :label="$t('settings.game.arguments.loadingSpeedup.noSplash.label')"
                            :hint="$t('settings.game.arguments.loadingSpeedup.noSplash.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.skipIntro"
                            :label="$t('settings.game.arguments.loadingSpeedup.skipIntro.label')"
                            :hint="$t('settings.game.arguments.loadingSpeedup.skipIntro.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            :model-value="settings.game.params.world === 'empty'"
                            :label="$t('settings.game.arguments.loadingSpeedup.loadEmptyWorld.label')"
                            :hint="$t('settings.game.arguments.loadingSpeedup.loadEmptyWorld.hint')"
                            density="comfortable"
                            persistent-hint
                            @update:model-value="settings.game.params.world = 'empty'"
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.profileOptions.title')"
                    prepend-icon="mdi-account"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <!-- TODO: Folder picker -->
                          <v-text-field
                            v-model="settings.game.params.profiles"
                            :label="$t('settings.game.arguments.profileOptions.profiles.label')"
                            :hint="$t('settings.game.arguments.profileOptions.profiles.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <!-- TODO: Autocomplete -->
                          <v-text-field
                            v-model="settings.game.params.name"
                            :label="$t('settings.game.arguments.profileOptions.name.label')"
                            :hint="$t('settings.game.arguments.profileOptions.name.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.unit"
                            :label="$t('settings.game.arguments.profileOptions.unit.label')"
                            :hint="$t('settings.game.arguments.profileOptions.unit.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="0"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.performance.title')"
                    prepend-icon="mdi-lightning-bolt"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.enableHT"
                            :disabled="!!settings.game.params.cpuCount || !!settings.game.params.cpuAffinity"
                            :label="$t('settings.game.arguments.performance.enableHT.label')"
                            :hint="$t('settings.game.arguments.performance.enableHT.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.hugePages"
                            :label="$t('settings.game.arguments.performance.hugePages.label')"
                            :hint="$t('settings.game.arguments.performance.hugePages.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.setThreadCharacteristics"
                            :label="$t('settings.game.arguments.performance.setThreadCharacteristics.label')"
                            :hint="$t('settings.game.arguments.performance.setThreadCharacteristics.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.maxMem"
                            :label="$t('settings.game.arguments.performance.maxMem.label')"
                            :hint="$t('settings.game.arguments.performance.maxMem.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="1024"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.developerOptions.title')"
                    prepend-icon="mdi-code-tags"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noPause"
                            :label="$t('settings.game.arguments.developerOptions.noPause.label')"
                            :hint="$t('settings.game.arguments.developerOptions.noPause.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noPauseAudio"
                            :disabled="!settings.game.params.noPause"
                            :label="$t('settings.game.arguments.developerOptions.noPauseAudio.label')"
                            :hint="$t('settings.game.arguments.developerOptions.noPauseAudio.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.showScriptErrors"
                            :label="$t('settings.game.arguments.developerOptions.showScriptErrors.label')"
                            :hint="$t('settings.game.arguments.developerOptions.showScriptErrors.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.debug"
                            :label="$t('settings.game.arguments.developerOptions.debug.label')"
                            :hint="$t('settings.game.arguments.developerOptions.debug.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noLogs"
                            :label="$t('settings.game.arguments.developerOptions.noLogs.label')"
                            :hint="$t('settings.game.arguments.developerOptions.noLogs.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <!-- TODO: select -->
                          <v-text-field
                            v-model="settings.game.params.language"
                            :label="$t('settings.game.arguments.developerOptions.language.label')"
                            :hint="$t('settings.game.arguments.developerOptions.language.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.performanceAdvanced.title')"
                    prepend-icon="mdi-lightning-bolt"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.maxVram"
                            :label="$t('settings.game.arguments.performanceAdvanced.maxVram.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.maxVram.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="128"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.maxFileCacheSize"
                            :label="$t('settings.game.arguments.performanceAdvanced.maxFileCacheSize.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.maxFileCacheSize.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="512"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noCB"
                            :label="$t('settings.game.arguments.performanceAdvanced.noCB.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.noCB.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.cpuCount"
                            :label="$t('settings.game.arguments.performanceAdvanced.cpuCount.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.cpuCount.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="2"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.cpuAffinity"
                            :label="$t('settings.game.arguments.performanceAdvanced.cpuAffinity.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.cpuAffinity.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.cpuMainThreadAffinity"
                            :label="$t('settings.game.arguments.performanceAdvanced.cpuMainThreadAffinity.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.cpuMainThreadAffinity.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.malloc"
                            :label="$t('settings.game.arguments.performanceAdvanced.malloc.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.malloc.hint')"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.exThreads"
                            :label="$t('settings.game.arguments.performanceAdvanced.exThreads.label')"
                            :hint="$t('settings.game.arguments.performanceAdvanced.exThreads.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="0"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-card
                    :title="$t('settings.game.arguments.developerOptionsAdvanced.title')"
                    prepend-icon="mdi-code-tags"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.noFreezeCheck"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.noFreezeCheck.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.noFreezeCheck.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.filePatching"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.filePatching.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.filePatching.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.checkSignatures"
                            :disabled="!!settings.game.params.checkSignaturesFull"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.checkSignatures.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.checkSignatures.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.checkSignaturesFull"
                            :disabled="!!settings.game.params.checkSignatures"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.checkSignaturesFull.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.checkSignaturesFull.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.d3dNoLock"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.d3dNoLock.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.d3dNoLock.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.d3dNoMultiCB"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.d3dNoMultiCB.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.d3dNoMultiCB.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.debugCallExtension"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.debugCallExtension.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.debugCallExtension.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.game.params.dumpAddonDependencyGraph"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.dumpAddonDependencyGraph.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.dumpAddonDependencyGraph.hint')"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.game.params.networkDiagInterval"
                            :label="$t('settings.game.arguments.developerOptionsAdvanced.networkDiagInterval.label')"
                            :hint="$t('settings.game.arguments.developerOptionsAdvanced.networkDiagInterval.hint')"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="1"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const LANG_FLAGS: Readonly<Record<string, string>> = {
  en: 'gb',
} as const;

const { t, availableLocales } = useI18n();
const settingsStore = useSettingsStore();

const formRef = useTemplateRef('formRef');

const {
  settings,
  isSynced,
  isValid,
  loading,
} = storeToRefs(settingsStore);

const rules = computed(() => ({
  game: {
    path: [(v: string) => !!v || t('settings.errors.missingGamePath')],
  },
}));

onMounted(() => {
  formRef.value?.validate();
});
</script>
