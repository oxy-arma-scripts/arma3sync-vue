<template>
  <v-dialog
    :model-value="modelValue"
    width="800"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card
      :title="$t('repositories.edit.title')"
      :subtitle="props.repository.name"
      prepend-icon="mdi-cloud"
    >
      <template #append>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          @click="$emit('update:model-value', false)"
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

const props = defineProps<{
  modelValue: boolean,
  repository: Repository,
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
  (e: 'update:repository', value: Repository): void
}>();

const { openRepositoryFolder } = useRepositoriesStore();

const isValid = shallowRef(false);
const { cloned } = useCloned(props.repository, { immediate: true });

async function openFolder() {
  await openRepositoryFolder(cloned.value);
}

function editRepository() {
  emit('update:repository', { ...cloned.value });
  emit('update:model-value', false);
}
</script>
