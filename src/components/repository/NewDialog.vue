<template>
  <v-dialog :model-value="true" width="800">
    <v-card :title="$t('repositories.new.title')" prepend-icon="mdi-cloud-plus">
      <template #text>
        <v-stepper v-model="currentStep" flat>
          <v-stepper-header style="box-shadow: none;">
            <v-stepper-item
              :title="$t('repositories.new.steps.autoImport.title')"
              :icon="currentStep > 1 && !autoImportUrl ? 'mdi-dots-horizontal' : undefined"
              :complete="currentStep > 1 && autoImportUrl"
              :error="!areStepsValid[0]"
              :value="1"
              editable
            />
            <v-divider />
            <v-stepper-item
              :title="$t('repositories.new.steps.connection.title')"
              :complete="false"
              :error="!areStepsValid[1]"
              :value="2"
              editable
            />
            <v-divider />
            <v-stepper-item
              :title="$t('repositories.new.steps.source.title')"
              :disabled="true"
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
                  prepend-icon="mdi-cloud-arrow-down"
                  variant="underlined"
                  clearable
                />
              </v-form>

              <div class="d-flex">
                <v-btn
                  :text="$t('$vuetify.stepper.prev')"
                  :disabled="currentStep <= 1"
                  variant="text"
                  @click="currentStep -= 1"
                />

                <v-spacer />

                <v-btn
                  :text="$t('import')"
                  :disabled="!areStepsValid[0] || !autoImportUrl"
                  :loading="autoImportUrlLoading"
                  variant="tonal"
                  color="primary"
                  class="mr-2"
                  @click="importRepository()"
                />

                <v-btn
                  :text="$t('$vuetify.stepper.next')"
                  :disabled="!areStepsValid[0] || autoImportUrlChanged || currentStep >= 3"
                  variant="tonal"
                  @click="currentStep += 1"
                />
              </div>

            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <v-form v-model="areStepsValid[1]">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="repository.name"
                      :label="$t('repositories.new.steps.connection.name')"
                      :rules="rules.connection.name"
                      variant="underlined"
                    />
                  </v-col>

                  <v-col cols="2">
                    <v-select
                      v-model="protocol"
                      :label="$t('repositories.new.steps.connection.protocol')"
                      :rules="rules.connection.protocol"
                      :items="['ftp', 'ftps']"
                      variant="underlined"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="host"
                      :label="$t('repositories.new.steps.connection.host')"
                      :rules="rules.connection.host"
                      variant="underlined"
                    />
                  </v-col>
                  <v-col cols="2">
                    <v-number-input
                      v-model="port"
                      :label="$t('repositories.new.steps.connection.port')"
                      :rules="rules.connection.port"
                      :min="1"
                      variant="underlined"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-text-field
                      v-model="login"
                      :label="$t('repositories.new.steps.connection.login')"
                      :rules="rules.connection.login"
                      :disabled="anonymous"
                      variant="underlined"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="password"
                      :label="$t('repositories.new.steps.connection.password')"
                      :rules="rules.connection.password"
                      :disabled="anonymous"
                      type="password"
                      variant="underlined"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-switch
                      v-model="anonymous"
                      :label="$t('repositories.new.steps.connection.anonymous')"
                      :rules="rules.connection.anonymous"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>

              </v-form>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <v-form v-model="areStepsValid[2]">
                A
              </v-form>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

const props = defineProps<{
  modelValue: boolean,
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:repository', value: Repository): void
}>();

const { t } = useI18n();

const currentStep = ref(1);
const areStepsValid = ref([true, true, true]);
const repository = ref<Repository>({
  name: '',
  url: '',
  destination: '',
});
const autoImportUrl = ref('');
const autoImportUrlLoading = ref(false);
const autoImportUrlError = ref('');
const autoImportUrlChanged = ref(false);

const protocol = computed({
  get: () => {},
  set: (value) => {},
});
const host = computed({
  get: () => {},
  set: (value) => {},
});
const port = computed({
  get: () => {},
  set: (value) => {},
});
const login = computed({
  get: () => {},
  set: (value) => {},
});
const password = computed({
  get: () => {},
  set: (value) => {},
});
const anonymous = computed({
  get: () => {},
  set: (value) => {},
});

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
  connection: {
    name: [
      (v: string) => !!v || t('repositories.new.errors.noName'),
    ],
    protocol: [
      (v: string) => !!v || t('repositories.new.errors.noProtocol'),
    ],
    host: [
      (v: string) => !!v || t('repositories.new.errors.noHost'),
    ],
    port: [
      (v: number) => !!v || t('repositories.new.errors.noPort'),
    ],
    login: [
      (v: string) => !!v || t('repositories.new.errors.noLogin'),
    ],
    password: [
      (v: string) => !anonymous.value || !!v || t('repositories.new.errors.noPassword'),
    ],
    anonymous: [],
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
  } catch (e) {
    autoImportUrlError.value = e.message;
  }
  autoImportUrlLoading.value = false;
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
