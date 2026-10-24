<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Nenhum registro encontrado',
    description: 'Não encontramos nenhuma solicitação com os critérios aplicados.',
  }
)
</script>

<template>
  <div class="empty-state">
    <div class="icon-circle">
      <slot name="icon">
        <Inbox :size="32" class="empty-icon" />
      </slot>
    </div>

    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>

    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
}

.empty-title {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  max-width: 360px;
  margin-bottom: var(--space-4);
}

.empty-action {
  display: flex;
  gap: var(--space-2);
}
</style>
