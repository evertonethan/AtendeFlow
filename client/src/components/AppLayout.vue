<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const isSidebarOpen = ref(false)

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

function onSearch(query: string) {
  emit('search', query)
}
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <AppSidebar
      :open="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <!-- Área principal de conteúdo -->
    <div class="layout-main">
      <AppHeader
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @search="onSearch"
      />

      <main class="layout-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  min-width: 0;
  min-height: 100vh;
  transition: margin-left var(--transition-base);
}

.layout-content {
  flex: 1;
  padding: var(--space-6);
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .layout-main {
    margin-left: 0;
  }

  .layout-content {
    padding: var(--space-4);
  }
}
</style>
