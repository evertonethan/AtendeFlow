<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MoreHorizontal,
  X,
} from 'lucide-vue-next'
import { useRequestsStore } from '../stores/requests'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import type { Priority, RequestItem, Status } from '../types'
import AppLayout from '../components/AppLayout.vue'
import DataTable, { type Column } from '../components/DataTable.vue'
import StatusBadge from '../components/StatusBadge.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'

const store = useRequestsStore()
const auth = useAuthStore()
const toast = useToastStore()

// Filtros
const search = ref('')
const statusFilter = ref<string>('Todos os status')
const priorityFilter = ref<string>('Todas as prioridades')
const categoryFilter = ref<string>('Todas as categorias')

const statusOptions = [
  { label: 'Todos os status', value: 'Todos os status' },
  { label: 'Aberta', value: 'Aberta' },
  { label: 'Em andamento', value: 'Em andamento' },
  { label: 'Concluída', value: 'Concluída' },
]

const priorityOptions = [
  { label: 'Todas as prioridades', value: 'Todas as prioridades' },
  { label: 'Baixa', value: 'Baixa' },
  { label: 'Média', value: 'Média' },
  { label: 'Alta', value: 'Alta' },
]

const categoryOptions = [
  { label: 'Todas as categorias', value: 'Todas as categorias' },
  { label: 'Suporte técnico', value: 'Suporte técnico' },
  { label: 'Acesso e conta', value: 'Acesso e conta' },
  { label: 'Cadastro', value: 'Cadastro' },
  { label: 'Relatórios', value: 'Relatórios' },
  { label: 'Financeiro', value: 'Financeiro' },
  { label: 'Outro', value: 'Outro' },
]

// Modal de Criação / Edição
const isFormModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref('')
const formCategory = ref('Suporte técnico')
const formPriority = ref<Priority>('Média')
const formStatus = ref<Status>('Aberta')
const formDescription = ref('')
const formError = ref('')
const formSubmitting = ref(false)

// Diálogo de Confirmação de Exclusão
const isDeleteDialogOpen = ref(false)
const itemToDelete = ref<RequestItem | null>(null)
const isDeleting = ref(false)

// Dropdown de Ações por Linha
const activeActionMenuId = ref<string | null>(null)

// Definição das Colunas da Tabela
const columns: Column<RequestItem>[] = [
  { key: 'protocol', label: '#', width: '120px' },
  { key: 'title', label: 'Título' },
  { key: 'solicitante', label: 'Solicitante', width: '140px' },
  { key: 'category', label: 'Categoria', width: '130px' },
  { key: 'priority', label: 'Prioridade', width: '110px' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'createdAt', label: 'Data de abertura', width: '130px' },
  { key: 'actions', label: 'Ações', width: '80px', align: 'center' },
]

// Carregamento inicial e debounce
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function fetchFiltered() {
  const queryParams: Record<string, string> = {}
  if (search.value.trim()) queryParams.q = search.value.trim()
  if (statusFilter.value && statusFilter.value !== 'Todos os status') queryParams.status = statusFilter.value
  if (priorityFilter.value && priorityFilter.value !== 'Todas as prioridades') queryParams.priority = priorityFilter.value

  store.load(queryParams)
}

onMounted(() => {
  fetchFiltered()
})

watch([search, statusFilter, priorityFilter], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchFiltered()
  }, 300)
})

// Filtragem local adicional (ex: categoria)
const filteredItems = computed(() => {
  let list = store.items
  if (categoryFilter.value && categoryFilter.value !== 'Todas as categorias') {
    list = list.filter((item) => item.category === categoryFilter.value)
  }
  return list
})

function formatProtocol(id: string) {
  return `SIL-2024-${id.slice(0, 4).toUpperCase()}`
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Abrir modal de criação
function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formTitle.value = ''
  formCategory.value = 'Suporte técnico'
  formPriority.value = 'Média'
  formStatus.value = 'Aberta'
  formDescription.value = ''
  formError.value = ''
  isFormModalOpen.value = true
}

// Abrir modal de edição
function openEditModal(item: RequestItem) {
  isEditing.value = true
  editingId.value = item.id
  formTitle.value = item.title
  formCategory.value = item.category
  formPriority.value = item.priority
  formStatus.value = item.status
  formDescription.value = item.description
  formError.value = ''
  activeActionMenuId.value = null
  isFormModalOpen.value = true
}

// Submeter formulário (Criar ou Atualizar)
async function submitForm() {
  formError.value = ''
  if (formTitle.value.trim().length < 4) {
    formError.value = 'O título deve possuir pelo menos 4 caracteres.'
    return
  }
  if (formDescription.value.trim().length < 8) {
    formError.value = 'A descrição deve possuir pelo menos 8 caracteres.'
    return
  }

  formSubmitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await store.update(editingId.value, {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        category: formCategory.value,
        priority: formPriority.value,
        status: formStatus.value,
      })
      toast.success('Solicitação atualizada!', 'As alterações foram salvas com sucesso.')
    } else {
      await store.create({
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        category: formCategory.value,
        priority: formPriority.value,
      })
      toast.success('Solicitação criada!', 'Nova solicitação registrada no sistema.')
    }

    isFormModalOpen.value = false
    fetchFiltered()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Não foi possível salvar a solicitação.'
  } finally {
    formSubmitting.value = false
  }
}

// Troca rápida de status pela tabela
async function updateStatusQuick(id: string, newStatus: Status) {
  try {
    await store.update(id, { status: newStatus })
    toast.success('Status atualizado', `Solicitação alterada para ${newStatus}.`)
    activeActionMenuId.value = null
  } catch (e) {
    toast.error('Erro', e instanceof Error ? e.message : 'Falha ao atualizar status.')
  }
}

// Abrir diálogo de exclusão
function confirmDelete(item: RequestItem) {
  itemToDelete.value = item
  activeActionMenuId.value = null
  isDeleteDialogOpen.value = true
}

// Executar exclusão
async function executeDelete() {
  if (!itemToDelete.value) return
  isDeleting.value = true
  try {
    await store.remove(itemToDelete.value.id)
    toast.success('Solicitação excluída', 'O registro foi removido com sucesso.')
    isDeleteDialogOpen.value = false
    itemToDelete.value = null
  } catch (e) {
    toast.error('Erro ao excluir', e instanceof Error ? e.message : 'Não foi possível remover a solicitação.')
  } finally {
    isDeleting.value = false
  }
}

// Fecha menus ao clicar fora
function onWindowClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.action-menu-wrapper')) {
    activeActionMenuId.value = null
  }
}

onMounted(() => window.addEventListener('click', onWindowClick))
</script>

<template>
  <AppLayout>
    <div class="requests-page">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Solicitações</h1>
          <p class="page-subtitle">Gerencie todas as solicitações de atendimento</p>
        </div>

        <BaseButton variant="primary" size="md" @click="openCreateModal">
          <Plus :size="16" />
          <span>Nova solicitação</span>
        </BaseButton>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="filters-card">
        <!-- Campo de Busca -->
        <div class="filter-search-box">
          <Search :size="16" class="search-box-icon" />
          <input
            v-model="search"
            type="search"
            placeholder="Buscar por título, descrição ou protocolo..."
            aria-label="Buscar solicitações"
            class="filter-search-input"
          />
        </div>

        <!-- Filtros Suspensos -->
        <div class="filter-selects-row">
          <div class="filter-select-item">
            <BaseSelect v-model="statusFilter" :options="statusOptions" />
          </div>

          <div class="filter-select-item">
            <BaseSelect v-model="priorityFilter" :options="priorityOptions" />
          </div>

          <div class="filter-select-item">
            <BaseSelect v-model="categoryFilter" :options="categoryOptions" />
          </div>
        </div>
      </div>

      <!-- Tabela Principal de Solicitações (DataTable) -->
      <DataTable
        :columns="columns"
        :items="filteredItems"
        :page-size="6"
        :loading="store.loading"
        empty-message="Nenhuma solicitação encontrada para os filtros selecionados."
      >
        <!-- Coluna: Protocolo -->
        <template #protocol="{ item }">
          <span class="protocol-code">{{ formatProtocol(item.id) }}</span>
        </template>

        <!-- Coluna: Título -->
        <template #title="{ item }">
          <span class="request-row-title" :title="item.title">{{ item.title }}</span>
        </template>

        <!-- Coluna: Solicitante -->
        <template #solicitante>
          <span class="solicitante-text">{{ auth.user?.name || 'João Silva' }}</span>
        </template>

        <!-- Coluna: Categoria -->
        <template #category="{ item }">
          <span class="category-text">{{ item.category }}</span>
        </template>

        <!-- Coluna: Prioridade -->
        <template #priority="{ item }">
          <StatusBadge :priority="item.priority" />
        </template>

        <!-- Coluna: Status -->
        <template #status="{ item }">
          <StatusBadge :status="item.status" />
        </template>

        <!-- Coluna: Data de abertura -->
        <template #createdAt="{ item }">
          <span class="date-text">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- Coluna: Ações -->
        <template #actions="{ item }">
          <div class="action-menu-wrapper">
            <button
              type="button"
              class="action-dots-btn"
              :aria-expanded="activeActionMenuId === item.id"
              aria-label="Opções da solicitação"
              @click.stop="activeActionMenuId = activeActionMenuId === item.id ? null : item.id"
            >
              <MoreHorizontal :size="16" />
            </button>

            <!-- Menu flutuante de ações -->
            <div v-if="activeActionMenuId === item.id" class="action-dropdown-menu">
              <button type="button" class="action-dropdown-item" @click="openEditModal(item)">
                <Edit3 :size="14" />
                <span>Editar detalhes</span>
              </button>

              <div class="dropdown-quick-status">
                <span class="quick-status-title">Alterar status:</span>
                <button
                  type="button"
                  class="status-subitem"
                  :disabled="item.status === 'Aberta'"
                  @click="updateStatusQuick(item.id, 'Aberta')"
                >
                  <span class="status-dot dot-aberto" /> Aberta
                </button>
                <button
                  type="button"
                  class="status-subitem"
                  :disabled="item.status === 'Em andamento'"
                  @click="updateStatusQuick(item.id, 'Em andamento')"
                >
                  <span class="status-dot dot-andamento" /> Em andamento
                </button>
                <button
                  type="button"
                  class="status-subitem"
                  :disabled="item.status === 'Concluída'"
                  @click="updateStatusQuick(item.id, 'Concluída')"
                >
                  <span class="status-dot dot-resolvido" /> Concluída
                </button>
              </div>

              <div class="dropdown-divider" />

              <button type="button" class="action-dropdown-item item-danger" @click="confirmDelete(item)">
                <Trash2 :size="14" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Estado vazio customizado -->
        <template #empty>
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description="Tente redefinir os filtros aplicados ou cadastre uma nova solicitação."
          >
            <template #action>
              <BaseButton variant="primary" size="sm" @click="openCreateModal">
                <Plus :size="14" />
                <span>Nova solicitação</span>
              </BaseButton>
            </template>
          </EmptyState>
        </template>
      </DataTable>

      <!-- Modal de Cadastro / Edição -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="isFormModalOpen" class="modal-backdrop" @click.self="isFormModalOpen = false">
            <div class="modal-card" role="dialog" aria-modal="true" :aria-labelledby="`${isEditing ? 'Editar' : 'Nova'} solicitação`">
              <div class="modal-header">
                <div>
                  <h3 class="modal-title">{{ isEditing ? 'Editar solicitação' : 'Nova solicitação' }}</h3>
                  <p class="modal-subtitle">Preencha os campos para salvar a solicitação de atendimento.</p>
                </div>
                <button
                  type="button"
                  class="modal-close-btn"
                  aria-label="Fechar janela"
                  @click="isFormModalOpen = false"
                >
                  <X :size="20" />
                </button>
              </div>

              <form class="modal-form" @submit.prevent="submitForm">
                <!-- Campo Título -->
                <BaseInput
                  v-model="formTitle"
                  label="Título da solicitação"
                  placeholder="Ex.: Problema no acesso ao sistema"
                  required
                  :minlength="4"
                  :maxlength="120"
                />

                <div class="form-row-2">
                  <!-- Categoria -->
                  <BaseSelect
                    v-model="formCategory"
                    label="Categoria"
                    required
                  >
                    <option value="Suporte técnico">Suporte técnico</option>
                    <option value="Acesso e conta">Acesso e conta</option>
                    <option value="Cadastro">Cadastro</option>
                    <option value="Relatórios">Relatórios</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Outro">Outro</option>
                  </BaseSelect>

                  <!-- Prioridade -->
                  <BaseSelect
                    v-model="formPriority"
                    label="Prioridade"
                    required
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </BaseSelect>
                </div>

                <!-- Status (se estiver editando) -->
                <BaseSelect
                  v-if="isEditing"
                  v-model="formStatus"
                  label="Status"
                  required
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                </BaseSelect>

                <!-- Descrição -->
                <div class="form-group">
                  <label class="form-label" for="form-desc">
                    Descrição detalhada
                    <span class="required-mark">*</span>
                  </label>
                  <textarea
                    id="form-desc"
                    v-model="formDescription"
                    rows="4"
                    required
                    minlength="8"
                    maxlength="2000"
                    placeholder="Descreva detalhadamente a situação ou necessidade de atendimento..."
                    class="form-textarea"
                  />
                  <small class="form-help-text">Mínimo de 8 caracteres.</small>
                </div>

                <!-- Erro de submissão -->
                <p v-if="formError" class="form-error-box" role="alert">
                  {{ formError }}
                </p>

                <!-- Ações do Modal -->
                <div class="modal-footer">
                  <BaseButton
                    type="button"
                    variant="outline"
                    size="md"
                    :disabled="formSubmitting"
                    @click="isFormModalOpen = false"
                  >
                    Cancelar
                  </BaseButton>

                  <BaseButton
                    type="submit"
                    variant="primary"
                    size="md"
                    :loading="formSubmitting"
                  >
                    {{ isEditing ? 'Salvar alterações' : 'Registrar solicitação' }}
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Diálogo de Exclusão -->
      <ConfirmDialog
        v-model="isDeleteDialogOpen"
        title="Excluir solicitação permanentemente?"
        :message="`A solicitação #${itemToDelete?.id?.slice(0, 8)} (${itemToDelete?.title}) será removida permanentemente do banco de dados.`"
        confirm-text="Sim, excluir"
        cancel-text="Cancelar"
        variant="danger"
        :loading="isDeleting"
        @confirm="executeDelete"
      />
    </div>
  </AppLayout>
</template>

<style scoped>
.requests-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.page-title {
  font-size: var(--font-size-title-1);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Card de Filtros */
.filters-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.filter-search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.search-box-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.filter-search-input {
  width: 100%;
  height: 42px;
  padding: 0 var(--space-3) 0 38px;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}

.filter-search-input:focus {
  background-color: var(--color-surface);
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.filter-selects-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-select-item {
  width: 170px;
}

/* Tabela Estilos Customizados */
.protocol-code {
  font-family: monospace;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-secondary);
}

.request-row-title {
  font-weight: 600;
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.solicitante-text,
.category-text,
.date-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Menu de Ações na Tabela */
.action-menu-wrapper {
  position: relative;
  display: inline-block;
}

.action-dots-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background-color: transparent;
  transition: all var(--transition-fast);
}

.action-dots-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.action-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 190px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.action-dropdown-item {
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

.action-dropdown-item:hover {
  background-color: var(--color-surface-hover);
}

.action-dropdown-item.item-danger {
  color: var(--color-danger);
}
.action-dropdown-item.item-danger:hover {
  background-color: var(--color-danger-bg);
}

.dropdown-quick-status {
  padding: var(--space-2) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-status-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.status-subitem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 4px 6px;
  border-radius: 4px;
  transition: background-color var(--transition-fast);
  text-align: left;
}

.status-subitem:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.status-subitem:disabled {
  opacity: 0.4;
  cursor: default;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot-aberto { background-color: #3B82F6; }
.dot-andamento { background-color: #F59E0B; }
.dot-resolvido { background-color: #14B8A6; }

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 0;
}

/* Modal de Formulário */
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
  max-width: 540px;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
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
  margin-top: 4px;
}

.modal-close-btn {
  color: var(--color-text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: var(--color-danger);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.form-textarea:focus {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.form-help-text {
  font-size: 11px;
  color: var(--color-text-muted);
}

.form-error-box {
  background-color: var(--color-danger-bg);
  border: 1px solid #FECACA;
  color: var(--color-danger-text);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-selects-row {
    flex-direction: column;
    width: 100%;
  }
  .filter-select-item {
    width: 100%;
  }
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
