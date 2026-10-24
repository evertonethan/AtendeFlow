<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'Carregando...',
    subtitle: 'Aguarde enquanto processamos os dados.',
  }
)
</script>

<template>
  <div class="loading-state" role="status" aria-live="polite">
    <div class="spinner-wrapper">
      <Loader2 :size="32" class="spinner-icon" />
    </div>
    <div class="text-content">
      <h4 class="loading-title">{{ title }}</h4>
      <p class="loading-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loading-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.loading-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
