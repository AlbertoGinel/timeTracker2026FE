<script setup lang="ts">
import { useAuth } from '@/feature/auth/useAuth'

const { quickFillCredentials } = useAuth()

const isDev = import.meta.env.DEV
</script>

<template>
  <div class="home">
    <h1>🎉 Welcome to Time Tracker!</h1>
    <p>Please log in to access your dashboard</p>
    <div class="test-credentials">
      <h3>Test Credentials:</h3>
      <ul>
        <li>
          <strong>Admin:</strong> john_doe / password123
          <button
            v-if="isDev"
            class="quick-login-btn"
            @click="quickFillCredentials('john_doe', 'password123')"
          >
            Quick Fill
          </button>
        </li>
        <li>
          <strong>Regular:</strong> jane_smith / password456
          <button
            v-if="isDev"
            class="quick-login-btn"
            @click="quickFillCredentials('jane_smith', 'password456')"
          >
            Quick Fill
          </button>
        </li>
        <li>
          <strong>Regular:</strong> bob_wilson / password789
          <button
            v-if="isDev"
            class="quick-login-btn"
            @click="quickFillCredentials('bob_wilson', 'password789')"
          >
            Quick Fill
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
}

h1 {
  color: #333;
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.test-credentials {
  margin-top: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: inline-block;
  text-align: left;
}

.test-credentials h3 {
  color: #333;
  margin-bottom: 1rem;
}

.test-credentials ul {
  list-style: none;
  padding: 0;
}

.test-credentials li {
  padding: 0.5rem 0;
  color: #666;
}

.test-credentials strong {
  color: #667eea;
}

.quick-login-btn {
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-login-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.quick-login-btn:active {
  transform: translateY(0);
}
</style>
