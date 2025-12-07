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
              <span v-if="!isSynced" class="text-red">
                {{ $t('notSynced') }}
              </span>
            </v-slide-x-reverse-transition>
          </template>

          <template v-if="!loading" #text>
            <v-alert
              v-if="!settings"
              :title="$t('settings.errors.noSettings')"
              type="error"
            />
            <SettingsGeneralForm v-else />
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
              <span v-if="!isSynced" class="text-red">
                {{ $t('notSynced') }}
              </span>
            </v-slide-x-reverse-transition>
          </template>

          <template v-if="!loading && settings" #text>
            <SettingsDisplayForm />
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
                  <v-icon icon="mdi-hammer-wrench" start />

                  {{ $t('settings.game.arguments.title') }}
                </v-col>
              </v-row>
            </template>

            <template #text>
              <SettingsGameArgsForm />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { settings, isSynced, loading } = storeToRefs(useSettingsStore());
</script>
