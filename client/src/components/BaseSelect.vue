<script setup lang="ts">
import { computed, useId } from 'vue'
import { ChevronDown, AlertCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    label?: string
    options?: Array<{ label: string; value: string | number }>
    error?: string
    required?: boolean
    disabled?: boolean
    id?: string
  }>(),
  {
    label: '',
    options: () => [],
    error: '',
    required: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const generatedId = useId()
const selectId = computed(() => props.id || `select-${generatedId}`)

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="base-select-wrapper" :class="{ 'has-error': !!error }">
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark" aria-hidden="true">*</span>
    </label>

    <div class="select-control">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error"
        class="select-element"
        @change="onChange"
      >
        <slot>
          <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">
            {{ opt.label }}
          </option>
        </slot>
      </select>
      <ChevronDown class="select-chevron" :size="16" />
    </div>

    <p v-if="error" class="error-text" role="alert">
      <AlertCircle :size="12" /> {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.select-label {
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

.select-control {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.select-element {
  width: 100%;
  height: 42px;
  padding: 0 36px 0 var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  appearance: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
}

.select-element:focus {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.select-chevron {
  position: absolute;
  right: var(--space-3);
  pointer-events: none;
  color: var(--color-text-secondary);
}

.has-error .select-element {
  border-color: var(--color-danger);
  background-color: #FFF5F5;
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--color-danger-text);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
