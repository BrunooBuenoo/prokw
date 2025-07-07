<template>
  <div class="city-autocomplete" ref="autocompleteRef">
    <div class="input-container">
      <div class="input-wrapper" :class="{ 'focused': isFocused, 'has-value': inputValue }">
        <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="input-icon" />
        <input
          v-model="inputValue"
          type="text"
          :placeholder="placeholder"
          :class="['city-input', inputClass]"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          autocomplete="off"
        />
        <div class="input-border"></div>
      </div>
    </div>
    
    <transition name="dropdown-fade">
      <div 
        v-if="showDropdown && filteredCities.length > 0" 
        class="dropdown"
      >
        <div class="dropdown-header">
          <span class="dropdown-title">Cidades encontradas</span>
          <span class="dropdown-count">{{ filteredCities.length }} resultados</span>
        </div>
        <div class="dropdown-list">
          <div
            v-for="(city, index) in filteredCities"
            :key="city.id"
            class="dropdown-item"
            :class="{ 'highlighted': index === highlightedIndex }"
            @mousedown="selectCity(city)"
            @mouseenter="highlightedIndex = index"
          >
            <div class="city-icon">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            </div>
            <div class="city-info">
              <span class="city-name">{{ city.name }}</span>
              <span class="state-name">{{ city.state }}</span>
            </div>
            <div class="city-arrow">
              <font-awesome-icon :icon="['fas', 'arrow-right']" />
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'spinner']" class="loading-icon" />
      </div>
      <span>Carregando cidades...</span>
    </div>
    
    <div v-if="showDropdown && filteredCities.length === 0 && inputValue.length >= 2" class="empty-dropdown">
      <div class="empty-icon">
        <font-awesome-icon :icon="['fas', 'search']" />
      </div>
      <span>Nenhuma cidade encontrada</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useCities } from '../../composables/useCities'

export default {
  name: 'CityAutocomplete',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Digite o nome da cidade...'
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'citySelected'],
  setup(props, { emit }) {
    const { cities, loading, searchTerm, filteredCities, loadCities } = useCities()
    
    const autocompleteRef = ref(null)
    const inputValue = ref(props.modelValue)
    const showDropdown = ref(false)
    const highlightedIndex = ref(-1)
    const isFocused = ref(false)
    
    onMounted(() => {
      loadCities()
    })
    
    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue
    })
    
    watch(inputValue, (newValue) => {
      emit('update:modelValue', newValue)
      searchTerm.value = newValue
    })
    
    const handleInput = () => {
      showDropdown.value = inputValue.value.length >= 2
      highlightedIndex.value = -1
    }
    
    const handleFocus = () => {
      isFocused.value = true
      if (inputValue.value.length >= 2) {
        showDropdown.value = true
      }
    }
    
    const handleBlur = () => {
      isFocused.value = false
      setTimeout(() => {
        showDropdown.value = false
        highlightedIndex.value = -1
      }, 200)
    }
    
    const handleKeydown = (event) => {
      if (!showDropdown.value || filteredCities.value.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          highlightedIndex.value = Math.min(
            highlightedIndex.value + 1,
            filteredCities.value.length - 1
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex.value >= 0) {
            selectCity(filteredCities.value[highlightedIndex.value])
          }
          break
        case 'Escape':
          showDropdown.value = false
          highlightedIndex.value = -1
          break
      }
    }
    
    const selectCity = (city) => {
      inputValue.value = city.fullName
      showDropdown.value = false
      highlightedIndex.value = -1
      emit('citySelected', city)
    }
    
    const handleClickOutside = (event) => {
      if (autocompleteRef.value && !autocompleteRef.value.contains(event.target)) {
        showDropdown.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      autocompleteRef,
      inputValue,
      showDropdown,
      highlightedIndex,
      filteredCities,
      loading,
      isFocused,
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      selectCity
    }
  }
}
</script>

<style scoped>
.city-autocomplete {
  position: relative;
  width: 100%;
}

.input-container {
  position: relative;
}

.input-wrapper {
  position: relative;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.input-wrapper.focused {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.input-wrapper.has-value .input-icon {
  color: var(--color-black);
}

.input-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  font-size: var(--font-size-lg);
  z-index: 2;
  transition: all var(--transition-fast);
}

.city-input {
  width: 100%;
  padding: var(--space-4) var(--space-6) var(--space-4) var(--space-12);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-base);
  color: var(--color-gray-900);
  background: transparent;
  transition: all var(--transition-fast);
  outline: none;
}

.city-input:focus {
  border-color: var(--color-black);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
}

.city-input::placeholder {
  color: var(--color-gray-400);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-black), var(--color-gray-700));
  transform: scaleX(0);
  transition: transform var(--transition-fast);
}

.input-wrapper.focused .input-border {
  transform: scaleX(1);
}

.dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
  backdrop-filter: var(--backdrop-blur);
}

.dropdown-header {
  padding: var(--space-4) var(--space-6);
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.dropdown-count {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  background: var(--color-gray-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-gray-100);
  position: relative;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background: var(--color-gray-50);
  transform: translateX(4px);
}

.dropdown-item.highlighted {
  background: linear-gradient(90deg, var(--color-black), transparent);
  color: var(--color-white);
}

.dropdown-item.highlighted .city-icon,
.dropdown-item.highlighted .city-arrow {
  color: var(--color-white);
}

.city-icon {
  width: 40px;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.dropdown-item:hover .city-icon {
  background: var(--color-black);
  color: var(--color-white);
  transform: scale(1.1);
}

.city-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.city-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  font-size: var(--font-size-base);
}

.dropdown-item.highlighted .city-name {
  color: var(--color-white);
}

.state-name {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  background: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  align-self: flex-start;
}

.dropdown-item.highlighted .state-name {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
}

.city-arrow {
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-fast);
}

.dropdown-item:hover .city-arrow {
  opacity: 1;
  transform: translateX(0);
}

.loading-indicator,
.empty-dropdown {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-gray-500);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  animation: spin 1s linear infinite;
}

.empty-icon {
  width: 40px;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  font-size: var(--font-size-lg);
}

/* Animations */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all var(--transition-normal);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Scrollbar */
.dropdown-list::-webkit-scrollbar {
  width: 4px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: var(--color-gray-100);
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

/* Responsividade */
@media (max-width: 768px) {
  .dropdown {
    max-height: 250px;
  }
  
  .dropdown-item {
    padding: var(--space-4);
  }
  
  .city-name {
    font-size: var(--font-size-sm);
  }
  
  .state-name {
    font-size: var(--font-size-xs);
  }
  
  .city-icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-base);
  }
}
</style>