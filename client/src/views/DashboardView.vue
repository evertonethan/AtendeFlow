<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  FileText,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-vue-next'
import { useRequestsStore } from '../stores/requests'
import AppLayout from '../components/AppLayout.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import BaseButton from '../components/BaseButton.vue'
import LoadingState from '../components/LoadingState.vue'
import EmptyState from '../components/EmptyState.vue'

const store = useRequestsStore()
const selectedPeriod = ref('30')

onMounted(() => {
  store.load()
})

// Cálculos dinâmicos com base nos dados reais da API
const totalCount = computed(() => store.total)
const openCount = computed(() => store.openCount)
const inProgressCount = computed(() => store.inProgressCount)
const resolvedCount = computed(() => store.completedCount)
// Casos de cancelado se houver ou 0
const cancelledCount = computed(() => 0)

// Donut Chart SVG calculations
const chartData = computed(() => {
  return [
    { label: 'Aberto', value: openCount.value, color: '#3B82F6', dotClass: 'dot-blue' },
    { label: 'Em andamento', value: inProgressCount.value, color: '#F59E0B', dotClass: 'dot-amber' },
    { label: 'Resolvido', value: resolvedCount.value, color: '#14B8A6', dotClass: 'dot-green' },
    { label: 'Cancelado', value: cancelledCount.value, color: '#EF4444', dotClass: 'dot-red' },
  ]
})

// Calcula arcos do donut SVG
const donutSegments = computed(() => {
  const total = totalCount.value || 1
  const radius = 64
  const circumference = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return chartData.value.map((item) => {
    const percent = totalCount.value > 0 ? item.value / total : 0
    const strokeDasharray = `${percent * circumference} ${circumference}`
    const strokeDashoffset = -(accumulatedPercent * circumference)
    accumulatedPercent += percent

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    }
  })
})

// Solicitações recentes (últimas 5)
const recentRequests = computed(() => store.items.slice(0, 5))

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Agora mesmo'
    if (diffHours < 24) return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    if (diffHours < 48) return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateString
  }
}

function formatProtocol(id: string) {
  return `SIL-2024-${id.slice(0, 4).toUpperCase()}`
}
</script>

<template>
  <AppLayout>
    <div class="dashboard-page">
      <!-- Cabeçalho da página -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral do atendimento e principais indicadores</p>
        </div>

        <div class="header-actions">
          <select v-model="selectedPeriod" class="period-select" aria-label="Filtrar por período">
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>

          <RouterLink to="/solicitacoes">
            <BaseButton variant="secondary" size="md">
              <Plus :size="16" />
              <span>Nova solicitação</span>
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Alerta de Erro -->
      <div v-if="store.error" class="error-banner" role="alert">
        <span>{{ store.error }}</span>
        <BaseButton variant="outline" size="sm" @click="store.load()">
          <RefreshCw :size="14" />
          <span>Tentar novamente</span>
        </BaseButton>
      </div>

      <!-- Grade dos 4 StatCards -->
      <section class="stat-grid" aria-label="Indicadores principais">
        <StatCard
          title="Total de solicitações"
          :value="store.total"
          indicator-color="blue"
          badge-text="+12%"
          badge-type="success"
        />

        <StatCard
          title="Em andamento"
          :value="store.inProgressCount"
          indicator-color="amber"
          badge-text="+5%"
          badge-type="success"
        />

        <StatCard
          title="Resolvidas"
          :value="store.completedCount"
          indicator-color="green"
          badge-text="+18%"
          badge-type="success"
        />

        <StatCard
          title="Tempo médio"
          value="2h 30m"
          indicator-color="red"
          badge-text="-20%"
          badge-type="success"
        />
      </section>

      <!-- Grade inferior: Gráfico Donut e Solicitações Recentes -->
      <div class="dashboard-panels-grid">
        <!-- Painel 1: Solicitações por status (Donut Chart) -->
        <section class="panel-card status-panel">
          <div class="panel-header">
            <h3 class="panel-title">Solicitações por status</h3>
          </div>

          <div class="status-content">
            <!-- Gráfico Donut SVG -->
            <div class="donut-wrapper">
              <svg class="donut-chart" viewBox="0 0 160 160" width="160" height="160">
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="transparent"
                  stroke="#E2E8F0"
                  stroke-width="18"
                />

                <circle
                  v-for="seg in donutSegments"
                  :key="seg.label"
                  cx="80"
                  cy="80"
                  r="64"
                  fill="transparent"
                  :stroke="seg.color"
                  stroke-width="18"
                  :stroke-dasharray="seg.strokeDasharray"
                  :stroke-dashoffset="seg.strokeDashoffset"
                  stroke-linecap="round"
                  transform="rotate(-90 80 80)"
                  class="donut-segment"
                />
              </svg>

              <!-- Centro do Donut -->
              <div class="donut-center">
                <span class="donut-total">{{ totalCount }}</span>
                <span class="donut-label">Total</span>
              </div>
            </div>

            <!-- Legenda com contagens -->
            <div class="status-legend">
              <div
                v-for="item in chartData"
                :key="item.label"
                class="legend-item"
              >
                <div class="legend-left">
                  <span :class="['legend-dot', item.dotClass]" aria-hidden="true" />
                  <span class="legend-name">{{ item.label }}</span>
                </div>
                <span class="legend-count">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Painel 2: Solicitações recentes -->
        <section class="panel-card recent-panel">
          <div class="panel-header">
            <h3 class="panel-title">Solicitações recentes</h3>
            <RouterLink to="/solicitacoes" class="view-all-link">
              <span>Ver todas</span>
              <ArrowRight :size="14" />
            </RouterLink>
          </div>

          <div v-if="store.loading" class="recent-loading">
            <LoadingState subtitle="Carregando solicitações recentes..." />
          </div>

          <div v-else-if="recentRequests.length" class="recent-list">
            <RouterLink
              v-for="req in recentRequests"
              :key="req.id"
              to="/solicitacoes"
              class="recent-item"
            >
              <div class="recent-item-icon">
                <FileText :size="18" />
              </div>

              <div class="recent-item-info">
                <h4 class="recent-item-title">{{ req.title }}</h4>
                <div class="recent-item-meta">
                  <span>{{ formatProtocol(req.id) }}</span>
                  <span class="meta-separator">•</span>
                  <span class="meta-time">
                    <Clock :size="12" />
                    {{ formatRelativeTime(req.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="recent-item-badge">
                <StatusBadge :status="req.status" />
              </div>
            </RouterLink>
          </div>

          <EmptyState
            v-else
            title="Nenhuma solicitação recente"
            description="Crie sua primeira solicitação para visualizar métricas e histórico."
          >
            <template #action>
              <RouterLink to="/solicitacoes">
                <BaseButton variant="primary" size="sm">
                  <Plus :size="14" />
                  <span>Criar solicitação</span>
                </BaseButton>
              </RouterLink>
            </template>
          </EmptyState>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard-page {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.period-select {
  height: 40px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.period-select:focus {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-danger-bg);
  border: 1px solid #FECACA;
  border-radius: var(--radius-md);
  color: var(--color-danger-text);
  font-size: var(--font-size-xs);
}

/* Grade de Indicadores */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

/* Painéis Inferiores */
.dashboard-panels-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: var(--space-6);
}

.panel-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.panel-title {
  font-size: var(--font-size-title-3);
  font-weight: 600;
  color: var(--color-text-primary);
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-info);
  transition: color var(--transition-fast);
}

.view-all-link:hover {
  color: var(--color-info-text);
  text-decoration: underline;
}

/* Donut e Status */
.status-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  flex: 1;
}

.donut-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart {
  transform: rotate(0deg);
}

.donut-segment {
  transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
}

.donut-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.status-legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 150px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
}

.legend-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-blue { background-color: #3B82F6; }
.dot-amber { background-color: #F59E0B; }
.dot-green { background-color: #14B8A6; }
.dot-red { background-color: #EF4444; }

.legend-name {
  color: var(--color-text-secondary);
}

.legend-count {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Lista Recente */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.recent-item:hover {
  background-color: var(--color-bg);
  border-color: var(--color-border);
}

.recent-item-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background-color: #EFF6FF;
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recent-item-info {
  flex: 1;
  min-width: 0;
}

.recent-item-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.recent-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.meta-separator {
  color: var(--color-border);
}

.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.recent-item-badge {
  flex-shrink: 0;
}

/* Responsividade */
@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-panels-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .status-content {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
