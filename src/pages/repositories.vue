<template>
  <v-container>
    <v-row>
      <v-col>
        <v-toolbar
          :title="$t('repositories.title')"
          color="transparent"
        >
          <template #prepend>
            <v-icon icon="mdi-cloud-outline" />
          </template>

          <template #append>
            <v-slide-x-reverse-transition>
              <div v-if="!isSynced" class="text-red mr-4">
                {{ $t('notSynced') }}
              </div>
            </v-slide-x-reverse-transition>

            <v-btn
              :text="$t('add')"
              append-icon="mdi-cloud-plus"
              variant="tonal"
              color="green"
              @click="openForm()"
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

    <RepositoryEditDialog
      v-if="editedRepository"
      v-model="showForm"
      :repository="editedRepository"
      @update:repository="onRepositoryUpdate($event)"
    />
    <RepositoryNewDialog
      v-else
      v-model="showForm"
      @update:repository="onRepositoryUpdate($event)"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { ModSource } from '~/app/models/mods/types';
import type { Repository } from '~/app/models/repositories/types';

const repositoriesStore = useRepositoriesStore();

const {
  repositoriesState,
  isSynced,
  loading,
} = storeToRefs(repositoriesStore);

const showForm = shallowRef(false);
const editedRepository = ref<Repository | undefined>();

function openForm(repository?: Repository) {
  editedRepository.value = repository;
  showForm.value = true;
}

function onRepositoryUpdate(repository: Repository & { source?: ModSource }) {
  const list = repositoriesState.value.repositories;

  // TODO: use backend to update list

  if (!editedRepository.value) {
    list.push(repository);
    return;
  }

  const index = list.findIndex((r) => r.destination === editedRepository.value.destination);
  if (index < 0) {
    return;
  }
  list[index] = repository;
  editedRepository.value = undefined;
}
</script>
