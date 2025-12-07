<template>
  <v-card
    :title="$t('repositories.modsets.title')"
    :loading="isFetching"
    variant="flat"
  >
    <template #text>
      <v-alert
        v-if="fetchError"
        :title="$t('repositories.modsets.error')"
        :text="fetchError"
        type="error"
      />

      <v-list>
        <v-list-item
          v-for="set in modsets"
          :key="set.name"
          :value="set.name"
          :title="set.name"
          :subtitle="set.description"
          :active="watchedModsets.has(set.name)"
          @click="toggleModset(set)"
        >
          <template #prepend>
            <v-list-item-action start>
              <v-checkbox-btn :model-value="watchedModsets.has(set.name)" />
            </v-list-item-action>
          </template>

          <template #append>
            <v-menu :close-on-content-click="false">
              <template #activator="{ props: menu }">
                <v-chip
                  prepend-icon="mdi-toy-brick"
                  :text="$t('repositories.modsets.chip', set.mods.length)"
                  v-bind="menu"
                />
              </template>

              <v-list density="compact">
                <v-list-item
                  v-for="mod in set.mods"
                  :key="mod.id"
                  :title="mod.id"
                />
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type { Modset } from '~/app/models/modsets/types';
import type { Repository } from '~/app/models/repositories/types';

const { repository } = defineProps<{
  repository: Repository;
}>();

const { t, locale } = useI18n();
const repositoriesStore = useRepositoriesStore();
const modsetsStore = useModsetsStore();

const { modsetsState } = storeToRefs(modsetsStore);

const modsets = ref<Modset[]>([]);
const isFetching = shallowRef(false);
const fetchError = shallowRef('');

const watchedModsets = computed(() => {
  const watchedNames = modsetsState.value.modsets
    .filter((set) => set.repository?.name === repository.name)
    .map((set) => set.name.replace(` (${repository.name})`, ''));

  return new Set(watchedNames);
});

async function fetchModsets() {
  fetchError.value = '';
  isFetching.value = true;

  try {
    const data = await repositoriesStore.fetchRepositoryModsets(repository);

    modsets.value = data.toSorted((itemA, itemB) =>
      itemA.name.localeCompare(itemB.name, locale.value)
    );
  } catch (err) {
    fetchError.value = err.message;
  }

  isFetching.value = false;
}

async function toggleModset(modset: Modset) {
  if (watchedModsets.value.has(modset.name)) {
    await modsetsStore.deleteModset(modset);
    return;
  }

  await modsetsStore.createModset(modset);
}

onMounted(() => {
  fetchModsets();
});
</script>
