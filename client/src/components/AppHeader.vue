<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'search', query: string): void
}>()

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const isMenuOpen = ref(false)
const searchQuery = ref('')

const displayName = computed(() => {
  if (auth.user?.name) return auth.user.name
  return 'Usuário'
})

const initials = computed(() => {
  const parts = displayName.value.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return displayName.value.slice(0, 2).toUpperCase()
})

function handleSearch(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('search', value)
}

function handleNotificationClick() {
  toast.info('Notificações', 'Você não possui notificações pendentes.')
}

function logout() {
  auth.logout()
  toast.success('Desconectado', 'Sua sessão foi encerrada com sucesso.')
  router.push('/login')
}

function closeDropdown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-profile-menu')) {
    isMenuOpen.value = false
  }
}

onMounted(() => window.addEventListener('click', closeDropdown))
onUnmounted(() => window.removeEventListener('click', closeDropdown))
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Botão toggle menu mobile -->
      <button
        type="button"
        class="header-icon-btn mobile-menu-btn"
        aria-label="Abrir menu lateral"
        @click="emit('toggle-sidebar')"
      >
        <Menu :size="20" />
      </button>

      <!-- Barra de busca global -->
      <div class="header-search">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar solicitações, usuários..."
          aria-label="Buscar no sistema"
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="header-right">
      <!-- Sino de Notificações -->
      <button
        type="button"
        class="header-icon-btn notification-btn"
        aria-label="Notificações"
        @click="handleNotificationClick"
      >
        <Bell :size="18" />
        <span class="notification-badge" aria-hidden="true" />
      </button>

      <!-- Divisor -->
      <div class="header-divider" aria-hidden="true" />

      <!-- Menu de Perfil -->
      <div class="user-profile-menu">
        <button
          type="button"
          class="user-profile-btn"
          :aria-expanded="isMenuOpen"
          aria-haspopup="true"
          @click.stop="isMenuOpen = !isMenuOpen"
        >
          <div class="user-avatar" aria-hidden="true">
            {{ initials }}
          </div>
          <div class="user-info">
            <span class="user-greeting">Olá, {{ displayName }}</span>
            <span class="user-role">Administrador</span>
          </div>
          <ChevronDown :size="16" class="chevron-icon" :class="{ 'rotate-180': isMenuOpen }" />
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="isMenuOpen" class="user-dropdown">
            <div class="dropdown-header">
              <span class="dropdown-user-name">{{ displayName }}</span>
              <span class="dropdown-user-email">{{ auth.user?.email }}</span>
            </div>

            <div class="dropdown-divider" />

            <button type="button" class="dropdown-item" @click="toast.info('Perfil', 'Em breve!')">
              <UserIcon :size="16" />
              <span>Meu perfil</span>
            </button>

            <button type="button" class="dropdown-item text-danger" @click="logout">
              <LogOut :size="16" />
              <span>Encerrar sessão</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  max-width: 480px;
}

.mobile-menu-btn {
  display: none;
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 var(--space-3) 0 38px;
  font-size: var(--font-size-xs);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.search-input:focus {
  background-color: var(--color-surface);
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background-color: transparent;
  transition: all var(--transition-fast);
  position: relative;
}

.header-icon-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--color-danger);
  box-shadow: 0 0 0 2px var(--color-surface);
}

.header-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
}

.user-profile-menu {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.user-profile-btn:hover {
  background-color: var(--color-surface-hover);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #18324A 0%, #244667 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(24, 50, 74, 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-greeting {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.chevron-icon {
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.rotate-180 {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.dropdown-header {
  padding: var(--space-3) var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
}

.dropdown-user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.dropdown-user-email {
  font-size: 11px;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-1) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  transition: background-color var(--transition-fast);
  text-align: left;
  width: 100%;
}

.dropdown-item:hover {
  background-color: var(--color-surface-hover);
}

.dropdown-item.text-danger {
  color: var(--color-danger);
}
.dropdown-item.text-danger:hover {
  background-color: var(--color-danger-bg);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .app-header {
    padding: 0 var(--space-4);
  }
  .mobile-menu-btn {
    display: flex;
  }
  .user-role {
    display: none;
  }
}

@media (max-width: 600px) {
  .header-search {
    display: none;
  }
  .user-greeting {
    display: none;
  }
}
</style>
