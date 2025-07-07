<template>
  <div class="stats-card" :class="[variant, { clickable: clickable }]" @click="handleClick">
    <div class="stats-background">
      <div class="stats-pattern"></div>
    </div>
    
    <div class="stats-content">
      <div class="stats-header">
        <div class="stats-icon" :class="variant">
          <font-awesome-icon :icon="icon" />
        </div>
        <div class="stats-trend" v-if="trend !== undefined">
          <div class="trend-indicator" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
            <font-awesome-icon 
              :icon="trend >= 0 ? ['fas', 'arrow-up'] : ['fas', 'arrow-down']" 
            />
            <span>{{ Math.abs(trend) }}%</span>
          </div>
        </div>
      </div>
      
      <div class="stats-body">
        <div class="stats-value">{{ formattedValue }}</div>
        <div class="stats-label">{{ label }}</div>
        <div class="stats-description" v-if="description">{{ description }}</div>
      </div>
      
      <div class="stats-footer" v-if="clickable">
        <div class="view-more">
          <span>Ver detalhes</span>
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string[]
  label: string
  value: number | string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  trend?: number
  description?: string
  clickable?: boolean
  format?: 'number' | 'currency' | 'percentage'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  format: 'number',
  clickable: false
})

const emit = defineEmits(['click'])

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(props.value)
    case 'percentage':
      return `${props.value}%`
    default:
      return props.value.toLocaleString('pt-BR')
  }
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stats-card {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  transition: all var(--transition-normal);
  overflow: hidden;
  min-height: 180px;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-gray-200), var(--color-gray-300));
  transition: all var(--transition-fast);
}

.stats-card.primary::before {
  background: linear-gradient(90deg, var(--color-black), var(--color-gray-800));
}

.stats-card.secondary::before {
  background: linear-gradient(90deg, var(--color-gray-600), var(--color-gray-500));
}

.stats-card.success::before {
  background: linear-gradient(90deg, var(--color-success), #16a34a);
}

.stats-card.warning::before {
  background: linear-gradient(90deg, var(--color-warning), #d97706);
}

.stats-card.error::before {
  background: linear-gradient(90deg, var(--color-error), #dc2626);
}

.stats-card.clickable {
  cursor: pointer;
}

.stats-card.clickable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--color-gray-200);
}

.stats-card.clickable:hover::before {
  height: 6px;
}

.stats-background {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  overflow: hidden;
}

.stats-pattern {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--color-black) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-20px, -20px) rotate(360deg); }
}

.stats-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.stats-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  position: relative;
  transition: all var(--transition-fast);
}

.stats-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.stats-card:hover .stats-icon::before {
  opacity: 1;
}

.stats-icon.primary {
  background: linear-gradient(135deg, var(--color-black), var(--color-gray-800));
  color: var(--color-white);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.stats-icon.secondary {
  background: linear-gradient(135deg, var(--color-gray-600), var(--color-gray-500));
  color: var(--color-white);
  box-shadow: 0 8px 32px rgba(115, 115, 115, 0.2);
}

.stats-icon.success {
  background: linear-gradient(135deg, var(--color-success), #16a34a);
  color: var(--color-white);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
}

.stats-icon.warning {
  background: linear-gradient(135deg, var(--color-warning), #d97706);
  color: var(--color-white);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2);
}

.stats-icon.error {
  background: linear-gradient(135deg, var(--color-error), #dc2626);
  color: var(--color-white);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
}

.stats-trend {
  display: flex;
  align-items: center;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend-up {
  background: var(--color-success-light);
  color: var(--color-success);
}

.trend-down {
  background: var(--color-error-light);
  color: var(--color-error);
}

.stats-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-2);
  line-height: 1;
  background: linear-gradient(135deg, var(--color-black), var(--color-gray-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  line-height: var(--line-height-relaxed);
}

.stats-footer {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
}

.view-more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.stats-card:hover .view-more {
  color: var(--color-black);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .stats-card {
    padding: var(--space-6);
    min-height: 160px;
  }
  
  .stats-icon {
    width: 56px;
    height: 56px;
    font-size: var(--font-size-xl);
  }
  
  .stats-value {
    font-size: var(--font-size-3xl);
  }
  
  .stats-label {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .stats-card {
    padding: var(--space-4);
    min-height: 140px;
  }
  
  .stats-icon {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-lg);
  }
  
  .stats-value {
    font-size: var(--font-size-2xl);
  }
  
  .stats-header {
    margin-bottom: var(--space-4);
  }
}
</style>