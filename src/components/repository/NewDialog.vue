<template>
  <v-dialog
    :model-value="modelValue"
    width="800"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card :title="$t('repositories.new.title')" prepend-icon="mdi-cloud-plus">
      <template #text>
        <v-stepper v-model="currentStep" flat>
          <v-stepper-header style="box-shadow: none;">
            <v-stepper-item
              :title="$t('repositories.new.steps.autoImport.title')"
              :icon="currentStep > 1 && !autoImportUrl ? 'mdi-dots-horizontal' : undefined"
              :complete="currentStep > 1 && !!autoImportUrl"
              :error="!areStepsValid[0]"
              :value="1"
              editable
            />
            <v-divider />
            <v-stepper-item
              :title="$t('repositories.new.steps.details.title')"
              :complete="false"
              :error="!areStepsValid[1]"
              :value="2"
              editable
            />
            <v-divider />
            <v-stepper-item
              :title="$t('repositories.new.steps.source.title')"
              :disabled="!repository.url"
              :error="!areStepsValid[2]"
              :value="3"
              editable
            />
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item :value="1">
              <v-form v-model="areStepsValid[0]">
                <v-slide-y-transition>
                  <v-alert
                    v-if="autoImportUrlError"
                    :text="autoImportUrlError"
                    type="error"
                    class="mb-4"
                  />
                </v-slide-y-transition>

                <v-text-field
                  v-model="autoImportUrl"
                  :rules="rules.autoImport.url"
                  :label="$t('repositories.new.steps.autoImport.url')"
                  prepend-icon="mdi-link-variant"
                  variant="underlined"
                  clearable
                />
              </v-form>

              <div class="d-flex">
                <v-spacer />

                <v-btn
                  :text="$t('import')"
                  :disabled="!areStepsValid[0] || !autoImportUrl"
                  :loading="autoImportUrlLoading"
                  :color="autoImportUrlError ? 'error' : 'primary'"
                  prepend-icon="mdi-cloud-arrow-down"
                  variant="tonal"
                  class="mr-2"
                  @click="importRepository()"
                />

                <v-btn
                  :text="$t('$vuetify.stepper.next')"
                  :disabled="!areStepsValid[0] || autoImportUrlChanged"
                  prepend-icon="mdi-arrow-right-circle-outline"
                  variant="tonal"
                  @click="currentStep += 1"
                />
              </div>

            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <v-form v-model="areStepsValid[1]">
                <RepositoryForm v-model="repository" />
              </v-form>

              <div class="d-flex mt-4">
                <v-btn
                  :text="$t('$vuetify.stepper.prev')"
                  prepend-icon="mdi-arrow-left-circle-outline"
                  variant="tonal"
                  @click="currentStep -= 1"
                />

                <v-spacer />

                <v-btn
                  :text="$t('$vuetify.stepper.next')"
                  :disabled="!areStepsValid[1] || !repository.url"
                  prepend-icon="mdi-arrow-right-circle-outline"
                  variant="tonal"
                  @click="currentStep += 1"
                />
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <v-form v-model="areStepsValid[2]">
                A
              </v-form>

              <div class="d-flex">
                <v-btn
                  :text="$t('$vuetify.stepper.prev')"
                  prepend-icon="mdi-arrow-left-circle-outline"
                  variant="tonal"
                  @click="currentStep -= 1"
                />

                <v-spacer />

                <v-btn
                  :text="$t('create')"
                  :disabled="!areStepsValid[2]"
                  color="success"
                  prepend-icon="mdi-check-circle-outline"
                  variant="tonal"
                  @click="createRepository()"
                />
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void
  (e: 'update:repository', value: Repository): void
}>();

const currentStep = shallowRef(1);
const areStepsValid = ref([true, true, true]);
const repository = ref<Repository>({
  name: '',
  url: '',
  destination: '',
});
const autoImportUrl = shallowRef('');
const autoImportUrlLoading = shallowRef(false);
const autoImportUrlError = shallowRef('');
const autoImportUrlChanged = shallowRef(false);

const rules = computed(() => ({
  autoImport: {
    url: [
      (v: string) => {
        if (!v) {
          return true;
        }
        try {
          return !!new URL(v);
        } catch (e) {
          return e.message;
        }
      },
    ],
  },
}));

async function importRepository() {
  autoImportUrlLoading.value = true;
  autoImportUrlError.value = '';
  try {
    const imported = await window.ipc.methods.importRepository(autoImportUrl.value);
    repository.value = {
      ...repository.value,
      ...imported,
    };
    autoImportUrlChanged.value = false;
    currentStep.value += 1;
  } catch (e) {
    autoImportUrlError.value = e.message;
  }
  autoImportUrlLoading.value = false;
}

function createRepository() {
  emit('update:repository', { ...repository.value });
  emit('update:model-value', false);
}

watch(autoImportUrl, () => {
  autoImportUrlError.value = '';

  if (!autoImportUrl.value) {
    autoImportUrlChanged.value = false;
    return;
  }

  if (autoImportUrlChanged.value) {
    return;
  }

  autoImportUrlChanged.value = true;
});
</script>
