<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export interface Column<T = any> {
  key: keyof T | string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: Column<T>[]
    items: T[]
    pageSize?: number
    loading?: boolean
    emptyMessage?: string
  }>(),
  {
    pageSize: 6,
    loading: false,
    emptyMessage: 'Nenhum registro encontrado.',
  }
)

const currentPage = ref(1)

const totalItems = computed(() => props.items.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / props.pageSize)))

watch(() => props.items, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.items.slice(start, start + props.pageSize)
})

const startRange = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1))
const endRange = computed(() => Math.min(currentPage.value * props.pageSize, totalItems.value))

function goToPage(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
  }
}
</script>

<template>
  <div class="data-table-container">
    <div class="table-scroll-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 3" :key="i" class="skeleton-row">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton-bar" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="paginatedItems.length">
          <tr v-for="(item, index) in paginatedItems" :key="item.id || index">
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="col.key" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="empty-cell">
              <slot name="empty">
                {{ emptyMessage }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Rodapé de paginação -->
    <div v-if="totalItems > 0" class="table-footer">
      <span class="range-text">
        Mostrando {{ startRange }} a {{ endRange }} de {{ totalItems }} resultados
      </span>

      <div v-if="totalPages > 1" class="pagination-controls">
        <button
          type="button"
          class="page-btn nav-btn"
          :disabled="currentPage === 1"
          aria-label="Página anterior"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="page-btn nav-btn"
          :disabled="currentPage === totalPages"
          aria-label="Próxima página"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.table-scroll-wrapper {
  overflow-x: auto;
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  text-align: left;
}

.data-table thead {
  background-color: #F8FAFC;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: #F8FAFC;
}

.empty-cell {
  text-align: center;
  padding: var(--space-8) !important;
  color: var(--color-text-secondary);
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.range-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.page-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

.page-btn.active {
  background-color: var(--color-primary);
  color: var(--color-text-inverted);
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skeleton-row td {
  padding: 16px var(--space-4);
}

.skeleton-bar {
  height: 14px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
