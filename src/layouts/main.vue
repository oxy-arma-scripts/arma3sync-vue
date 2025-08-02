<template>
  <v-app-bar>
    <template #prepend>
      <v-btn icon="mdi-menu" @click="toggleNav()" />
    </template>

    <template #title>
      Arma3Sync Vue
    </template>

    <template #append>
      <PlayBtn class="mr-2" />
    </template>
  </v-app-bar>

  <v-navigation-drawer
    :model-value="navState.show"
    :rail="navState.rail"
    mobile-breakpoint="sm"
  >
    <v-list>
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        v-tooltip="{ text: item.title, disabled: showNav }"
        v-bind="item"
      />
    </v-list>

    <template #append>
      <v-list>
        <v-list-item
          v-for="item in footItems"
          :key="item.title"
          v-tooltip="{ text: item.title, disabled: showNav }"
          v-bind="item"
        />
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-main>
    <RouterView />
  </v-main>
</template>

<script setup lang="ts">
import { useTheme, useDisplay } from 'vuetify';

type NavItem = {
  title: string;
  prependIcon: string;
  baseColor?: string;
  to?: string;
  onClick?: () => void;
};

const isDark = useDark();
const theme = useTheme();
const { smAndDown } = useDisplay();

const toggleDark = useToggle(isDark);
const [showNav, toggleNav] = useToggle(false);

const { isValid } = storeToRefs(useSettingsStore());

const navState = computed(() => {
  if (smAndDown.value) {
    return {
      show: showNav.value,
      rail: false,
    };
  }
  return {
    show: true,
    rail: !showNav.value,
  };
});

const navItems = computed<NavItem[]>(() => [
  {
    title: 'Mods',
    prependIcon: 'mdi-toy-brick',
    to: '/',
  },
]);

const footItems = computed<NavItem[]>(() => [
  {
    ...isDark.value ? { prependIcon: 'mdi-brightness-4', title: 'Dark mode' } : { prependIcon: 'mdi-brightness-6', title: 'Light mode' },
    onClick: () => toggleDark(),
  },
  {
    title: 'Settings',
    prependIcon: 'mdi-cog',
    to: '/settings',
    baseColor: isValid.value ? undefined : 'red',
  },
  {
    title: 'About',
    prependIcon: 'mdi-information',
    to: '/about',
  },
]);

watch(isDark, () => {
  theme.global.name.value = isDark.value ? 'dark' : 'light';
}, { immediate: true });
</script>
