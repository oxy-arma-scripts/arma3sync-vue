<template>
  <v-dialog
    :model-value="modelValue"
    width="600"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card
      :title="$t(`mod-sources.${props.source ? 'edit' : 'new'}.title`)"
      :subtitle="props.source?.name"
      :prepend-icon="props.source ? 'mdi-folder' : 'mdi-folder-plus"
    >
      <template #text>
        <v-form v-model="isValid">
          <ModSourceForm v-model="cloned" />
        </v-form>
      </template>

      <template #actions>
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

const isValid = shallowRef(false);
const { cloned } = useCloned<ModSource>(props.source ?? {
  name: '',
  path: '',
});

function editSource() {
  emit('update:source', { ...cloned.value });
  emit('update:model-value', false);
}
</script>
