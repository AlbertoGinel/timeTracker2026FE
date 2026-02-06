<script setup lang="ts"></script>

<template>
  <div class="home">
    <h1>🎉 Welcome to Time Tracker!</h1>
    <p>Please log in to access your dashboard</p>
    <div class="test-credentials">
      <h3>Test Credentials:</h3>
      <ul>
        <li><strong>Admin:</strong> john_doe / password123</li>
        <li><strong>Regular:</strong> jane_smith / password456</li>
        <li><strong>Regular:</strong> bob_wilson / password789</li>
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
</style>
