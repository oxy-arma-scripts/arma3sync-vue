<template>
  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="modelValue.name"
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

const modelValue = defineModel<ModSource>({ default: () => ({}) });

const { t } = useI18n();

const rules = computed(() => ({
  name: [
    (val: string): true | string => !!val || t('mod-sources.errors.noName'),
  ],
}));
</script>
