<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
  }
)

defineEmits<{ (e: 'click', event: MouseEvent): void }>()

const classes = computed(() => [
  'base-button',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  { 'btn-block': props.block, 'btn-loading': props.loading },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <Loader2 v-if="loading" class="btn-spinner" :size="size === 'sm' ? 14 : size === 'lg' ? 20 : 16" />
    <span class="btn-content" :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
  position: relative;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.base-button:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

/* Tamanhos */
.btn-sm {
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.btn-md {
  padding: 10px 16px;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
}

.btn-lg {
  padding: 12px 24px;
  font-size: var(--font-size-body);
  border-radius: var(--radius-lg);
}

.btn-block {
  width: 100%;
}

/* Variantes */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverted);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverted);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}

.btn-outline {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
.btn-outline:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverted);
}
.btn-danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.base-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  animation: spin 1s linear infinite;
  position: absolute;
}

.btn-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.opacity-0 {
  visibility: hidden;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
