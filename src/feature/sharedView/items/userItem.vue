<script setup lang="ts">
import { useAuthStore } from '@/store/useAuthStore'
import { computed } from 'vue'
import type { UserResponse } from '@/API/APITypes'
import adminStyles from '@/styles/adminListItem.module.css'

const props = defineProps<{
  user?: UserResponse | null
  variant?: 'default' | 'admin'
}>()

const authStore = useAuthStore()

const displayUser = computed(() => props.user || authStore.currentContextUser)
</script>

<template>
  <!-- Admin Variant: Simple Text Layout -->
  <div v-if="displayUser && variant === 'admin'" class="user-item-admin">
    <div class="admin-name">{{ displayUser.nickname }}</div>
    <div class="admin-line">Username: {{ displayUser.username }}</div>
    <div class="admin-line">Timezone: {{ displayUser.timezone }}</div>
    <div class="admin-line">Scale:</div>
    <div
      v-for="(level, index) in displayUser.scale"
      :key="index"
      :class="adminStyles.listItem"
      :style="{ '--item-color': level.color }"
    >
      <span :class="adminStyles.icon">{{ level.icon }}</span>
      <span :class="adminStyles.content">{{ level.name }}</span>
      <span :class="adminStyles.value">{{ level.percent }}%</span>
    </div>
  </div>

  <!-- Default Variant: Full Layout -->
  <div v-else-if="displayUser" class="user-item">
    <div class="user-header">
      <h2 class="user-nickname">{{ displayUser.nickname }}</h2>
      <span class="user-role" :class="displayUser.role">{{ displayUser.role }}</span>
    </div>

    <div class="user-info">
      <div class="info-row">
        <span class="info-label">Username:</span>
        <span class="info-value">{{ displayUser.username }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Timezone:</span>
        <span class="info-value">{{ displayUser.timezone }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">User ID:</span>
        <span class="info-value">{{ displayUser.id }}</span>
      </div>
    </div>

    <div class="scale-section">
      <h3 class="scale-title">Performance Scale</h3>
      <div class="scale-levels">
        <div
          v-for="(level, index) in displayUser.scale"
          :key="index"
          class="scale-level"
          :style="{ borderLeftColor: level.color }"
        >
          <div class="level-icon">{{ level.icon }}</div>
          <div class="level-details">
            <div class="level-name" :style="{ color: level.color }">{{ level.name }}</div>
            <div class="level-percent">{{ level.percent }}%+</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="no-user">
    <p>No user logged in</p>
  </div>
</template>

<style scoped>
/* Admin Variant Styles */
.user-item-admin {
  padding: 16px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  line-height: 1.6;
  color: #2c3e50;
}

.admin-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
}

.admin-line {
  font-size: 14px;
  margin: 4px 0;
  color: #2c3e50;
}

/* Default Variant Styles */
.user-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.user-nickname {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.user-role {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-role.admin {
  background: #e74c3c;
  color: white;
}

.user-role.regular {
  background: #3498db;
  color: white;
}

.user-info {
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #7f8c8d;
  width: 120px;
  flex-shrink: 0;
}

.info-value {
  color: #2c3e50;
  font-family: monospace;
  word-break: break-all;
}

.scale-section {
  margin-top: 24px;
}

.scale-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.scale-levels {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scale-level {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.scale-level:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.level-icon {
  font-size: 32px;
  margin-right: 16px;
  flex-shrink: 0;
}

.level-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  text-transform: capitalize;
}

.level-percent {
  font-size: 18px;
  font-weight: 700;
  color: #7f8c8d;
  font-family: monospace;
}

.no-user {
  text-align: center;
  padding: 48px;
  color: #7f8c8d;
}

.no-user p {
  margin: 0;
  font-size: 18px;
}
</style>
