<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    badgeText?: string
    badgeType?: 'success' | 'danger' | 'warning' | 'info'
    indicatorColor?: 'blue' | 'amber' | 'green' | 'red'
  }>(),
  {
    badgeText: '',
    badgeType: 'success',
    indicatorColor: 'blue',
  }
)

const indicatorColorVar = computed(() => {
  switch (props.indicatorColor) {
    case 'green':
      return 'var(--color-success)'
    case 'amber':
      return 'var(--color-warning)'
    case 'red':
      return 'var(--color-danger)'
    case 'blue':
    default:
      return 'var(--color-info)'
  }
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-title">{{ title }}</span>
    </div>

    <div class="stat-body">
      <span class="stat-value">{{ value }}</span>
    </div>

    <div class="stat-footer">
      <div class="stat-indicator" :style="{ backgroundColor: indicatorColorVar }" aria-hidden="true" />
      <span v-if="badgeText" :class="['stat-badge', `badge-${badgeType}`]">
        {{ badgeText }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-body {
  display: flex;
  align-items: baseline;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.stat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-1);
}

.stat-indicator {
  width: 24px;
  height: 4px;
  border-radius: var(--radius-full);
}

.stat-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  line-height: 1.2;
}

.badge-success {
  background-color: #DCFCE7;
  color: #16A34A;
}

.badge-danger {
  background-color: #FEE2E2;
  color: #DC2626;
}

.badge-warning {
  background-color: #FEF3C7;
  color: #D97706;
}

.badge-info {
  background-color: #EFF6FF;
  color: #2563EB;
}
</style>
