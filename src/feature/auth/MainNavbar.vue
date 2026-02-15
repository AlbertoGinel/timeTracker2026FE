<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth'

const route = useRoute()
const router = useRouter()

const {
  username,
  password,
  isAuthenticated,
  isAdmin,
  currentUser,
  isLoading,
  error,
  login,
  logout,
} = useAuth()

// UI-specific state stays in component
const showPassword = ref(false)

const isOnDashboard = () => route.name === 'dashboard'
const goToDashboard = () => router.push({ name: 'dashboard' })

// UI-specific handlers stay in component
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    login()
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <h2>⏱️ Time Tracker</h2>
      </div>

      <div class="navbar-content">
        <!-- Not authenticated: Show login form -->
        <div v-if="!isAuthenticated" class="login-form">
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="input"
            @keypress="handleKeyPress"
          />
          <div class="password-container">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="input"
              @keypress="handleKeyPress"
            />
            <button type="button" class="toggle-password" @click="togglePasswordVisibility">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <button class="btn btn-primary" :disabled="isLoading" @click="login">
            {{ isLoading ? 'Loading...' : 'Login' }}
          </button>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>

        <!-- Authenticated: Show user info -->
        <div v-else class="user-info">
          <span class="welcome-message">
            Welcome, <strong>{{ currentUser?.nickname }}</strong>
            <span v-if="isAdmin" class="admin-badge">👑 Admin</span>
          </span>
          <button v-if="!isOnDashboard()" class="btn btn-dashboard" @click="goToDashboard">
            📊 Dashboard
          </button>
          <button class="btn btn-secondary" @click="logout">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.navbar-brand h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.navbar-content {
  display: flex;
  align-items: center;
}

.login-form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-width: 150px;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.2);
}

.toggle-password {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-dashboard {
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-dashboard:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.error-message {
  color: #ffcccb;
  font-size: 0.85rem;
  background: rgba(255, 0, 0, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  font-size: 1rem;
}

.welcome-message strong {
  font-weight: 600;
  font-size: 1.1rem;
}

.admin-badge {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  margin-left: 0.5rem;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
  }

  .login-form {
    flex-wrap: wrap;
    justify-content: center;
  }

  .input {
    min-width: 120px;
  }
}
</style>
