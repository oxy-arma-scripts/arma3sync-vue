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

    <v-row v-if="!loading">
      <v-col>
        <v-empty-state
          v-if="repositoriesState.repositories.length === 0"
          :title="$t('repositories.errors.noRepositories.title')"
          :text="$t('repositories.errors.noRepositories.text')"
          icon="mdi-cloud-search"
        />

        <v-expansion-panels v-else>
          <v-expansion-panel
            v-for="repo in repositoriesState.repositories"
            :key="repo.destination"
            :value="repo.name"
          >
            <template #title>
              <v-row no-gutters class="ga-3">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-cloud"
                    start
                  />

                  {{ repo.name }}
                </div>

                <v-spacer />

                <div class="text-end mr-2">
                  <v-btn
                    v-tooltip:top="$t('edit')"
                    icon="mdi-pencil"
                    density="comfortable"
                    variant="text"
                    size="small"
                    color="blue"
                    class="ml-2"
                    @click.stop="openForm(repo)"
                  />
                  <v-btn
                    v-tooltip:top="$t('delete')"
                    icon="mdi-delete"
                    density="comfortable"
                    variant="text"
                    size="small"
                    color="red"
                    class="ml-2"
                    @click.stop="repositoriesStore.deleteRepository(repo)"
                  />
                  <v-btn
                    v-tooltip:top="$t('browse')"
                    icon="mdi-open-in-new"
                    density="comfortable"
                    variant="text"
                    size="small"
                    class="ml-2"
                    @click.stop="repositoriesStore.openRepositoryFolder(repo)"
                  />
                </div>
              </v-row>
            </template>

            <template #text>
              <RepositorySyncPanel :repository="repo" />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
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
const { createModSource } = useModsStore();

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

async function onRepositoryUpdate(repository: Repository & { source?: ModSource }) {
  if (editedRepository.value) {
    await repositoriesStore.updateRepository(repository);
  } else {
    await repositoriesStore.createRepository(repository);
  }

  if (repository.source) {
    await createModSource(repository.source);
  }
}
</script>
