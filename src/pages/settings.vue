<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          :loading="loading && 'primary'"
          title="Settings"
          prepend-icon="mdi-cog"
        >
          <template #append>
            <v-slide-x-reverse-transition>
              <span v-if="!isSynced" class="text-red">Not synced</span>
            </v-slide-x-reverse-transition>
          </template>

          <template v-if="!loading" #text>
            <v-alert
              v-if="!settings"
              title="Failed to load settings"
              type="error"
            />
            <v-form v-else v-model="isValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="settings.gamePath"
                    :rules="rules.gamePath"
                    label="Game path"
                    prepend-icon="mdi-folder"
                    variant="underlined"
                  >
                    <template #append>
                      <v-btn
                        v-if="settings.gamePath"
                        text="Browse"
                        color="secondary"
                        density="comfortable"
                        class="mr-2"
                        @click="settingsStore.openGameFolder()"
                      />
                      <v-btn
                        text="Select"
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
        <v-expansion-panels>
          <v-expansion-panel>
            <template #title>
              <v-row no-gutters>
                <v-col>
                  <v-icon
                    icon="mdi-hammer-wrench"
                    start
                  />

                  Game arguments
                </v-col>
              </v-row>
            </template>

            <template #text>
              <v-row>
                <v-col>
                  <v-card
                    title="Game Loading Speedup"
                    prepend-icon="mdi-speedometer"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noSplash"
                            label="No splash screens"
                            hint="Tells the engine to bypass the splash screens on startup of the game"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.skipIntro"
                            label="Skip intro"
                            hint="Disables world intros in the main menu permanently"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            :model-value="settings.gameParams.world === 'empty'"
                            label="Load empty world"
                            hint="No default world loaded and world intro in the main menu"
                            density="comfortable"
                            persistent-hint
                            @update:model-value="settings.gameParams.world = 'empty'"
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
                    title="Profile Options"
                    prepend-icon="mdi-account"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <!-- TODO: Folder picker -->
                          <v-text-field
                            v-model="settings.gameParams.profiles"
                            label="Profiles locations"
                            hint="Location of user-profile folder"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <!-- TODO: Autocomplete -->
                          <v-text-field
                            v-model="settings.gameParams.name"
                            label="Profile"
                            hint="Sets the profile name"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.unit"
                            label="Unit"
                            hint="Parameter passes a unit's ID number to the binary"
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
                    title="Performance"
                    prepend-icon="mdi-lightning-bolt"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.enableHT"
                            :disabled="!!settings.gameParams.cpuCount
                              || !!settings.gameParams.cpuAffinity"
                            label="Enable HyperThreading"
                            hint="Enables the use of all logical CPU cores for parallel tasks processing. If the CPU does not support Hyper-Threading or similar technology, this parameter is ignored. When disabled, only physical cores are used"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.hugePages"
                            label="Enable huge pages"
                            hint="Enables hugepages with the default memory allocator for both client and server)"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.setThreadCharacteristics"
                            label="Register as Game"
                            hint="Registers the game's executable as 'Game' in Windows for performance improvements"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.maxMem"
                            label="Maximum Memory"
                            hint="Overrides memory allocation limit to a certain amount (in megabytes)"
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
                    title="Developer Options"
                    prepend-icon="mdi-code-tags"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noPause"
                            label="No pause"
                            hint="Allow the game running even when its window does not have focus (i.e. running in the background)"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noPauseAudio"
                            :disabled="!settings.gameParams.noPause"
                            label="No audio pause"
                            hint="Keeps audio running in background while tabbed out. Should be used together with -noPause to work correctly"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.showScriptErrors"
                            label="Show script errors"
                            hint="Introduced to show errors in scripts on-screen. In Eden Editor, script errors are always shown, even when this parameter is not used"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.debug"
                            label="Debug mode"
                            hint="Enables more verbose error logging"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noLogs"
                            label="No logs"
                            hint="Be aware this means none errors saved to RPT file (report log). Yet in case of crash the fault address block info is saved"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <!-- TODO: select -->
                          <v-text-field
                            v-model="settings.gameParams.language"
                            label="Language"
                            hint="Starts client with preferred language"
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
                    title="Performance - Advanced"
                    prepend-icon="mdi-lightning-bolt"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.maxVram"
                            label="Maximum Video Memory"
                            hint="Defines video memory allocation limit to number (in megabytes)"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="128"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.maxFileCacheSize"
                            label="Maximum Filecache Size"
                            hint="Sets the default filecache size (when files are loaded from disk, they are cached in RAM. If the cache is full, the oldest file is thrown out)"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="512"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noCB"
                            label="No multicore use"
                            hint="Turns off multicore use. It slows down rendering but may resolve visual glitches"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.cpuCount"
                            label="CPU Count"
                            hint="Change to a number less or equal than numbers of available cores. This will override auto detection (which equate to native cores)"
                            density="comfortable"
                            variant="underlined"
                            type="number"
                            min="2"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.cpuAffinity"
                            label="CPU Affinity"
                            hint="Set the game's CPU affinity mask"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.cpuMainThreadAffinity"
                            label="CPU Affinity for main thread"
                            hint="Set the main thread's CPU affinity mask"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.malloc"
                            label="Memory Allocator"
                            hint="Sets the particular memory allocator to be used. Significantly affects both performance and stability of the game"
                            density="comfortable"
                            variant="underlined"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.exThreads"
                            label="Extra threads count"
                            hint="Change to a number 0,1,3,5,7. This will override auto detection (which use 3 for dualcore and 7 for quadcore)"
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
                    title="Developer Options - Advanced"
                    prepend-icon="mdi-code-tags"
                    variant="outlined"
                  >
                    <template #text>
                      <v-row>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.noFreezeCheck"
                            label="No freeze check"
                            hint="Disables the freeze check. It creates otherwise max 4 dumps per game run in total - 2 per distinct freeze. Similar to Crash Files"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.filePatching"
                            label="Allow unpacked data"
                            hint="Allows the game to load unpacked data"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.checkSignatures"
                            :disabled="!!settings.gameParams.checkSignaturesFull"
                            label="Check signatures"
                            hint="Provide a thorough test of all signatures of all loaded banks (PBOs) at the start of the game. Only the stored sha1 values are verified with signatures/keys. Output is in .rpt file"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.checkSignaturesFull"
                            :disabled="!!settings.gameParams.checkSignatures"
                            label="Check signatures and integrity"
                            hint="Same as above, but checks every byte of the file content, and therefore not only verifies signatures, but also verifies file integrity"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.d3dNoLock"
                            label="No D3D lock"
                            hint="Doesn't lock the VRAM"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.d3dNoMultiCB"
                            label="No D3D multi buffer"
                            hint="D3D uses Single Constant Buffers instead of Multiple Constant Buffers"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.debugCallExtension"
                            label="Logs extension calls"
                            hint="Logs extension calls in the rpt log"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-checkbox
                            v-model="settings.gameParams.dumpAddonDependencyGraph"
                            label="Graph of addon dependencies"
                            hint="dumps Graphviz text file into the RPT directory with a graph of all addon dependencies (requiredAddons)"
                            density="comfortable"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="settings.gameParams.networkDiagInterval"
                            label="Polls bandwidth"
                            hint="Polls the status of bandwidth, traffic and similar data every X seconds. It also logs size and count of public variables when using the Profiling binary"
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
const settingsStore = useSettingsStore();

const {
  settings,
  isSynced,
  isValid,
  loading,
} = storeToRefs(settingsStore);

const rules = computed(() => ({
  gamePath: [(v: string) => !!v || 'Game path is required'],
}));
</script>
