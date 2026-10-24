<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastNotification from './components/ToastNotification.vue'
</script>

<template>
  <div id="atendeflow-root">
    <RouterView />
    <ToastNotification />
  </div>
</template>

<style scoped>
#atendeflow-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
