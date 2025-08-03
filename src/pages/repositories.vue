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
              @click="() => {}"
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
    />
    <RepositoryNewDialog
      v-else
      v-model="showForm"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

const repositoriesStore = useRepositoriesStore();

const {
  repositoriesState,
  isSynced,
  loading,
} = storeToRefs(repositoriesStore);

const showForm = ref(false);
const editedRepository = ref<Repository | undefined>();
</script>
