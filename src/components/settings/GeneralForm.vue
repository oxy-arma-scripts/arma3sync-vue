<template>
  <v-form v-model="isValid" ref="formRef">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="settings.game.path"
          :rules="rules.game.path"
          :label="$t('settings.game.path')"
          prepend-icon="mdi-folder"
          variant="underlined"
        >
          <template #append>
            <v-btn
              v-if="settings.game.path"
              :text="$t('browse')"
              color="secondary"
              density="comfortable"
              class="mr-2"
              @click="settingsStore.openGameFolder()"
            />
            <v-btn
              :text="$t('pick')"
              color="primary"
              density="comfortable"
              @click="settingsStore.openGameFolderPicker()"
            />
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
const { t } = useI18n();
const settingsStore = useSettingsStore();

const formRef = useTemplateRef('formRef');

const { settings, isValid } = storeToRefs(settingsStore);

const rules = computed(() => ({
  game: {
    path: [
      (value: string): true | string =>
        !!value || t('settings.errors.missingGamePath'),
    ],
  },
}));

onMounted(() => {
  formRef.value?.validate();
});
</script>
