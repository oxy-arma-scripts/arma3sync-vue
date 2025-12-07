<template>
  <v-row>
    <v-col>
      <v-toolbar :title="$t('modsets.title')" color="transparent">
        <template #prepend>
          <v-icon icon="mdi-group" />
        </template>

        <template #append>
          <v-slide-x-reverse-transition>
            <div v-if="!isSynced" class="text-red mr-4">
              {{ $t('notSynced') }}
            </div>
          </v-slide-x-reverse-transition>
        </template>
      </v-toolbar>

      <v-progress-linear v-if="loading" color="primary" indeterminate rounded />
    </v-col>
  </v-row>

  <v-row v-if="modsets.length > 0">
    <v-col>
      <v-list>
        <v-list-item
          v-for="set in modsets"
          :key="set.name"
          :value="set.name"
          :title="set.name"
          :subtitle="set.description"
          :active="set.enabledCount === set.mods.length"
          @click="toggleModset(set)"
        >
          <template #prepend>
            <v-list-item-action start>
              <v-checkbox-btn
                :model-value="set.enabledCount > 0"
                :indeterminate="
                  set.enabledCount > 0 && set.enabledCount !== set.mods.length
                "
              />
            </v-list-item-action>
          </template>

          <template #append>
            <v-menu :close-on-content-click="false">
              <template #activator="{ props: menu }">
                <v-chip prepend-icon="mdi-toy-brick" v-bind="menu">
                  {{ $t('modsets.chip.text', set.mods.length) }}
                  <template v-if="set.enabledCount > 0">
                    ({{ $t('modsets.chip.enabled', set.enabledCount) }})
                  </template>
                </v-chip>
              </template>

              <v-list density="compact">
                <v-list-item
                  v-for="mod in set.mods"
                  :key="mod.id"
                  :title="mod.id"
                  :active="mod.active"
                  :class="{ 'bg-error': mod.notFound }"
                />
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { DisplayModset } from '~/stores/useModsetsStore';

const modsetsStore = useModsetsStore();

const { modsets, isSynced, loading } = storeToRefs(modsetsStore);

async function toggleModset(modset: DisplayModset) {
  if (modset.enabledCount > 0) {
    await modsetsStore.unapplyModset(modset);
    return;
  }

  await modsetsStore.applyModset(modset);
}
</script>
