<template>
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

      <v-list v-else height="80vh">
        <v-slide-x-transition group>
          <v-list-item
            v-for="mod in activeMods"
            :key="mod.id"
            :title="mod.name"
            :subtitle="mod.source.name"
            density="compact"
          />
        </v-slide-x-transition>
      </v-list>
    </template>
  </v-card>
</template>

<script setup lang="ts">
const { activeMods, loading } = storeToRefs(useModsStore());
</script>
