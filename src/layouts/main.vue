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
import { useDisplay } from 'vuetify';

type NavItem = {
  title: string;
  prependIcon: string;
  baseColor?: string;
  to?: string;
  onClick?: () => void;
};

const { smAndDown } = useDisplay();
const { t } = useI18n();

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
    title: t('mods.title'),
    prependIcon: 'mdi-toy-brick',
    to: '/',
  },
  {
    title: t('repositories.title'),
    prependIcon: 'mdi-cloud-sync',
    to: '/repositories',
  },
]);

const footItems = computed<NavItem[]>(() => [
  {
    title: t('settings.title'),
    prependIcon: 'mdi-cog',
    to: '/settings',
    baseColor: isValid.value ? undefined : 'red',
  },
  {
    title: t('about.title'),
    prependIcon: 'mdi-information',
    to: '/about',
  },
]);
</script>
