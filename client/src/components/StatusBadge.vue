<script setup lang="ts">
import { computed } from 'vue'
import type { Priority, Status } from '../types'

const props = withDefaults(
  defineProps<{
    status?: Status | 'Aberto' | 'Resolvido' | 'Cancelado' | string
    priority?: Priority | string
    variant?: 'aberto' | 'andamento' | 'resolvido' | 'cancelado' | 'baixa' | 'media' | 'alta' | 'neutral'
  }>(),
  {}
)

const resolvedVariant = computed(() => {
  if (props.variant) return props.variant

  const s = (props.status || '').toLowerCase().trim()
  if (s === 'aberta' || s === 'aberto') return 'aberto'
  if (s === 'em andamento' || s === 'andamento') return 'andamento'
  if (s === 'concluída' || s === 'concluida' || s === 'resolvido' || s === 'resolvida') return 'resolvido'
  if (s === 'cancelado' || s === 'cancelada') return 'cancelado'

  const p = (props.priority || '').toLowerCase().trim()
  if (p === 'baixa') return 'baixa'
  if (p === 'média' || p === 'media') return 'media'
  if (p === 'alta') return 'alta'

  return 'neutral'
})

const displayText = computed(() => {
  if (props.status) return props.status
  if (props.priority) return props.priority
  return ''
})
</script>

<template>
  <span :class="['status-badge', `badge-${resolvedVariant}`]">
    <span class="badge-dot" aria-hidden="true" />
    <slot>{{ displayText }}</slot>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
  line-height: 1.2;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Aberto / Aberta */
.badge-aberto {
  background-color: var(--badge-aberto-bg);
  color: var(--badge-aberto-text);
}

/* Em andamento */
.badge-andamento {
  background-color: var(--badge-andamento-bg);
  color: var(--badge-andamento-text);
}

/* Resolvido / Concluída */
.badge-resolvido,
.badge-baixa {
  background-color: var(--badge-resolvido-bg);
  color: var(--badge-resolvido-text);
}

/* Média prioridade */
.badge-media {
  background-color: var(--badge-andamento-bg);
  color: var(--badge-andamento-text);
}

/* Cancelado / Alta prioridade */
.badge-cancelado,
.badge-alta {
  background-color: var(--badge-cancelado-bg);
  color: var(--badge-cancelado-text);
}

/* Neutro */
.badge-neutral {
  background-color: #F1F5F9;
  color: var(--color-text-secondary);
}
</style>
