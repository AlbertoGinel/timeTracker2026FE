<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useBundleService } from '@/service/useBundleService'
import UserItem from '@/feature/sharedView/userItem.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const bundleService = useBundleService()

const selectedUserId = ref<string>('')

const selectedUser = computed(() => {
  if (!selectedUserId.value) return null
  return userStore.users.find((u) => u.id === selectedUserId.value) || null
})

const onUserSelected = async () => {
  if (!selectedUserId.value) return

  try {
    userStore.error = null

    // Get the selected user
    const user = userStore.users.find((u) => u.id === selectedUserId.value)
    if (!user) {
      userStore.error = 'User not found'
      return
    }

    // Set the user as the current context
    authStore.setContextUser(user)

    // Load the selected user's bundle
    await bundleService.loadUserBundle(selectedUserId.value)
  } catch (err) {
    userStore.error = 'Failed to load user data'
    console.error('Error loading user bundle:', err)
  }
}
</script>

<template>
  <div :class="$style.admin">
    <div :class="$style.adminGrid">
      <div :class="$style.gridItem">
        <h3>User</h3>
        <div :class="$style.userSelectContainer">
          <select
            v-model="selectedUserId"
            @change="onUserSelected"
            :class="$style.userDropdown"
            :disabled="userStore.isLoading"
          >
            <option value="">-- Select a user --</option>
            <option v-for="user in userStore.users" :key="user.id" :value="user.id">
              {{ user.nickname || user.username }}
            </option>
          </select>
          <p v-if="userStore.isLoading" :class="$style.loadingText">Loading...</p>
          <p v-if="userStore.error" :class="$style.errorText">{{ userStore.error }}</p>
        </div>
        <div :class="$style.card">
          <UserItem v-if="selectedUser" :user="selectedUser" variant="admin" />
        </div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 2</h3>
        <div :class="$style.card">Content 2</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 3</h3>
        <div :class="$style.card">Content 3</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 4</h3>
        <div :class="$style.card">Content 4</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 5</h3>
        <div :class="$style.card">Content 5</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 6</h3>
        <div :class="$style.card">Content 6</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 7</h3>
        <div :class="$style.card">Content 7</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 8</h3>
        <div :class="$style.card">Content 8</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 9</h3>
        <div :class="$style.card">Content 9</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 10</h3>
        <div :class="$style.card">Content 10</div>
      </div>
    </div>
  </div>
</template>

<style module>
@import '@/styles/tokens.module.css';

.admin {
  height: calc(100vh - 80px);
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.adminGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--spacing-lg);
  height: 100%;
}

.gridItem {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.gridItem h3 {
  color: var(--color-text);
  font-size: var(--font-lg);
  margin: 0 0 var(--spacing-sm) 0;
  padding: 0 var(--spacing-xs);
  flex-shrink: 0;
}

.card {
  background: var(--color-bg);
  padding: 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  flex: 1;
  height: 100%;
}

/* User selection specific styles */
.userSelectContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  justify-content: center;
}

.userDropdown {
  width: 100%;
  max-width: var(--max-width-input);
  padding: var(--spacing-md);
  font-size: var(--font-base);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--color-bg);
}

.userDropdown:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.userDropdown:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.loadingText {
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.errorText {
  color: var(--color-danger);
  font-weight: bold;
  margin: 0;
}
</style>
