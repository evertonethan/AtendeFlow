import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isProfileOpen = ref(false)
  const isUsersOpen = ref(false)
  const isReportsOpen = ref(false)
  const isSettingsOpen = ref(false)
  const isSidebarOpen = ref(false)
  const globalSearch = ref('')

  function openProfile() {
    isProfileOpen.value = true
  }

  function closeProfile() {
    isProfileOpen.value = false
  }

  function openUsers() {
    isUsersOpen.value = true
  }

  function closeUsers() {
    isUsersOpen.value = false
  }

  function openReports() {
    isReportsOpen.value = true
  }

  function closeReports() {
    isReportsOpen.value = false
  }

  function openSettings() {
    isSettingsOpen.value = true
  }

  function closeSettings() {
    isSettingsOpen.value = false
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function closeSidebar() {
    isSidebarOpen.value = false
  }

  return {
    isProfileOpen,
    isUsersOpen,
    isReportsOpen,
    isSettingsOpen,
    isSidebarOpen,
    globalSearch,
    openProfile,
    closeProfile,
    openUsers,
    closeUsers,
    openReports,
    closeReports,
    openSettings,
    closeSettings,
    toggleSidebar,
    closeSidebar,
  }
})
