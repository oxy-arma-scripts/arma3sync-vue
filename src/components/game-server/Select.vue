<template>
  <v-select
    v-model="modelValue"
    :label="$t('game-servers.select.title')"
    :loading="!serversIsSynced"
    :items="serversState?.servers ?? []"
    item-value="name"
    item-title="name"
    prepend-icon="mdi-server"
    variant="outlined"
    density="compact"
    width="300"
    return-object
    hide-details
    clearable
  >
    <template #item="{ item: { raw: item }, props }">
      <v-list-item :subtitle="item.repository?.name" v-bind="props">
        <template #append>
          <div class="d-flex ga-2">
            <v-btn
              v-tooltip="$t('game-servers.select.buttons.edit')"
              :disabled="!serversIsSynced"
              icon="mdi-pencil"
              color="blue"
              variant="text"
              density="compact"
              size="small"
              @click.stop="openServerForm(item)"
            />
            <v-btn
              v-tooltip="$t('game-servers.select.buttons.delete')"
              :disabled="!serversIsSynced"
              icon="mdi-delete"
              color="red"
              variant="text"
              density="compact"
              size="small"
              @click.stop="deleteServer(item)"
            />
          </div>
        </template>
      </v-list-item>
    </template>

    <template #append-item>
      <v-btn
        :text="$t('game-servers.select.buttons.add')"
        prepend-icon="mdi-server-plus"
        color="success"
        class="mx-2 mt-2"
        @click="openServerForm()"
      />
    </template>
  </v-select>

  <GameServerFormDialog
    v-model="isFormOpen"
    :game-server="editedServer"
    @update:game-server="onServerUpdate($event)"
  />
</template>

<script setup lang="ts">
import type { GameServer } from '~/app/models/gameServers/types';

const modelValue = defineModel<GameServer | undefined>();

const gameServersStore = useGameServersStore();

const editedServer = ref<GameServer | undefined>();
const isFormOpen = shallowRef(false);

const { serversState, isSynced: serversIsSynced } =
  storeToRefs(gameServersStore);

function openServerForm(srv?: GameServer) {
  editedServer.value = srv;
  isFormOpen.value = true;
}

async function onServerUpdate(srv: GameServer) {
  if (editedServer.value) {
    await gameServersStore.updateServer(srv);
    editedServer.value = undefined;
  } else {
    await gameServersStore.createServer(srv);
  }
  isFormOpen.value = false;
}

async function deleteServer(srv: GameServer) {
  await gameServersStore.deleteServer(srv);
}
</script>
