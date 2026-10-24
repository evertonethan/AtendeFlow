<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container" aria-live="assertive">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['toast-card', `toast-${toast.type}`]"
        role="alert"
      >
        <div class="toast-icon">
          <CheckCircle2 v-if="toast.type === 'success'" :size="20" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" />
          <Info v-else :size="20" />
        </div>

        <div class="toast-content">
          <h5 class="toast-title">{{ toast.title }}</h5>
          <p v-if="toast.message" class="toast-message">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Fechar notificação"
          @click="toastStore.removeToast(toast.id)"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
  max-width: 380px;
  width: calc(100vw - 32px);
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: all 0.2s ease;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.toast-message {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}

.toast-close {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.toast-close:hover {
  color: var(--color-text-primary);
  background-color: var(--color-surface-hover);
}

/* Tipos */
.toast-success .toast-icon {
  color: var(--color-success);
}
.toast-error .toast-icon {
  color: var(--color-danger);
}
.toast-warning .toast-icon {
  color: var(--color-warning);
}
.toast-info .toast-icon {
  color: var(--color-info);
}

/* Animações */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease-out;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
