<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
    loading?: boolean
  }>(),
  {
    title: 'Confirmar ação',
    message: 'Tem certeza que deseja prosseguir com esta ação?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function close() {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

function confirm() {
  emit('confirm')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="dialog-backdrop" @click.self="close">
        <div
          class="dialog-card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`${title}-dialog-title`"
        >
          <button
            type="button"
            class="dialog-close-btn"
            aria-label="Fechar diálogo"
            :disabled="loading"
            @click="close"
          >
            <X :size="18" />
          </button>

          <div class="dialog-header">
            <div
              class="dialog-icon-badge"
              :class="{ 'badge-danger': variant === 'danger', 'badge-primary': variant === 'primary' }"
            >
              <AlertTriangle :size="20" />
            </div>
            <div>
              <h3 :id="`${title}-dialog-title`" class="dialog-title">{{ title }}</h3>
              <p class="dialog-message">{{ message }}</p>
            </div>
          </div>

          <div class="dialog-footer">
            <BaseButton
              variant="outline"
              size="md"
              :disabled="loading"
              @click="close"
            >
              {{ cancelText }}
            </BaseButton>

            <BaseButton
              :variant="variant === 'danger' ? 'danger' : 'primary'"
              size="md"
              :loading="loading"
              @click="confirm"
            >
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
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

.dialog-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 440px;
  padding: var(--space-6);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  animation: scaleUp 0.15s ease-out;
}

.dialog-close-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.dialog-close-btn:hover:not(:disabled) {
  color: var(--color-text-primary);
  background-color: var(--color-surface-hover);
}

.dialog-header {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.dialog-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-icon-badge.badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.dialog-icon-badge.badge-primary {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
}

.dialog-title {
  font-size: var(--font-size-title-3);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.dialog-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
