<template>
  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="name"
        :label="$t('mod-sources.item.name')"
        :rules="rules.name"
        prepend-icon="mdi-form-textbox"
        variant="underlined"
      />
    </v-col>

    <v-col cols="12">
      <v-text-field
        v-model="path"
        :label="$t('mod-sources.item.path')"
        :rules="rules.path"
        prepend-icon="mdi-folder"
        variant="underlined"
      >
        <template #append>
          <v-btn
            v-if="path"
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
</template>

<script setup lang="ts">
import type { ModSource } from '~/app/models/mods/types';

const props = defineProps<{
  modelValue?: ModSource,
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: ModSource): void
}>();

const { t } = useI18n();

const name = computed({
  get: () => props.modelValue.name,
  set: (v) => {
    emit('update:model-value', { ...props.modelValue, name: v });
  },
});

const path = computed({
  get: () => props.modelValue.path,
  set: (v) => {
    emit('update:model-value', { ...props.modelValue, path: v });
  },
});
const rules = computed(() => ({
  name: [
    (v: string) => !!v || t('mod-sources.errors.noName'),
  ],
  path: [
    (v: string) => !!v || t('mod-sources.errors.noPath'),
  ],
}));

async function openFolder() {
  await window.ipc.methods.openModSourceFolder({
    ...props.modelValue,
    name: name.value,
    path: path.value,
  });
}

async function pickFolder() {
  const p = await window.ipc.methods.openModSourceFolderPicker();
  if (!p) {
    return;
  }
  path.value = p;
}
</script>
