<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  X,
  MessageSquare,
} from 'lucide-vue-next'
import { useUiStore } from '../stores/ui'

defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const ui = useUiStore()

function handleItemClick(action?: () => void) {
  emit('close')
  if (action) action()
}

function isCurrent(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path) && path !== '/'
}
</script>

<template>
  <div>
    <!-- Backdrop para mobile -->
    <div
      v-if="open"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="emit('close')"
    />

    <aside :class="['app-sidebar', { 'sidebar-open': open }]">
      <!-- Topo: Logo -->
      <div class="sidebar-header">
        <RouterLink to="/" class="sidebar-brand" @click="emit('close')">
          <div class="brand-logo-icon">
            <MessageSquare :size="20" class="logo-chat-icon" />
          </div>
          <span class="brand-name">
            Atende<span class="brand-flow">Flow</span>
          </span>
        </RouterLink>

        <button
          type="button"
          class="sidebar-close-btn"
          aria-label="Fechar menu"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Navegação Principal -->
      <nav class="sidebar-nav">
        <div class="nav-section-title">Navegação</div>
        <ul class="nav-list">
          <li class="nav-item">
            <RouterLink
              to="/"
              :class="['nav-link', { active: isCurrent('/') }]"
              @click="handleItemClick()"
            >
              <LayoutDashboard :size="18" class="nav-icon" />
              <span class="nav-label">Dashboard</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              to="/solicitacoes"
              :class="['nav-link', { active: isCurrent('/solicitacoes') }]"
              @click="handleItemClick()"
            >
              <FileText :size="18" class="nav-icon" />
              <span class="nav-label">Solicitações</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <button
              type="button"
              class="nav-link nav-btn"
              @click="handleItemClick(() => ui.openUsers())"
            >
              <Users :size="18" class="nav-icon" />
              <span class="nav-label">Usuários</span>
            </button>
          </li>

          <li class="nav-item">
            <button
              type="button"
              class="nav-link nav-btn"
              @click="handleItemClick(() => ui.openReports())"
            >
              <BarChart3 :size="18" class="nav-icon" />
              <span class="nav-label">Relatórios</span>
            </button>
          </li>

          <li class="nav-item">
            <button
              type="button"
              class="nav-link nav-btn"
              @click="handleItemClick(() => ui.openSettings())"
            >
              <Settings :size="18" class="nav-icon" />
              <span class="nav-label">Configurações</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Rodapé da sidebar -->
      <div class="sidebar-footer">
        <div class="app-version">
          <span>AtendeFlow v1.0</span>
          <span class="system-status-indicator" title="Sistema online" />
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--color-primary);
  color: var(--color-text-inverted);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  transition: transform var(--transition-base);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
}

.brand-logo-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(20, 184, 166, 0.4);
}

.brand-name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: white;
}

.brand-flow {
  color: var(--color-secondary);
}

.sidebar-close-btn {
  display: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.sidebar-close-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  overflow-y: auto;
}

.nav-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.4);
  padding: 0 var(--space-3) var(--space-2);
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: #94A3B8;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  text-decoration: none;
  position: relative;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  background-color: #244667;
  color: white;
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background-color: var(--color-secondary);
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.5);
}

.app-version {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.system-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

/* Responsividade Mobile e Tablet */
@media (max-width: 900px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-close-btn {
    display: flex;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(2px);
    z-index: 99;
  }
}
</style>
