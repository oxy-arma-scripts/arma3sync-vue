<template>
  <v-card
    :title="$t('repositories.game-servers.title')"
    :loading="isFetching"
    variant="flat"
  >
    <template #text>
      <v-alert
        v-if="fetchError"
        :title="$t('repositories.game-servers.error')"
        :text="fetchError"
        type="error"
      />

      <v-list>
        <v-list-item
          v-for="server in servers"
          :key="server.name"
          :value="server.url"
          :title="server.name"
          :active="registeredServers.has(server.name)"
          @click="toggleServer(server)"
        >
          <template #prepend>
            <v-list-item-action start>
              <v-checkbox-btn
                :model-value="registeredServers.has(server.name)"
              />
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type { GameServer } from '~/app/models/gameServers/types';
import type { Repository } from '~/app/models/repositories/types';

const { repository } = defineProps<{
  repository: Repository;
}>();

const { locale } = useI18n();
const repositoriesStore = useRepositoriesStore();
const gameServersStore = useGameServersStore();

const { serversState } = storeToRefs(gameServersStore);

const servers = ref<GameServer[]>([]);
const isFetching = shallowRef(false);
const fetchError = shallowRef('');

const registeredServers = computed(() => {
  const watchedNames = serversState.value.servers
    .filter((srv) => srv.repository?.name === repository.name)
    .map((srv) => srv.name.replace(` (${repository.name})`, ''));

  return new Set(watchedNames);
});

async function fetchServers() {
  fetchError.value = '';
  isFetching.value = true;

  try {
    const data = await repositoriesStore.fetchRepositoryGameServers(repository);

    servers.value = data.toSorted((itemA, itemB) =>
      itemA.name.localeCompare(itemB.name, locale.value)
    );
  } catch (err) {
    fetchError.value = err.message;
  }

  isFetching.value = false;
}

async function toggleServer(server: GameServer) {
  if (registeredServers.value.has(server.name)) {
    await gameServersStore.deleteServer(server);
    return;
  }

  await gameServersStore.createServer(server);
}

onMounted(() => {
  fetchServers();
});
</script>
