<template>
  <v-dialog
    :model-value="modelValue"
    width="800"
    @update:model-value="modelValue = $event"
  >
    <v-card
      :title="$t('repositories.edit.title')"
      :subtitle="repository.name"
      prepend-icon="mdi-cloud"
    >
      <template #append>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          @click="modelValue = false"
        />
      </template>

      <template #text>
        <v-form v-model="isValid">
          <RepositoryForm v-model="cloned" />
        </v-form>
      </template>

      <template #actions>
        <v-btn
          v-if="cloned.destination"
          :text="$t('browse')"
          prepend-icon="mdi-open-in-new"
          color="secondary"
          class="mr-2"
          @click="openFolder()"
        />

        <v-spacer />

        <v-btn
          :text="$t('edit')"
          :disabled="!isValid"
          color="success"
          prepend-icon="mdi-check-circle-outline"
          variant="tonal"
          @click="editRepository()"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

const modelValue = defineModel<boolean>({ required: true });
const repository = defineModel<Repository>('repository', { required: true });

const { openRepositoryFolder } = useRepositoriesStore();

const isValid = shallowRef(false);
const { cloned } = useCloned(repository, { immediate: true });

async function openFolder(): Promise<void> {
  await openRepositoryFolder(cloned.value);
}

function editRepository(): void {
  repository.value = { ...cloned.value };
  modelValue.value = false;
}
</script>
