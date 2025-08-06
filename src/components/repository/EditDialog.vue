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
      <template #text>
        <v-form v-model="isValid">
          <RepositoryForm v-model="cloned" />

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="cloned.destination"
                :label="$t('mod-sources.item.path')"
                :rules="rules.destination"
                prepend-icon="mdi-folder"
                variant="underlined"
              >
                <template #append>
                  <v-btn
                    v-if="cloned.destination"
                    :text="$t('browse')"
                    color="secondary"
                    density="comfortable"
                    class="mr-2"
                    @click="openFolder()"
                  />
                  <v-btn
                    :text="$t('pick')"
                    color="primary"
                    density="comfortable"
                    @click="pickFolder()"
                  />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </template>

      <template #actions>
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

const { t } = useI18n();

const isValid = shallowRef(false);
const { cloned } = useCloned(props.repository);

const rules = computed(() => ({
  destination: [
    (v: string) => !!v || t('mod-sources.errors.noPath'),
  ],
}));

async function openFolder() {
  await window.ipc.methods.openModSourceFolder({
    name: '',
    path: cloned.value.destination,
  });
}

async function pickFolder() {
  const path = await window.ipc.methods.openModSourceFolderPicker();
  if (!path) {
    return;
  }
  cloned.value.destination = path;
}

function editRepository() {
  emit('update:repository', { ...cloned.value });
  emit('update:model-value', false);
}
</script>
