<script setup lang="ts">
import { computed, useId } from 'vue'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    label?: string
    type?: string
    placeholder?: string
    error?: string
    success?: boolean
    successMessage?: string
    required?: boolean
    disabled?: boolean
    id?: string
    autocomplete?: string
    minlength?: number
    maxlength?: number
  }>(),
  {
    type: 'text',
    label: '',
    placeholder: '',
    error: '',
    success: false,
    successMessage: '',
    required: false,
    disabled: false,
    autocomplete: 'off',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const generatedId = useId()
const inputId = computed(() => props.id || `input-${generatedId}`)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="base-input-wrapper" :class="{ 'has-error': !!error, 'has-success': success }">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark" aria-hidden="true">*</span>
    </label>

    <div class="input-control">
      <span v-if="$slots.icon" class="input-icon-left">
        <slot name="icon" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        class="input-element"
        :class="{ 'with-left-icon': $slots.icon, 'with-right-slot': $slots.right || !!error || success }"
        @input="onInput"
      />

      <div class="input-right-items">
        <slot name="right" />
        <AlertCircle v-if="error" class="feedback-icon error-icon" :size="16" />
        <CheckCircle2 v-else-if="success" class="feedback-icon success-icon" :size="16" />
      </div>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="error-text" role="alert">
      {{ error }}
    </p>
    <p v-else-if="success && successMessage" class="success-text">
      {{ successMessage }}
    </p>
  </div>
</template>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.input-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.required-mark {
  color: var(--color-danger);
}

.input-control {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-element {
  width: 100%;
  height: 42px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  outline: none;
}

.input-element::placeholder {
  color: var(--color-text-muted);
}

.input-element:focus {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.input-icon-left {
  position: absolute;
  left: var(--space-3);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--color-text-muted);
}

.input-element.with-left-icon {
  padding-left: 38px;
}

.input-right-items {
  position: absolute;
  right: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.input-element.with-right-slot {
  padding-right: 42px;
}

/* Erro */
.has-error .input-element {
  border-color: var(--color-danger);
  background-color: #FFF5F5;
}
.has-error .input-element:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
.error-icon {
  color: var(--color-danger);
}
.error-text {
  font-size: var(--font-size-xs);
  color: var(--color-danger-text);
  margin-top: 2px;
}

/* Sucesso */
.has-success .input-element {
  border-color: var(--color-success);
}
.success-icon {
  color: var(--color-success);
}
.success-text {
  font-size: var(--font-size-xs);
  color: var(--color-success-text);
  margin-top: 2px;
}

.input-element:disabled {
  background-color: var(--color-surface-hover);
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
