<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  X,
  Sliders,
  Bell,
  Database,
  Check,
  Trash2,
} from 'lucide-vue-next'
import { useToastStore } from '../stores/toast'
import { useUiStore } from '../stores/ui'
import BaseButton from './BaseButton.vue'
import BaseSelect from './BaseSelect.vue'

const toast = useToastStore()
const ui = useUiStore()

const defaultCategory = ref('Suporte técnico')
const defaultPriority = ref('Média')
const notifyEmail = ref(true)
const notifyBrowser = ref(true)
const notifyStatusChange = ref(true)
const isSaving = ref(false)

const SETTINGS_KEY = 'atendeflow.settings'

onMounted(() => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.defaultCategory) defaultCategory.value = parsed.defaultCategory
      if (parsed.defaultPriority) defaultPriority.value = parsed.defaultPriority
      if (parsed.notifyEmail !== undefined) notifyEmail.value = parsed.notifyEmail
      if (parsed.notifyBrowser !== undefined) notifyBrowser.value = parsed.notifyBrowser
      if (parsed.notifyStatusChange !== undefined) notifyStatusChange.value = parsed.notifyStatusChange
    }
  } catch {
    // defaults
  }
})

function saveSettings() {
  isSaving.value = true
  try {
    const config = {
      defaultCategory: defaultCategory.value,
      defaultPriority: defaultPriority.value,
      notifyEmail: notifyEmail.value,
      notifyBrowser: notifyBrowser.value,
      notifyStatusChange: notifyStatusChange.value,
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(config))
    toast.success('Configurações salvas', 'Suas preferências foram armazenadas com sucesso.')
    ui.closeSettings()
  } catch {
    toast.error('Erro', 'Não foi possível salvar as configurações.')
  } finally {
    isSaving.value = false
  }
}

function clearAppCache() {
  localStorage.removeItem(SETTINGS_KEY)
  toast.success('Cache liberado', 'Os dados temporários de preferências foram reiniciados.')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isSettingsOpen" class="modal-backdrop" @click.self="ui.closeSettings">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div class="modal-header">
            <div>
              <h3 id="settings-title" class="modal-title">Configurações</h3>
              <p class="modal-subtitle">Defina o comportamento do fluxo de atendimento e preferências do sistema.</p>
            </div>
            <button type="button" class="close-btn" aria-label="Fechar" @click="ui.closeSettings">
              <X :size="20" />
            </button>
          </div>

          <form class="settings-content" @submit.prevent="saveSettings">
            <!-- Seção 1: Preferências Gerais -->
            <div class="section-block">
              <h4 class="section-heading"><Sliders :size="16" /> Padrões de Solicitação</h4>

              <div class="grid-2">
                <BaseSelect
                  v-model="defaultCategory"
                  label="Categoria padrão inicial"
                >
                  <option value="Suporte técnico">Suporte técnico</option>
                  <option value="Acesso e conta">Acesso e conta</option>
                  <option value="Cadastro">Cadastro</option>
                  <option value="Relatórios">Relatórios</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Outro">Outro</option>
                </BaseSelect>

                <BaseSelect
                  v-model="defaultPriority"
                  label="Prioridade padrão"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </BaseSelect>
              </div>
            </div>

            <!-- Seção 2: Notificações -->
            <div class="section-block">
              <h4 class="section-heading"><Bell :size="16" /> Alertas e Notificações</h4>

              <div class="toggle-list">
                <label class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-title">Alertas por E-mail</span>
                    <span class="toggle-desc">Receba notificações de novas demandas registradas na fila.</span>
                  </div>
                  <input v-model="notifyEmail" type="checkbox" class="switch-checkbox" />
                </label>

                <label class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-title">Notificações no Navegador</span>
                    <span class="toggle-desc">Exibir toasts interativos ao concluir operações no sistema.</span>
                  </div>
                  <input v-model="notifyBrowser" type="checkbox" class="switch-checkbox" />
                </label>

                <label class="toggle-item">
                  <div class="toggle-info">
                    <span class="toggle-title">Atualizações de Status</span>
                    <span class="toggle-desc">Notificar quando uma solicitação for marcada como Concluída.</span>
                  </div>
                  <input v-model="notifyStatusChange" type="checkbox" class="switch-checkbox" />
                </label>
              </div>
            </div>

            <!-- Seção 3: Informações Técnicas e Banco de Dados -->
            <div class="section-block info-block">
              <h4 class="section-heading"><Database :size="16" /> Ambiente & Banco de Dados</h4>

              <div class="info-table">
                <div class="info-row">
                  <span class="info-key">API REST:</span>
                  <span class="info-val status-online">Conectado (http://localhost:3000)</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Engine do Banco:</span>
                  <span class="info-val">SQLite 3 (better-sqlite3 v13, WAL Mode)</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Versão do AtendeFlow:</span>
                  <span class="info-val">v1.0.0 (Design System Oficial)</span>
                </div>
              </div>

              <div class="cache-action-row">
                <button type="button" class="cache-btn" @click="clearAppCache">
                  <Trash2 :size="13" />
                  <span>Redefinir preferências salvas</span>
                </button>
              </div>
            </div>

            <!-- Rodapé com Ações -->
            <div class="modal-footer">
              <BaseButton type="button" variant="outline" size="md" :disabled="isSaving" @click="ui.closeSettings">
                Cancelar
              </BaseButton>

              <BaseButton type="submit" variant="primary" size="md" :loading="isSaving">
                <Check :size="16" />
                <span>Salvar preferências</span>
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
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
  max-width: 620px;
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.section-heading {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  cursor: pointer;
  padding: 6px 0;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.toggle-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.switch-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-secondary);
  cursor: pointer;
}

.info-block {
  background-color: var(--color-bg);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}

.info-key {
  color: var(--color-text-secondary);
}

.info-val {
  color: var(--color-text-primary);
  font-weight: 500;
  font-family: monospace;
}

.status-online {
  color: var(--color-success);
  font-weight: 600;
}

.cache-action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.cache-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.cache-btn:hover {
  background-color: var(--color-surface);
  color: var(--color-danger);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 600px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
