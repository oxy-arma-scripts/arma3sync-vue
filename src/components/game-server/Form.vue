<template>
  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="modelValue.name"
        :label="$t('game-servers.item.name')"
        :rules="rules.name"
        prepend-icon="mdi-form-textbox"
        variant="underlined"
      />
    </v-col>

    <v-col cols="8">
      <v-text-field
        v-model="host"
        :label="$t('game-servers.item.host')"
        :rules="rules.host"
        prepend-icon="mdi-server"
        variant="underlined"
      />
    </v-col>
    <v-col cols="4">
      <v-number-input
        v-model="port"
        :label="$t('game-servers.item.port')"
        :rules="rules.port"
        :min="1"
        prepend-icon="mdi-numeric"
        variant="underlined"
      />
    </v-col>
    <v-col key="password" cols="6">
      <v-text-field
        v-model="password"
        :label="$t('game-servers.item.password')"
        :rules="rules.password"
        prepend-icon="mdi-lock"
        type="password"
        variant="underlined"
      />
    </v-col>

    <v-col cols="6">
      <v-select
        v-model="modsetName"
        :label="$t('game-servers.item.modset')"
        :items="modsetsItems"
        :loading="modsetsLoading"
        item-value="name"
        prepend-icon="mdi-group"
        variant="underlined"
        clearable
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { GameServer } from '~/app/models/gameServers/types';

const { modsets, loading: modsetsLoading } = storeToRefs(useModsetsStore());

const modelValue = defineModel<GameServer>({ default: () => ({}) });

const { t } = useI18n();

const isURL = shallowRef<true | string>(true);

const host = shallowRef('');
const port = shallowRef(2302);
const password = shallowRef('');

const modsetName = computed<string | null>({
  get: () => modelValue.value.modset?.name,
  set: (val) => {
    if (val) {
      modelValue.value.modset = { name: val };
      return;
    }
    modelValue.value.modset = undefined;
  },
});

const rules = computed(() => ({
  name: [
    (val: string): true | string => !!val || t('game-servers.errors.noName'),
  ],
  host: [
    (val: string): true | string => !!val || t('game-servers.errors.noHost'),
    isURL,
  ],
  port: [(val: number) => !!val || t('game-servers.errors.noPort'), isURL],
  password: [isURL],
}));

const modsetsItems = computed(() =>
  modsets.value.map(({ name, description }) => ({
    value: name,
    title: name,
    props: {
      subtitle: description,
    },
  }))
);

// Parse modelValue.url as independant parts
watch(
  () => modelValue.value.url,
  (serverURL) => {
    let url: URL;
    try {
      url = new URL(serverURL);
      isURL.value = true;
    } catch (err) {
      isURL.value = err.message;
      return;
    }

    host.value = `${url.hostname}${url.pathname}`;
    port.value = Number.parseInt(url.port, 10) || 2302;
    password.value = url.password;
  },
  { immediate: true }
);

// Update modelValue when part(s) changes
watch([host, port, password], () => {
  let url: URL;
  try {
    url = new URL(`a3://${host.value}`);
    isURL.value = true;
  } catch (err) {
    isURL.value = err.message;
    modelValue.value.url = '';
    return;
  }

  url.port = `${port.value}`;
  url.password = password.value;

  modelValue.value.url = url.toString();
});
</script>
