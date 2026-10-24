<script setup lang="ts">
import { useUiStore } from '../stores/ui'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import UserProfileModal from './UserProfileModal.vue'
import UsersManagementModal from './UsersManagementModal.vue'
import ReportsModal from './ReportsModal.vue'
import SettingsModal from './SettingsModal.vue'

const ui = useUiStore()
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <AppSidebar
      :open="ui.isSidebarOpen"
      @close="ui.closeSidebar"
    />

    <!-- Área principal de conteúdo -->
    <div class="layout-main">
      <AppHeader />

      <main class="layout-content">
        <slot />
      </main>
    </div>

    <!-- Modais Globais do Sistema -->
    <UserProfileModal />
    <UsersManagementModal />
    <ReportsModal />
    <SettingsModal />
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
