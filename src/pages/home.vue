<template>
  <v-container>
    <v-row>
      <v-col cols="12" order="3" md="4" order-md="1">
        <ModActiveList />
      </v-col>

      <v-col cols="12" order="2" md="8" order-md="2">
        <ModsetList />

        <ModSourceList />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
