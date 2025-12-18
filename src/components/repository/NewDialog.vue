<template>
  <v-dialog
    :model-value="modelValue"
    width="800"
    @update:model-value="modelValue = $event"
  >
    <v-card :title="$t('repositories.new.title')" prepend-icon="mdi-cloud-plus">
      <template #append>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          @click="modelValue = false"
        />
      </template>

      <template #text>
        <v-stepper v-model="currentStep" flat>
          <v-stepper-header style="box-shadow: none">
            <v-stepper-item
              :title="$t('repositories.new.steps.autoImport.title')"
              :icon="
                currentStep > 1 && !autoImportUrl
                  ? 'mdi-dots-horizontal'
                  : undefined
              "
              :complete="currentStep > 1 && !!autoImportUrl"
              :error="!areStepsValid[0]"
              :value="1"
              editable
            />
            <v-divider />
            <v-stepper-item
              :title="$t('repositories.new.steps.details.title')"
              :complete="currentStep > 2 && !!repository.url"
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
                  @click="importFromURL()"
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
                <v-slide-y-transition>
                  <v-alert
                    v-if="testError"
                    :text="testError"
                    type="error"
                    class="mb-4"
                  />
                </v-slide-y-transition>

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
                  :loading="testLoading"
                  prepend-icon="mdi-arrow-right-circle-outline"
                  variant="tonal"
                  @click="testRepository()"
                />
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <div class="d-flex align-center justify-center">
                <v-btn
                  :text="$t('pick')"
                  append-icon="mdi-folder-plus"
                  color="primary"
                  size="x-large"
                  @click="createSource()"
                />
              </div>

              <div class="d-flex mt-4">
                <v-btn
                  :text="$t('$vuetify.stepper.prev')"
                  prepend-icon="mdi-arrow-left-circle-outline"
                  variant="tonal"
                  @click="currentStep -= 1"
                />

                <v-spacer />

                <v-btn
                  :text="$t('create')"
                  :disabled="!areStepsValid[2] || !repository.destination"
                  color="success"
                  prepend-icon="mdi-check-circle-outline"
                  variant="tonal"
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

const modelValue = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  (ev: 'update:repository', value: Repository): void;
}>();

const { t } = useI18n();

const { useRepositoryImport, useRepositoryCheck } = useRepositoriesStore();
const { createModSourceFromPicker, updateModSource } = useModsStore();

const currentStep = shallowRef(1);
const areStepsValid = ref([true, true, true]);
const repository = ref<Repository>({
  name: '',
  url: '',
  destination: '',
});

const {
  url: autoImportUrl,
  loading: autoImportUrlLoading,
  error: autoImportUrlError,
  changed: autoImportUrlChanged,
  importRepo,
} = useRepositoryImport();

const {
  error: testError,
  loading: testLoading,
  checkRepo,
} = useRepositoryCheck(repository);

const rules = computed(() => ({
  autoImport: {
    url: [
      (val: string): true | string => {
        if (!val) {
          return true;
        }

        return URL.canParse(val) || t('invalidURL');
      },
    ],
  },
}));

async function importFromURL(): Promise<void> {
  const imported = await importRepo();
  if (imported) {
    repository.value = imported;
    currentStep.value += 1;
  }
}

async function testRepository(): Promise<void> {
  if (await checkRepo()) {
    currentStep.value += 1;
  }
}

function createRepository(): void {
  emit('update:repository', { ...repository.value });
  modelValue.value = false;
}

async function createSource(): Promise<void> {
  const [source] = await createModSourceFromPicker();
  if (!source) {
    return;
  }
  source.name = repository.value.name;
  await updateModSource(source);
  repository.value.destination = source.path;
  createRepository();
}
</script>
