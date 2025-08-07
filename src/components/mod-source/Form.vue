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

const rules = computed(() => ({
  name: [
    (v: string) => !!v || t('mod-sources.errors.noName'),
  ],
}));
</script>
