<template>
  <v-dialog v-model="modelValue" :close-on-content-click="false" width="600">
    <v-card
      :title="$t(`game-servers.${server ? 'edit' : 'new'}.title`)"
      :subtitle="server?.name"
      :prepend-icon="server ? 'mdi-server' : 'mdi-server-plus'"
    >
      <template #append>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          @click="modelValue = false"
        />
      </template>

      <template #text>
        <v-form v-model="isValid">
          <GameServerForm v-model="cloned" />
        </v-form>
      </template>

      <template #actions>
        <v-spacer />

        <v-btn
          :text="$t(server ? 'edit' : 'create')"
          :disabled="!isValid"
          color="success"
          prepend-icon="mdi-check-circle-outline"
          variant="tonal"
          @click="editServer()"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { GameServer } from '~/app/models/gameServers/types';

const modelValue = defineModel<boolean>({ required: true });
const server = defineModel<GameServer | undefined>('game-server');

const isValid = shallowRef(false);
const { cloned } = useCloned<GameServer>(
  () =>
    server.value ?? {
      name: '',
      url: '',
    }
);

function editServer(): void {
  server.value = { ...cloned.value };
  modelValue.value = false;
}
</script>
