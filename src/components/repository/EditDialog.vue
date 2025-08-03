<template>
  <v-dialog>
    <v-card />
  </v-dialog>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

const props = defineProps<{
  modelValue: boolean,
  repository?: Repository,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:repository', value: Repository): void
}>();
</script>
