<template>
  <div id="app">
    <!-- Loading Screen Elegante -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-container">
        <div class="loading-logo">
          <font-awesome-icon :icon="['fas', 'cogs']" class="loading-icon" />
        </div>
        <div class="loading-text">
          <h2>InfraKW</h2>
          <p>Carregando sistema...</p>
        </div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>
    
    <!-- Tela de Login Moderna -->
    <div v-else-if="!currentUser" class="login-layout">
      <div class="login-background">
        <div class="login-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="logo">
              <div class="logo-icon">
                <font-awesome-icon :icon="['fas', 'cogs']" />
              </div>
              <div class="logo-text">
                <h1>InfraKW</h1>
                <p>Sistema de Gestão de Equipamentos</p>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <div class="input-wrapper">
                <font-awesome-icon :icon="['fas', 'envelope']" class="input-icon" />
                <input 
                  id="email"
                  v-model="loginForm.email"
                  type="email" 
                  class="form-input"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Senha</label>
              <div class="input-wrapper">
                <font-awesome-icon :icon="['fas', 'lock']" class="input-icon" />
                <input 
                  id="password"
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Sua senha"
                  required
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                </button>
              </div>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe" />
                <span class="checkmark"></span>
                <span>Lembrar de mim</span>
              </label>
              <a href="#" class="forgot-password">Esqueceu a senha?</a>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg login-btn"
              :disabled="isLoginLoading"
            >
              <font-awesome-icon 
                v-if="isLoginLoading"
                :icon="['fas', 'spinner']" 
                class="loading-icon"
              />
              {{ isLoginLoading ? 'Entrando...' : 'Entrar' }}
            </button>
            
            <div class="divider">
              <span>ou continue com</span>
            </div>
            
            <button 
              type="button"
              class="btn btn-secondary btn-lg google-btn"
              @click="handleGoogleLogin"
              :disabled="isGoogleLoading"
            >
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {{ isGoogleLoading ? 'Conectando...' : 'Google' }}
            </button>
            
            <div v-if="error" class="alert alert-error">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
              {{ error }}
            </div>
            
            <div v-if="successMessage" class="alert alert-success">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              {{ successMessage }}
            </div>
          </form>
          
          <div class="demo-section">
            <h4>Credenciais de Demonstração</h4>
            <div class="demo-grid">
              <div class="demo-item" @click="fillCredentials('admin@teste.com', '123456')">
                <strong>Admin</strong>
                <span>admin@teste.com</span>
              </div>
              <div class="demo-item" @click="fillCredentials('tecnico@teste.com', '123456')">
                <strong>Técnico</strong>
                <span>tecnico@teste.com</span>
              </div>
              <div class="demo-item" @click="fillCredentials('diretor@teste.com', '123456')">
                <strong>Diretor</strong>
                <span>diretor@teste.com</span>
              </div>
              <div class="demo-item" @click="fillCredentials('visualizador@teste.com', '123456')">
                <strong>Visualizador</strong>
                <span>visualizador@teste.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Layout Principal -->
    <div v-else class="main-layout">
      <Sidebar />
      <div class="content-wrapper">
        <TopBar @search="handleSearch" @toggleMobileMenu="toggleMobileMenu" />
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import "/src/style.css"

const loginForm = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const showPassword = ref(false)
const isLoginLoading = ref(false)
const isGoogleLoading = ref(false)
const error = ref('')
const successMessage = ref('')

const { currentUser, isLoading, login, loginWithGoogle } = useAuth()

const handleLogin = async () => {
  error.value = ''
  successMessage.value = ''
  isLoginLoading.value = true
  
  try {
    const success = await login(loginForm.value.email, loginForm.value.password)
    
    if (success) {
      successMessage.value = 'Login realizado com sucesso!'
    } else {
      error.value = 'Email ou senha incorretos'
    }
  } catch (err) {
    error.value = 'Erro ao fazer login. Tente novamente.'
    console.error('Login error:', err)
  } finally {
    isLoginLoading.value = false
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

const fillCredentials = (email: string, password: string) => {
  loginForm.value.email = email
  loginForm.value.password = password
}

const handleSearch = (query: string) => {
  console.log('Search query:', query)
}

const toggleMobileMenu = () => {
  console.log('Toggle mobile menu')
}

provide('auth', { currentUser, isLoading })

onMounted(() => {
  setTimeout(() => {
    // Simulate loading completion
  }, 1000)
})
</script>

<style scoped>
/* Loading Screen */
.loading-screen {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-black) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  color: var(--color-white);
}

.loading-logo {
  margin-bottom: var(--space-6);
}

.loading-icon {
  font-size: 4rem;
  animation: spin 2s linear infinite;
}

.loading-text h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
}

.loading-text p {
  color: var(--color-gray-400);
  margin-bottom: var(--space-8);
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: var(--color-gray-800);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin: 0 auto;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-white), var(--color-gray-300));
  border-radius: var(--radius-full);
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Login Layout */
.login-layout {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.login-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-white) 100%);
  overflow: hidden;
}

.login-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-3xl);
  padding: var(--space-10);
  box-shadow: var(--shadow-2xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-10);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: var(--color-black);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  color: var(--color-white);
  box-shadow: var(--shadow-lg);
}

.logo-text h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-1);
}

.logo-text p {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  z-index: 1;
}

.input-wrapper .form-input {
  padding-left: var(--space-12);
  padding-right: var(--space-12);
}

.password-toggle {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-gray-600);
  background: var(--color-gray-100);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-300);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: var(--color-black);
  border-color: var(--color-black);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.forgot-password {
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.forgot-password:hover {
  color: var(--color-black);
}

.login-btn {
  width: 100%;
  margin-top: var(--space-4);
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--space-6) 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-gray-200);
}

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 var(--space-4);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.google-btn {
  width: 100%;
  gap: var(--space-3);
}

.google-icon {
  flex-shrink: 0;
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.alert-error {
  background: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.demo-section {
  margin-top: var(--space-8);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-gray-200);
}

.demo-section h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--space-4);
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.demo-item {
  padding: var(--space-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.demo-item:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
}

.demo-item strong {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin-bottom: var(--space-1);
}

.demo-item span {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

/* Main Layout */
.main-layout {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background: var(--color-gray-50);
  border-radius: 50px !important;
  min-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
  
  .main-content {
    border-radius: 50px !important;
    min-height: calc(100vh - 140px);
  }
  
  .login-card {
    padding: var(--space-8);
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .shape {
    display: none;
  }
}
</style>