<template>
  <v-card variant="flat">
    <template #append>
      <v-btn
        :text="$t('repositories.sync.fetch')"
        :disabled="syncStatus.active"
        :loading="fetchStatus.active"
        append-icon="mdi-download"
        variant="outlined"
        class="mx-2"
        @click="fetchDiff()"
      />
    </template>

    <template #title>
      {{ $t('repositories.sync.title') }}

      <span
        v-if="diffMods.length > 0"
        class="text-gray-darken"
        style="font-size: 0.75em"
      >
        {{ $t('repositories.sync.mods', { mods: diffMods.length }) }}
      </span>
    </template>

    <template #text>
      <div v-if="loadingBar.active">
        <v-progress-linear
          v-tooltip:top="
            $t('repositories.sync.loadingTooltip.value', loadingBar)
          "
          :model-value="loadingBar.progress"
          :indeterminate="loadingBar.done === 0"
          :color="fetchStatus.active ? 'grey' : 'success'"
          rounded
        />
        <div
          v-if="loadingBar.done > 0"
          class="text-center mt-1"
          :style="{ width: `${loadingBar.progress}%`, minWidth: '5%' }"
        >
          <v-chip
            :text="loadingBar.percent"
            color="primary"
            density="compact"
          />
        </div>
      </div>

      <v-alert v-if="alert" v-bind="alert" />

      <v-checkbox
        v-if="!fetchStatus.active && diffMods.length > 0"
        :model-value="isAllSelected"
        :label="$t('selectAll')"
        density="compact"
        hide-details
        class="ml-2"
        @update:model-value="toggleAll()"
      />
      <div
        v-if="!fetchStatus.active"
        style="overflow-y: auto; max-height: 500px"
      >
        <v-treeview
          v-model="selectedPaths"
          :items="diffTree"
          :disabled="loadingBar.active"
          item-value="path"
          item-title="text"
          select-strategy="classic"
          selectable
          indent-lines
          hide-actions
        >
          <template #prepend="{ item, isOpen }">
            <v-icon
              v-if="item.children"
              :icon="isOpen ? 'mdi-folder-open' : 'mdi-folder'"
              class="ml-1"
            />
          </template>

          <template #item="{ props, item }">
            <v-list-item :disabled="item.type === 'UNCHANGED'" v-bind="props">
              <template #prepend="{ isSelected, select }">
                <v-list-item-action start>
                  <v-checkbox-btn
                    :model-value="isSelected"
                    @update:model-value="select"
                  />
                </v-list-item-action>
              </template>

              <template #append>
                <v-chip label class="mr-2" v-bind="typeChips[item.type]" />
              </template>
            </v-list-item>
          </template>
        </v-treeview>
      </div>
    </template>

    <template v-if="diff.length > 0 && !fetchStatus.active" #actions>
      <v-spacer />

      <v-btn
        v-tooltip="{
          enabled: selectedPaths.length > 0,
          text: $t('repositories.sync.selectedMods', selectedPaths.length),
        }"
        :text="$t('repositories.sync.sync')"
        :disabled="selectedPaths.length <= 0"
        :loading="syncStatus.active"
        append-icon="mdi-sync"
        color="primary"
        class="mx-2"
        @click="syncRepo()"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type {
  Repository,
  RepositorySyncItem,
} from '~/app/models/repositories/types';

type RepositorySyncMod = {
  name: string;
  path: string;
  size: number;
  type: RepositorySyncItem['type'];
  items: RepositorySyncItem[];
};

type RepositorySyncTreeItem = {
  type: RepositorySyncItem['type'];
  path: string;
  text: string;
  size: number;
  children?: RepositorySyncTreeItem[];
};

const { repository } = defineProps<{
  repository: Repository;
}>();

const { t, locale } = useI18n();
const { settings } = storeToRefs(useSettingsStore());
const { repositoriesState } = storeToRefs(useRepositoriesStore());

// const actionStartedAt = ref<Date | undefined>();
const isFetching = shallowRef(false);
const isSyncComplete = shallowRef(false);
const fetchError = shallowRef('');
const syncError = shallowRef('');
const diff = ref<RepositorySyncItem[]>([]);
const selectedPaths = ref<string[]>([]);

/**
 * Chips definitions for types of diff
 */
const typeChips = computed(() => ({
  CREATE: {
    color: 'green',
    prependIcon: 'mdi-plus',
    text: t('repositories.sync.types.create'),
  },
  UPDATE: {
    color: 'blue',
    prependIcon: 'mdi-pencil',
    text: t('repositories.sync.types.update'),
  },
  DELETE: {
    color: 'red',
    prependIcon: 'mdi-delete',
    text: t('repositories.sync.types.delete'),
  },
  UNCHANGED: {
    color: 'grey',
    text: t('repositories.sync.types.unchanged'),
  },
}));

/**
 * Group diff by mod
 */
const diffMods = computed(() => {
  const map = new Map<
    string,
    RepositorySyncMod & {
      types: Partial<Record<RepositorySyncItem['type'], number>>;
    }
  >();

  for (const item of diff.value) {
    if (!item.mod) {
      continue;
    }

    const { items = [], types = {}, size = 0 } = map.get(item.mod.name) ?? {};

    items.push(item);
    // Keep track of types in mod
    types[item.type] = (types[item.type] ?? 0) + 1;

    map.set(item.mod.name, {
      ...item.mod,
      type: 'CREATE',
      size: size + item.size,
      items,
      types,
    });
  }

  // Assign type of mod based on files
  return [...map.values()].map(({ types, ...mod }) => {
    let type: RepositorySyncItem['type'] = 'UNCHANGED';
    if (types.UPDATE > 0 || (types.CREATE > 0 && types.DELETE > 0)) {
      type = 'UPDATE';
    } else if (types.CREATE > 0) {
      type = 'CREATE';
    } else if (types.DELETE > 0) {
      type = 'DELETE';
    }

    return {
      ...mod,
      type,
    };
  });
});

/**
 * Organize mod diff as a tree
 */
// oxlint-disable-next-line max-lines-per-function
const diffTree = computed(() => {
  // Get separator from OS
  const sep = settings.value.pathSeparator;
  const tree: RepositorySyncTreeItem[] = [];

  for (const item of diffMods.value) {
    // Split path into its parent folders
    const parts = item.path.split(sep);

    let unusedParts: string[] = []; // Usefull when mods are having sub mods
    // Tree as an item, will be updated with reference of parent of item
    let root: RepositorySyncTreeItem = {
      type: 'UNCHANGED',
      path: '',
      size: 0,
      text: '',
      children: tree,
    };

    for (let index = 0; index < parts.length; index += 1) {
      // If last element of the path, it's the mod so we add it to the parent
      if (index === parts.length - 1) {
        root.size += item.size;
        root.children.push({
          ...item,
          text: parts[index],
        });

        continue;
      }

      // Get current identifier
      const path = parts.slice(0, index + 1).join(sep);
      // Find current parent in current list of items
      let parent = root.children.find((elem) => elem.path === path);

      // If no parent with identifier, create one and add it to current list of items
      if (!parent) {
        parent = {
          type: 'UNCHANGED',
          text: [...unusedParts, parts[index]].join(sep),
          size: 0,
          path,
          children: [],
        };

        unusedParts = [];
        root.children.push(parent);
      }

      // Ignore if child of mod
      if (!parent.children) {
        unusedParts.push(parts[index]);

        continue;
      }

      // Set current parent as root
      root = parent;
    }
  }

  return tree;
});

/**
 * Fetch status of current repository ready to be used in template
 */
const fetchStatus = computed(() => {
  const queue = repositoriesState.value.checkStatus[repository.name];
  let progress = 0;
  if (queue) {
    progress = queue.done / (queue.total || 1);
  }

  return {
    active: isFetching.value || queue?.active || false,
    done: queue?.done || 0,
    total: queue?.total || 0,
    progress: progress * 100,
    percent: progress.toLocaleString(locale.value, { style: 'percent' }),
  };
});

/**
 * Sync status of current repository ready to be used in template
 */
const syncStatus = computed(() => {
  const queue = repositoriesState.value.syncStatus[repository.name];
  let progress = 0;
  if (queue) {
    progress = queue.done / (queue.total || 1);
  }

  return {
    active: queue?.active || false,
    done: queue?.done || 0,
    total: queue?.total || 0,
    progress: progress * 100,
    percent: progress.toLocaleString(locale.value, { style: 'percent' }),
  };
});

/**
 * Status of the current action, mainly used in loading bar
 */
const loadingBar = computed(() => {
  const status = fetchStatus.value.active
    ? fetchStatus.value
    : syncStatus.value;

  // if (status.active) {
  //   const stats = {};
  //
  //   return fetchStatus.value;
  // }

  return status;
});

/**
 * Current content of the alert
 */
const alert = computed(() => {
  // Don't show if loading
  if (fetchStatus.value.active || syncStatus.value.active) {
    return;
  }

  // Show error
  if (fetchError.value || syncError.value) {
    return {
      type: 'error' as const,
      title: t('repositories.sync.error'),
      text: fetchError.value || syncError.value,
    };
  }

  // Sync was done, show result
  if (isSyncComplete.value) {
    return {
      type: 'success' as const,
      text: t('repositories.sync.syncOk'),
    };
  }

  // No fetch was done yet, ask to do it
  if (diff.value.length <= 0) {
    return {
      text: t('repositories.sync.pending'),
    };
  }

  // Changes were detected, promt to sync
  const changedMods = diffMods.value.filter(({ type }) => type !== 'UNCHANGED');
  if (changedMods.length > 0) {
    return {
      type: 'info' as const,
      text: t('repositories.sync.syncAvailable', { mods: changedMods.length }),
    };
  }

  return;
});

/**
 * Are all changes selected
 */
const isAllSelected = computed(() => {
  const changedMods = diffMods.value.filter(({ type }) => type !== 'UNCHANGED');
  return changedMods.length === selectedPaths.value.length;
});

/**
 * Select all changes, or select none
 */
function toggleAll(): void {
  if (isAllSelected.value) {
    selectedPaths.value = [];
    return;
  }

  const changedMods = diffMods.value.filter(({ type }) => type !== 'UNCHANGED');
  selectedPaths.value = changedMods.map(({ path }) => path);
}

/**
 * Start fetching repository
 */
async function fetchDiff(): Promise<void> {
  fetchError.value = '';
  isFetching.value = true;

  try {
    const data = await window.ipc.methods.fetchRepository(
      toRawDeep(repository)
    );

    diff.value = data.toSorted((itemA, itemB) =>
      itemA.path.localeCompare(itemB.path, locale.value)
    );
  } catch (err) {
    fetchError.value = err.message;
  }

  isFetching.value = false;
}

/**
 * Start syncing selected changes
 */
async function syncRepo(): Promise<void> {
  syncError.value = '';
  isSyncComplete.value = false;

  const selectedPathsSet = new Set(selectedPaths.value);
  const selectedMods = diffMods.value.filter((mod) =>
    selectedPathsSet.has(mod.path)
  );
  const selectedDiff = selectedMods.flatMap(({ items }) => items);

  try {
    await window.ipc.methods.syncRepository(
      toRawDeep(repository),
      toRawDeep(selectedDiff)
    );
    isSyncComplete.value = true;
  } catch (err) {
    syncError.value = err.message;
  }
}
</script>
