<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  X,
  Plus,
  Search,
  UserPlus,
  Trash2,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useUiStore } from '../stores/ui'
import { api } from '../utils/api'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import StatusBadge from './StatusBadge.vue'
import ConfirmDialog from './ConfirmDialog.vue'

interface SystemUser {
  id: string
  name: string
  email: string
  createdAt: string
}

const auth = useAuthStore()
const toast = useToastStore()
const ui = useUiStore()

const users = ref<SystemUser[]>([])
const loading = ref(false)
const searchQuery = ref('')

const isAddingUser = ref(false)
const newName = ref('')
const newEmail = ref('')
const newPassword = ref('')
const isSubmittingNew = ref(false)
const addError = ref('')

const isConfirmDeleteOpen = ref(false)
const userToDelete = ref<SystemUser | null>(null)
const isDeleting = ref(false)

async function loadUsers() {
  loading.value = true
  try {
    const res = await api<{ data: SystemUser[] }>('/users')
    users.value = res.data
  } catch (err) {
    toast.error('Erro ao carregar usuários', err instanceof Error ? err.message : 'Falha na requisição.')
  } finally {
    loading.value = false
  }
}

watch(() => ui.isUsersOpen, (open) => {
  if (open) {
    loadUsers()
    isAddingUser.value = false
    searchQuery.value = ''
    addError.value = ''
  }
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

async function handleAddUser() {
  addError.value = ''
  if (newName.value.trim().length < 2) {
    addError.value = 'Nome deve possuir ao menos 2 caracteres.'
    return
  }
  if (!newEmail.value.includes('@')) {
    addError.value = 'Informe um e-mail válido.'
    return
  }
  if (newPassword.value.length < 8) {
    addError.value = 'A senha temporária deve possuir ao menos 8 caracteres.'
    return
  }

  isSubmittingNew.value = true
  try {
    const res = await api<{ user: SystemUser }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: newName.value.trim(),
        email: newEmail.value.trim(),
        password: newPassword.value,
      }),
    })

    users.value.unshift(res.user)
    toast.success('Usuário adicionado', `O usuário ${res.user.name} foi adicionado à equipe.`)
    newName.value = ''
    newEmail.value = ''
    newPassword.value = ''
    isAddingUser.value = false
  } catch (err) {
    addError.value = err instanceof Error ? err.message : 'Falha ao cadastrar usuário.'
  } finally {
    isSubmittingNew.value = false
  }
}

function promptDelete(user: SystemUser) {
  if (user.id === auth.user?.id) {
    toast.warning('Ação não permitida', 'Você não pode excluir sua própria conta.')
    return
  }
  userToDelete.value = user
  isConfirmDeleteOpen.value = true
}

async function executeDeleteUser() {
  if (!userToDelete.value) return
  isDeleting.value = true
  try {
    await api(`/users/${userToDelete.value.id}`, { method: 'DELETE' })
    users.value = users.value.filter((u) => u.id !== userToDelete.value?.id)
    toast.success('Usuário removido', 'O acesso foi revogado com sucesso.')
    isConfirmDeleteOpen.value = false
    userToDelete.value = null
  } catch (err) {
    toast.error('Erro ao excluir', err instanceof Error ? err.message : 'Falha na exclusão.')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isUsersOpen" class="modal-backdrop" @click.self="ui.closeUsers">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="users-title">
          <div class="modal-header">
            <div>
              <h3 id="users-title" class="modal-title">Gestão de Usuários</h3>
              <p class="modal-subtitle">Controle os membros da equipe que possuem acesso ao sistema AtendeFlow.</p>
            </div>
            <button type="button" class="close-btn" aria-label="Fechar" @click="ui.closeUsers">
              <X :size="20" />
            </button>
          </div>

          <!-- Barra de Ações: Busca e Adicionar -->
          <div class="toolbar">
            <div class="search-box">
              <Search :size="16" class="search-icon" />
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Buscar por nome ou e-mail..."
                class="search-input"
              />
            </div>

            <BaseButton
              v-if="!isAddingUser"
              variant="secondary"
              size="md"
              @click="isAddingUser = true"
            >
              <UserPlus :size="16" />
              <span>Convidar usuário</span>
            </BaseButton>
          </div>

          <!-- Formulário Retrátil para Adicionar Usuário -->
          <Transition name="expand">
            <form v-if="isAddingUser" class="add-user-panel" @submit.prevent="handleAddUser">
              <div class="add-panel-header">
                <h4 class="add-panel-title">Novo Membro da Equipe</h4>
                <button type="button" class="panel-close-btn" @click="isAddingUser = false">
                  <X :size="16" />
                </button>
              </div>

              <div class="grid-3">
                <BaseInput v-model="newName" label="Nome completo" placeholder="Ex: Maria Oliveira" required :minlength="2">
                  <template #icon><UserIcon :size="16" /></template>
                </BaseInput>

                <BaseInput v-model="newEmail" type="email" label="E-mail" placeholder="maria@empresa.com" required>
                  <template #icon><Mail :size="16" /></template>
                </BaseInput>

                <BaseInput v-model="newPassword" type="password" label="Senha inicial" placeholder="Mínimo 8 caracteres" required :minlength="8" />
              </div>

              <p v-if="addError" class="error-text" role="alert">{{ addError }}</p>

              <div class="panel-actions">
                <BaseButton type="button" variant="outline" size="sm" :disabled="isSubmittingNew" @click="isAddingUser = false">
                  Cancelar
                </BaseButton>
                <BaseButton type="submit" variant="primary" size="sm" :loading="isSubmittingNew">
                  <Plus :size="14" />
                  <span>Cadastrar usuário</span>
                </BaseButton>
              </div>
            </form>
          </Transition>

          <!-- Lista de Usuários -->
          <div class="users-list-wrapper">
            <div v-if="loading" class="users-loading">
              Carregando lista de usuários...
            </div>

            <div v-else-if="filteredUsers.length" class="users-grid">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-card"
                :class="{ 'current-user-card': user.id === auth.user?.id }"
              >
                <div class="user-avatar-circle">
                  {{ getInitials(user.name) }}
                </div>

                <div class="user-info-col">
                  <div class="user-title-row">
                    <span class="user-card-name">{{ user.name }}</span>
                    <span v-if="user.id === auth.user?.id" class="you-badge">(Você)</span>
                  </div>
                  <span class="user-card-email">{{ user.email }}</span>
                  <div class="user-meta-row">
                    <span class="meta-tag"><Shield :size="11" /> Administrador</span>
                    <span class="meta-dot">•</span>
                    <span class="meta-tag"><Calendar :size="11" /> {{ new Date(user.createdAt).toLocaleDateString('pt-BR') }}</span>
                  </div>
                </div>

                <div class="user-actions-col">
                  <StatusBadge status="Resolvido">Ativo</StatusBadge>

                  <button
                    v-if="user.id !== auth.user?.id"
                    type="button"
                    class="user-delete-btn"
                    title="Excluir usuário"
                    aria-label="Excluir usuário"
                    @click="promptDelete(user)"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="users-empty">
              <p>Nenhum usuário encontrado com os filtros aplicados.</p>
            </div>
          </div>

          <div class="modal-footer">
            <span class="count-label">Total: {{ users.length }} usuário(s) ativos</span>
            <BaseButton variant="outline" size="md" @click="ui.closeUsers">
              Fechar
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmDialog
      v-model="isConfirmDeleteOpen"
      title="Remover acesso do usuário?"
      :message="`O usuário ${userToDelete?.name} (${userToDelete?.email}) não conseguirá mais autenticar no sistema.`"
      confirm-text="Sim, remover"
      cancel-text="Cancelar"
      variant="danger"
      :loading="isDeleting"
      @confirm="executeDeleteUser"
    />
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  animation: scaleUp 0.15s ease-out;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--font-size-title-2);
  font-weight: 700;
  color: var(--color-text-primary);
}

.modal-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.close-btn {
  color: var(--color-text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 240px;
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

/* Painel de Adicionar Usuário */
.add-user-panel {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.add-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-panel-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
}

.panel-close-btn {
  color: var(--color-text-secondary);
  padding: 2px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--color-danger-text);
}

/* Lista */
.users-list-wrapper {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.users-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.user-card:hover {
  background-color: var(--color-bg);
}

.current-user-card {
  border-color: rgba(20, 184, 166, 0.4);
  background-color: #F0FDF4;
}

.user-avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #18324A 0%, #244667 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info-col {
  flex: 1;
  min-width: 0;
}

.user-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-card-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.you-badge {
  font-size: 11px;
  color: var(--color-secondary);
  font-weight: 600;
}

.user-card-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
}

.user-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.user-actions-col {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-delete-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.user-delete-btn:hover {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.users-empty,
.users-loading {
  text-align: center;
  padding: var(--space-8);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.count-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 600px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
