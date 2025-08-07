<template>
  <v-dialog
    :model-value="modelValue"
    width="600"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card
      :title="$t(`mod-sources.${props.source ? 'edit' : 'new'}.title`)"
      :subtitle="props.source?.name"
      :prepend-icon="props.source ? 'mdi-folder' : 'mdi-folder-plus'"
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
          :text="$t(props.source ? 'edit' : 'create')"
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

const props = defineProps<{
  modelValue: boolean,
  source?: ModSource,
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
  (e: 'update:source', value: ModSource): void
}>();

const { openModSourceFolder } = useModsStore();

const isValid = shallowRef(false);
const { cloned } = useCloned<ModSource>(() => props.source ?? {
  name: '',
  path: '',
});

function editSource() {
  emit('update:source', { ...cloned.value });
  emit('update:model-value', false);
}

async function openFolder() {
  await openModSourceFolder(cloned.value);
}
</script>
