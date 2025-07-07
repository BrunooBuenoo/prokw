<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <font-awesome-icon :icon="['fas', 'cogs']" class="logo-icon" />
          <span class="logo-text">InfraKW</span>
        </div>
        <h1>Login</h1>
        <p>Faça login para acessar o sistema de gestão de equipamentos</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input 
            id="email"
            v-model="loginForm.email"
            type="email" 
            class="form-input"
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Senha</label>
          <input 
            id="password"
            v-model="loginForm.password"
            type="password" 
            class="form-input"
            placeholder="Sua senha"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>Lembrar de mim</span>
          </label>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-lg login-btn"
          :disabled="isLoading"
        >
          <font-awesome-icon 
            v-if="isLoading"
            :icon="['fas', 'spinner']" 
            class="fa-spin"
          />
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
        
        <div class="divider">
          <span>ou</span>
        </div>
        
        <button 
          type="button"
          class="btn btn-google btn-lg"
          @click="handleGoogleLogin"
          :disabled="isGoogleLoading"
        >
          <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ isGoogleLoading ? 'Conectando...' : 'Continuar com Google' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
      
      <div class="login-footer">
        <p>© 2024 InfraKW. Sistema de Gestão de Equipamentos de TI</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, loginWithGoogle, currentUser } = useAuth()

const loginForm = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const error = ref('')
const successMessage = ref('')

const handleLogin = async () => {
  error.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  try {
    const success = await login(loginForm.value.email, loginForm.value.password)
    
    if (success) {
      successMessage.value = 'Login realizado com sucesso!'
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      error.value = 'Email ou senha incorretos'
    }
  } catch (err) {
    error.value = 'Erro ao fazer login. Tente novamente.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  error.value = ''
  successMessage.value = ''
  isGoogleLoading.value = true
  
  try {
    const result = await loginWithGoogle()
    
    if (result.success) {
      successMessage.value = 'Login com Google realizado com sucesso!'
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      error.value = result.error || 'Erro ao fazer login com Google'
    }
  } catch (err) {
    error.value = 'Erro ao fazer login com Google. Tente novamente.'
    console.error('Google login error:', err)
  } finally {
    isGoogleLoading.value = false
  }
}

onMounted(() => {
  // If already logged in, redirect to dashboard
  if (currentUser.value) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  padding: var(--spacing-4);
}

.login-card {
  background-color: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.logo-icon {
  font-size: var(--font-size-4xl);
  color: var(--primary-600);
}

.logo-text {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-900);
}

.login-header h1 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--neutral-900);
}

.login-header p {
  color: var(--neutral-600);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--neutral-600);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.login-btn {
  width: 100%;
  margin-top: var(--spacing-2);
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-4) 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--neutral-300);
}

.divider span {
  background-color: white;
  padding: 0 var(--spacing-4);
  color: var(--neutral-500);
  font-size: var(--font-size-sm);
}

.btn-google {
  width: 100%;
  background-color: white;
  color: var(--neutral-700);
  border: 2px solid var(--neutral-300);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  transition: all var(--transition-fast);
}

.btn-google:hover:not(:disabled) {
  background-color: var(--neutral-50);
  border-color: var(--neutral-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-google:active {
  transform: translateY(0);
}

.google-icon {
  flex-shrink: 0;
}

.error-message {
  color: var(--error-600);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-3);
  background-color: var(--error-50);
  border: 1px solid var(--error-200);
  border-radius: var(--border-radius-base);
}

.success-message {
  color: var(--success-600);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-3);
  background-color: var(--success-50);
  border: 1px solid var(--success-200);
  border-radius: var(--border-radius-base);
}

.login-footer {
  text-align: center;
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--neutral-200);
}

.login-footer p {
  font-size: var(--font-size-xs);
  color: var(--neutral-500);
  margin: 0;
}

@media (max-width: 768px) {
  .login-card {
    padding: var(--spacing-6);
  }
  
  .logo-icon {
    font-size: var(--font-size-3xl);
  }
  
  .logo-text {
    font-size: var(--font-size-2xl);
  }
}
</style>