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
  Sliders,
  Users,
  FileText,
  ArrowRight,
  X,
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useRequestsStore } from '../stores/requests'
import { useToastStore } from '../stores/toast'
import { useUiStore } from '../stores/ui'
import StatusBadge from './StatusBadge.vue'

const auth = useAuthStore()
const requestsStore = useRequestsStore()
const toast = useToastStore()
const ui = useUiStore()
const router = useRouter()

const isMenuOpen = ref(false)
const isSearchFocused = ref(false)
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

// Resultados de busca rápida
const searchResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q || q.length < 2) return []

  return requestsStore.items
    .filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
    .slice(0, 5)
})

function submitSearch() {
  if (searchQuery.value.trim()) {
    isSearchFocused.value = false
    router.push({ path: '/solicitacoes', query: { q: searchQuery.value.trim() } })
  }
}

function selectResult(id: string) {
  isSearchFocused.value = false
  searchQuery.value = ''
  router.push({ path: '/solicitacoes', query: { q: id.slice(0, 8) } })
}

function clearSearch() {
  searchQuery.value = ''
  isSearchFocused.value = false
}

function handleNotificationClick() {
  toast.info('Notificações', 'Você está em dia! Nenhuma notificação urgente pendente.')
}

function logout() {
  auth.logout()
  toast.success('Desconectado', 'Sua sessão foi encerrada com sucesso.')
  router.push('/login')
}

function closeDropdowns(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-profile-menu')) {
    isMenuOpen.value = false
  }
  if (!target.closest('.header-search-container')) {
    isSearchFocused.value = false
  }
}

onMounted(() => window.addEventListener('click', closeDropdowns))
onUnmounted(() => window.removeEventListener('click', closeDropdowns))
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Botão toggle menu mobile -->
      <button
        type="button"
        class="header-icon-btn mobile-menu-btn"
        aria-label="Abrir menu lateral"
        @click="ui.toggleSidebar()"
      >
        <Menu :size="20" />
      </button>

      <!-- Barra de busca global com autocomplete -->
      <div class="header-search-container">
        <div class="header-search">
          <Search :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar solicitações, usuários..."
            aria-label="Buscar no sistema"
            class="search-input"
            @focus="isSearchFocused = true"
            @keydown.enter.prevent="submitSearch"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-btn"
            aria-label="Limpar busca"
            @click="clearSearch"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Popover de Resultados Rápidos -->
        <div
          v-if="isSearchFocused && searchQuery.length >= 2"
          class="search-results-popover"
        >
          <div class="search-results-header">
            <span>Resultados para "{{ searchQuery }}"</span>
            <span class="results-count">{{ searchResults.length }} encontrada(s)</span>
          </div>

          <div v-if="searchResults.length" class="results-list">
            <button
              v-for="item in searchResults"
              :key="item.id"
              type="button"
              class="result-item"
              @click="selectResult(item.id)"
            >
              <div class="result-icon">
                <FileText :size="16" />
              </div>
              <div class="result-info">
                <span class="result-title">{{ item.title }}</span>
                <span class="result-meta">SIL-2024-{{ item.id.slice(0, 4).toUpperCase() }} • {{ item.category }}</span>
              </div>
              <StatusBadge :status="item.status" />
            </button>
          </div>

          <div v-else class="results-empty">
            <p>Nenhuma solicitação encontrada.</p>
          </div>

          <div class="search-results-footer">
            <button type="button" class="view-all-results-btn" @click="submitSearch">
              <span>Ver todas em Solicitações</span>
              <ArrowRight :size="13" />
            </button>
          </div>
        </div>
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

            <!-- Meu Perfil 100% Funcional -->
            <button
              type="button"
              class="dropdown-item"
              @click="isMenuOpen = false; ui.openProfile()"
            >
              <UserIcon :size="16" />
              <span>Meu perfil</span>
            </button>

            <!-- Gestão de Usuários -->
            <button
              type="button"
              class="dropdown-item"
              @click="isMenuOpen = false; ui.openUsers()"
            >
              <Users :size="16" />
              <span>Usuários e equipe</span>
            </button>

            <!-- Configurações -->
            <button
              type="button"
              class="dropdown-item"
              @click="isMenuOpen = false; ui.openSettings()"
            >
              <Sliders :size="16" />
              <span>Configurações</span>
            </button>

            <div class="dropdown-divider" />

            <!-- Sair -->
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
  max-width: 520px;
}

.mobile-menu-btn {
  display: none;
}

.header-search-container {
  position: relative;
  width: 100%;
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
  padding: 0 32px 0 38px;
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

.clear-search-btn {
  position: absolute;
  right: 8px;
  color: var(--color-text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.clear-search-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-surface-hover);
}

/* Popover de Resultados */
.search-results-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  font-size: 11px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.results-count {
  font-weight: 600;
}

.results-list {
  display: flex;
  flex-direction: column;
  max-height: 260px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color var(--transition-fast);
}

.result-item:hover {
  background-color: #F8FAFC;
}

.result-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background-color: #EFF6FF;
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 11px;
  color: var(--color-text-muted);
}

.results-empty {
  padding: var(--space-4);
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.search-results-footer {
  padding: 6px var(--space-3);
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.view-all-results-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-info);
  cursor: pointer;
  width: 100%;
  justify-content: center;
}
.view-all-results-btn:hover {
  text-decoration: underline;
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
  .header-left {
    max-width: 100%;
  }
  .user-greeting {
    display: none;
  }
}
</style>
