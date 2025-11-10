<template>
  <div>
    <v-toolbar title="État de mise à jour">
      <template #append>
        <v-btn
          :loading="isFetching"
          text="FETCH"
          append-icon="mdi-sync"
          @click="fetchRepository()"
        />
      </template>
    </v-toolbar>

    <v-alert v-if="fetchError" :text="fetchError" />

    <div v-if="diffTree.length > 0" style="overflow-y: auto; max-height: 500px">
      <v-treeview
        v-model:selected="diff"
        :items="diffTree"
        item-value="path"
        item-title="text"
        select-strategy="independent"
        selectable
        return-object
        indent-lines
        hide-actions
      >
        <template #prepend="{ item, isOpen }">
          <v-chip
            v-if="item.type"
            density="compact"
            label
            class="mr-2"
            v-bind="typeChips[item.type]"
          />
          <v-icon
            v-else
            :icon="isOpen ? 'mdi-folder-open' : 'mdi-folder'"
            class="ml-1"
          />
        </template>
      </v-treeview>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Repository,
  RepositorySyncItem,
} from "~/app/models/repositories/types";

type RepositorySyncTreeItem = Omit<RepositorySyncItem, "type"> & {
  type: RepositorySyncItem["type"] | "";
  text: string;
  children?: RepositorySyncTreeItem[];
};

const props = defineProps<{
  repository: Repository;
}>();

const { locale } = useI18n();
const { settings } = storeToRefs(useSettingsStore());

const isFetching = shallowRef(false);
const fetchError = shallowRef("");
const diff = ref<RepositorySyncItem[]>([]);

const typeChips = computed(() => ({
  CREATE: {
    color: "green",
    prependIcon: "mdi-plus",
    text: "CREATE",
  },
  UPDATE: {
    color: "blue",
    prependIcon: "mdi-pencil",
    text: "UPDATE",
  },
  DELETE: {
    color: "red",
    prependIcon: "mdi-delete",
    text: "DELETE",
  },
}));

const diffTree = computed(() => {
  const sep = settings.value.pathSeparator;
  const tree: RepositorySyncTreeItem[] = [];

  // Resolve diff as tree
  // eslint-disable-next-line no-restricted-syntax
  for (const item of diff.value) {
    const parts = item.path.split(sep);

    let root = tree;
    // eslint-disable-next-line no-restricted-syntax
    for (let index = 0; index < parts.length; index += 1) {
      if (index === parts.length - 1) {
        root.push({
          ...item,
          text: parts[index],
        });
        // eslint-disable-next-line no-continue
        continue;
      }

      const path = parts.slice(0, index + 1).join(sep);
      let parent = root.find((elem) => elem.path === path);

      if (!parent) {
        parent = {
          type: "",
          text: parts[index],
          path,
          children: [],
        };
        root.push(parent);
      }
      root = parent.children;
    }
  }

  return tree;
});

async function fetchRepository() {
  isFetching.value = true;
  fetchError.value = "";
  try {
    const data = await window.ipc.methods.fetchRepository(
      toRawDeep(props.repository),
    );
    diff.value = data.sort((a, b) =>
      a.path.localeCompare(b.path, locale.value),
    );
  } catch (err) {
    console.error(err);
    fetchError.value = err.message;
  }
  isFetching.value = false;
}
</script>
