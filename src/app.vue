<template>
  <v-app>
    <h1>💖 Hello World!</h1>

    <div>
      <v-btn @click="counter.decrement">-</v-btn>
      <v-chip>{{ counter.count }}</v-chip>
      <v-btn @click="counter.increment">+</v-btn>
    </div>
  </v-app>
</template>

<script setup lang="ts">
const counter = useCounterStore();
</script>
