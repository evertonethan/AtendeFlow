<script setup lang="ts">
import { Calendar, Tag, Trash2 } from 'lucide-vue-next'
import type { Priority, RequestItem, Status } from '../types'
import StatusBadge from './StatusBadge.vue'

defineProps<{ item: RequestItem }>()
defineEmits<{
  statusChange: [id: string, status: Status]
  priorityChange: [id: string, priority: Priority]
  remove: [id: string]
}>()

const statuses: Status[] = ['Aberta', 'Em andamento', 'Concluída']
const priorities: Priority[] = ['Baixa', 'Média', 'Alta']
</script>

<template>
  <article class="request-card">
    <div class="request-top">
      <span class="request-id">#{{ item.id.slice(0, 8) }}</span>
      <StatusBadge :priority="item.priority" />
    </div>

    <h3 class="card-title">{{ item.title }}</h3>
    <p class="description">{{ item.description }}</p>

    <div class="meta">
      <span class="meta-item"><Tag :size="12" /> {{ item.category }}</span>
      <span class="meta-item"><Calendar :size="12" /> {{ new Date(item.createdAt).toLocaleDateString('pt-BR') }}</span>
    </div>

    <div class="controls">
      <label class="control-label">
        Status
        <select
          :value="item.status"
          :aria-label="`Status de ${item.title}`"
          class="control-select"
          @change="$emit('statusChange', item.id, ($event.target as HTMLSelectElement).value as Status)"
        >
          <option v-for="s in statuses" :key="s">{{ s }}</option>
        </select>
      </label>

      <label class="control-label">
        Prioridade
        <select
          :value="item.priority"
          :aria-label="`Prioridade de ${item.title}`"
          class="control-select"
          @change="$emit('priorityChange', item.id, ($event.target as HTMLSelectElement).value as Priority)"
        >
          <option v-for="v in priorities" :key="v">{{ v }}</option>
        </select>
      </label>

      <button
        class="delete"
        type="button"
        :aria-label="`Excluir ${item.title}`"
        @click="$emit('remove', item.id)"
      >
        <Trash2 :size="14" />
        <span>Excluir</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.request-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.request-card:hover {
  box-shadow: var(--shadow-md);
}

.request-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.request-id {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  line-height: 1.4;
}

.description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.controls {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.control-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex: 1;
}

.control-select {
  height: 32px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  outline: none;
  cursor: pointer;
}

.control-select:focus {
  border-color: var(--color-secondary);
}

.delete {
  height: 32px;
  padding: 0 var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  background-color: transparent;
  font-size: var(--font-size-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delete:hover {
  background-color: var(--color-danger-bg);
}
</style>
