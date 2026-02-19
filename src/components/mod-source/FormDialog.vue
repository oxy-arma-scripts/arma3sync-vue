<template>
  <v-dialog v-model="modelValue" width="600">
    <v-card
      :title="$t(`mod-sources.${source ? 'edit' : 'new'}.title`)"
      :subtitle="source?.name"
      :prepend-icon="source ? 'mdi-folder' : 'mdi-folder-plus'"
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
          <ModSourceForm v-model="cloned" />
        </v-form>
      </template>

      <template #actions>
        <v-btn
          v-if="cloned.path"
          :text="$t('browse')"
          prepend-icon="mdi-open-in-new"
          color="secondary"
          class="mr-2"
          @click="openFolder()"
        />

        <v-spacer />

        <v-btn
          :text="$t(source ? 'edit' : 'create')"
          :disabled="!isValid"
          color="success"
          prepend-icon="mdi-check-circle-outline"
          variant="tonal"
          @click="editSource()"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { ModSource } from '~/app/models/mods/types';

const modelValue = defineModel<boolean>({ required: true });
const source = defineModel<ModSource | undefined>('source');

const { openModSourceFolder } = useModsStore();

const isValid = shallowRef(false);
const { cloned } = useCloned<ModSource>(
  () =>
    source.value ?? {
      name: '',
      path: '',
    }
);

function editSource(): void {
  source.value = { ...cloned.value };
  modelValue.value = false;
}

async function openFolder(): Promise<void> {
  await openModSourceFolder(cloned.value);
}
</script>
