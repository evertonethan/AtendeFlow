<script setup lang="ts">
import { computed } from 'vue'
import {
  X,
  Download,
  BarChart2,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-vue-next'
import { useRequestsStore } from '../stores/requests'
import { useToastStore } from '../stores/toast'
import { useUiStore } from '../stores/ui'
import BaseButton from './BaseButton.vue'

const store = useRequestsStore()
const toast = useToastStore()
const ui = useUiStore()

const total = computed(() => store.total)
const resolved = computed(() => store.completedCount)
const inProgress = computed(() => store.inProgressCount)
const open = computed(() => store.openCount)

const resolutionRate = computed(() => {
  if (total.value === 0) return 0
  return Math.round((resolved.value / total.value) * 100)
})

// Distribuição por categoria
const categoryStats = computed(() => {
  const map: Record<string, number> = {}
  store.items.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + 1
  })

  return Object.entries(map).map(([category, count]) => ({
    category,
    count,
    percent: total.value > 0 ? Math.round((count / total.value) * 100) : 0,
  })).sort((a, b) => b.count - a.count)
})

// Distribuição por prioridade
const priorityStats = computed(() => {
  const map: Record<string, number> = { Alta: 0, Média: 0, Baixa: 0 }
  store.items.forEach((item) => {
    if (map[item.priority] !== undefined) map[item.priority]++
  })

  return [
    { priority: 'Alta', count: map.Alta, color: '#EF4444', percent: total.value ? Math.round((map.Alta / total.value) * 100) : 0 },
    { priority: 'Média', count: map.Média, color: '#F59E0B', percent: total.value ? Math.round((map.Média / total.value) * 100) : 0 },
    { priority: 'Baixa', count: map.Baixa, color: '#14B8A6', percent: total.value ? Math.round((map.Baixa / total.value) * 100) : 0 },
  ]
})

function exportCSV() {
  if (!store.items.length) {
    toast.warning('Atenção', 'Não há dados para exportar.')
    return
  }

  const headers = ['ID', 'Protocolo', 'Título', 'Categoria', 'Status', 'Prioridade', 'Data de Abertura']
  const rows = store.items.map((item) => [
    item.id,
    `SIL-2024-${item.id.slice(0, 4).toUpperCase()}`,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.status,
    item.priority,
    item.createdAt,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `relatorio-atendeflow-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('Relatório Exportado', 'O arquivo CSV foi baixado com sucesso.')
}

function exportJSON() {
  if (!store.items.length) {
    toast.warning('Atenção', 'Não há dados para exportar.')
    return
  }

  const blob = new Blob([JSON.stringify(store.items, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `backup-atendeflow-${new Date().toISOString().slice(0, 10)}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('Backup Exportado', 'O arquivo JSON foi baixado com sucesso.')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isReportsOpen" class="modal-backdrop" @click.self="ui.closeReports">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="reports-title">
          <div class="modal-header">
            <div>
              <h3 id="reports-title" class="modal-title">Relatórios & Indicadores</h3>
              <p class="modal-subtitle">Estatísticas analíticas e desempenho operacional do atendimento.</p>
            </div>
            <button type="button" class="close-btn" aria-label="Fechar" @click="ui.closeReports">
              <X :size="20" />
            </button>
          </div>

          <!-- Cards de KPIs -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Taxa de Resolução</span>
              <div class="kpi-value-row">
                <span class="kpi-value">{{ resolutionRate }}%</span>
                <span class="kpi-icon-pill green"><TrendingUp :size="14" /></span>
              </div>
              <span class="kpi-subtext">{{ resolved }} de {{ total }} resolvidas</span>
            </div>

            <div class="kpi-card">
              <span class="kpi-label">Tempo Médio</span>
              <div class="kpi-value-row">
                <span class="kpi-value">2h 30m</span>
                <span class="kpi-icon-pill blue"><Clock :size="14" /></span>
              </div>
              <span class="kpi-subtext">Meta de SLA atingida</span>
            </div>

            <div class="kpi-card">
              <span class="kpi-label">Em Tratamento</span>
              <div class="kpi-value-row">
                <span class="kpi-value">{{ inProgress }}</span>
                <span class="kpi-icon-pill amber"><Layers :size="14" /></span>
              </div>
              <span class="kpi-subtext">{{ open }} aguardando triagem</span>
            </div>
          </div>

          <!-- Seções Analíticas -->
          <div class="analytics-grid">
            <!-- Categorias -->
            <div class="analytics-box">
              <h4 class="box-title"><BarChart2 :size="16" /> Demandas por Categoria</h4>
              <div v-if="categoryStats.length" class="category-bars">
                <div v-for="cat in categoryStats" :key="cat.category" class="cat-bar-item">
                  <div class="cat-header">
                    <span class="cat-name">{{ cat.category }}</span>
                    <span class="cat-percent">{{ cat.count }} ({{ cat.percent }}%)</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${cat.percent}%` }" />
                  </div>
                </div>
              </div>
              <p v-else class="empty-hint">Nenhuma solicitação cadastrada.</p>
            </div>

            <!-- Prioridades -->
            <div class="analytics-box">
              <h4 class="box-title"><CheckCircle :size="16" /> Volume por Prioridade</h4>
              <div class="priority-meter-list">
                <div v-for="p in priorityStats" :key="p.priority" class="priority-row">
                  <div class="p-header">
                    <span class="p-name">{{ p.priority }} prioridade</span>
                    <span class="p-count">{{ p.count }} chamados</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${p.percent}%`, backgroundColor: p.color }" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rodapé com Ações de Exportação -->
          <div class="modal-footer">
            <div class="export-buttons">
              <BaseButton variant="outline" size="sm" @click="exportCSV">
                <FileSpreadsheet :size="15" />
                <span>Exportar CSV</span>
              </BaseButton>

              <BaseButton variant="outline" size="sm" @click="exportJSON">
                <Download :size="15" />
                <span>Backup JSON</span>
              </BaseButton>
            </div>

            <BaseButton variant="primary" size="md" @click="ui.closeReports">
              Concluir
            </BaseButton>
          </div>
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.kpi-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.kpi-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.kpi-icon-pill {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon-pill.green { background-color: #DCFCE7; color: #16A34A; }
.kpi-icon-pill.blue { background-color: #EFF6FF; color: #2563EB; }
.kpi-icon-pill.amber { background-color: #FEF3C7; color: #D97706; }

.kpi-subtext {
  font-size: 11px;
  color: var(--color-text-muted);
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-2);
}

.analytics-box {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.box-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-bars,
.priority-meter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cat-header,
.p-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 4px;
}

.cat-name, .p-name {
  color: var(--color-text-primary);
  font-weight: 500;
}

.cat-percent, .p-count {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.progress-track {
  width: 100%;
  height: 6px;
  background-color: #F1F5F9;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-secondary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.empty-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-4);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
  margin-top: var(--space-2);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.export-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 600px) {
  .kpi-grid, .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
