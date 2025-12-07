<template>
  <v-form v-model="isValid">
    <v-row>
      <v-col cols="6">
        <div class="d-flex flex-column">
          <v-label :text="$t('settings.display.theme')" />
          <v-btn-toggle
            v-model="settings.display.theme"
            color="primary"
            mandatory
          >
            <v-btn
              v-tooltip:top="$t('settings.display.themes.dark')"
              value="dark"
              icon="mdi-brightness-4"
            />

            <v-btn
              v-tooltip:top="$t('settings.display.themes.light')"
              value="light"
              icon="mdi-brightness-6"
            />

            <v-btn
              v-tooltip:top="$t('settings.display.themes.auto')"
              value="auto"
              icon="mdi-theme-light-dark"
            />
          </v-btn-toggle>
        </div>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="settings.display.language"
          :items="availableLocales"
          :label="$t('settings.display.language')"
          prepend-icon="mdi-translate"
          variant="underlined"
          hide-details
        >
          <template #selection="{ item }">
            {{ $t(`settings.display.languages.${item.value}`) }}
          </template>

          <template #item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="$t(`settings.display.languages.${item.value}`)"
            >
              <template #prepend>
                <v-img
                  :src="`https://flagcdn.com/${LANG_FLAGS[item.value] || item.value}.svg`"
                  width="32"
                  class="mr-2"
                />
              </template>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
const LANG_FLAGS: Readonly<Record<string, string>> = {
  en: 'gb',
} as const;

const { availableLocales } = useI18n();

const formRef = useTemplateRef('formRef');

const { settings, isValid } = storeToRefs(useSettingsStore());

onMounted(() => {
  formRef.value?.validate();
});
</script>
