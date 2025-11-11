<template>
  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="name"
        :label="$t('repositories.item.name')"
        :rules="rules.name"
        prepend-icon="mdi-form-textbox"
        variant="underlined"
      />
    </v-col>

    <v-col cols="3">
      <v-select
        v-model="protocol"
        :label="$t('repositories.item.protocol')"
        :rules="rules.protocol"
        :items="Object.keys(PROTOCOLS_PORT)"
        prepend-icon="mdi-protocol"
        variant="underlined"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="host"
        :label="$t('repositories.item.host')"
        :rules="rules.host"
        prepend-icon="mdi-server"
        variant="underlined"
      />
    </v-col>
    <v-col cols="3">
      <v-number-input
        v-model="port"
        :label="$t('repositories.item.port')"
        :rules="rules.port"
        :min="1"
        prepend-icon="mdi-numeric"
        variant="underlined"
      />
    </v-col>

    <v-col cols="12">
      <v-checkbox
        v-model="anonymous"
        :label="$t('repositories.item.anonymous')"
        hide-details="auto"
        prepend-icon="mdi-incognito"
        variant="underlined"
      />
    </v-col>
    <v-slide-y-transition group>
      <template v-if="!anonymous">
        <v-col key="username" cols="6">
          <v-text-field
            v-model="username"
            :label="$t('repositories.item.username')"
            :rules="rules.username"
            :disabled="anonymous"
            prepend-icon="mdi-account"
            variant="underlined"
          />
        </v-col>
        <v-col key="password" cols="6">
          <v-text-field
            v-model="password"
            :label="$t('repositories.item.password')"
            :rules="rules.password"
            :disabled="anonymous"
            prepend-icon="mdi-lock"
            type="password"
            variant="underlined"
          />
        </v-col>
      </template>
    </v-slide-y-transition>
  </v-row>
</template>

<script setup lang="ts">
import type { Repository } from '~/app/models/repositories/types';

const PROTOCOLS_PORT: Readonly<Record<string, number>> = {
  ftp: 21,
  ftps: 990,
  http: 80,
  https: 443,
} as const;

const modelValue = defineModel<Repository>({ default: () => ({}) });

const { t } = useI18n();

const isURL = shallowRef<true | string>(true);

const name = shallowRef('');
const protocol = shallowRef('ftp');
const host = shallowRef('');
const port = shallowRef(21);
const username = shallowRef('');
const password = shallowRef('');
const anonymous = shallowRef(false);

const rules = computed(() => ({
  name: [
    (val: string): true | string => !!val || t('repositories.errors.noName'),
    (): true | string => isURL.value,
  ],
  protocol: [
    (val: string): true | string =>
      !!val || t('repositories.errors.noProtocol'),
    (): true | string => isURL.value,
  ],
  host: [
    (val: string): true | string => !!val || t('repositories.errors.noHost'),
    (): true | string => isURL.value,
  ],
  port: [
    (val: number) => !!val || t('repositories.errors.noPort'),
    (): true | string => isURL.value,
  ],
  username: [
    (val: string): true | string =>
      !!val || t('repositories.errors.noUsername'),
    (): true | string => isURL.value,
  ],
  password: [
    (val: string): true | string =>
      !anonymous.value || !!val || t('repositories.errors.noPassword'),
    (): true | string => isURL.value,
  ],
}));

// Parse modelValue as idependant parts
watch(
  modelValue,
  (repository) => {
    name.value = repository.name;

    let url: URL;
    try {
      url = new URL(repository.url);
      isURL.value = true;
    } catch (err) {
      isURL.value = err.message;
      return;
    }

    protocol.value = url.protocol.slice(0, url.protocol.length - 1);
    host.value = `${url.hostname}${url.pathname}`;
    port.value =
      Number.parseInt(url.port, 10) || PROTOCOLS_PORT[protocol.value];
    username.value = url.username;
    password.value = url.password;
    anonymous.value = !url.username && !url.password;
  },
  { immediate: true }
);

// Change default port when updating protocol
watch(protocol, () => {
  port.value = PROTOCOLS_PORT[protocol.value];
});

// Update modelValue when part(s) changes
watch([name, protocol, host, port, username, password, anonymous], () => {
  let url: URL;
  try {
    url = new URL(`${protocol.value}://${host.value}`);
    isURL.value = true;
  } catch (err) {
    isURL.value = err.message;
    modelValue.value = {
      ...modelValue.value,
      name: name.value,
      url: '',
    };
    return;
  }

  url.port = `${port.value}`;
  url.username = anonymous.value ? '' : username.value;
  url.password = anonymous.value ? '' : password.value;

  modelValue.value = {
    ...modelValue.value,
    name: name.value,
    url: url.toString(),
  };
});
</script>
