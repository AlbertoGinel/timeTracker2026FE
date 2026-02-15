<script setup lang="ts">
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboard } from './useDashboard'
import ActivityItem from './ActivityItem.vue'
import StampItem from './StampItem.vue'
import IntervalItem from './IntervalItem.vue'
import OngoinInterval from './OngoinInterval.vue'
import DayItem from './DayItem.vue'

const authStore = useAuthStore()
const {
  activityStore,
  stampStore,
  intervalStore,
  dayStore,
  ongoingInterval,
  intervalsForList,
  sortedDays,
  onActivityPressed,
  onStopPressed,
} = useDashboard()
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p>
        Welcome back, <strong>{{ authStore.currentUser?.nickname }}</strong
        >! {{ authStore.currentUser?.timezone }}
      </p>
    </div>

    <div class="dashboard-content">
      <div class="card card-ongoing">
        <h2>Ongoing Interval</h2>
        <OngoinInterval :interval="ongoingInterval" :onStop="onStopPressed" />
      </div>

      <div class="card">
        <h2>Activities</h2>

        <div v-if="activityStore.isLoading" class="loading">Loading activities...</div>

        <div v-else-if="activityStore.error" class="error">
          {{ activityStore.error }}
        </div>

        <div v-else-if="activityStore.activities.length === 0" class="empty">
          No activities yet. Create your first activity!
        </div>

        <div v-else class="activities-list">
          <button
            v-for="activity in activityStore.activities"
            :key="activity.id"
            type="button"
            class="activity-button"
            @click="onActivityPressed(activity)"
          >
            <ActivityItem :activity="activity" />
          </button>
        </div>
      </div>

      <div class="card">
        <h2>Stamps</h2>

        <div v-if="stampStore.isLoading" class="loading">Loading stamps...</div>

        <div v-else-if="stampStore.error" class="error">
          {{ stampStore.error }}
        </div>

        <div v-else-if="stampStore.stamps.length === 0" class="empty">
          No stamps yet. Start tracking your activities!
        </div>

        <div v-else class="stamps-list">
          <StampItem v-for="stamp in stampStore.stamps" :key="stamp.id" :stamp="stamp" />
        </div>
      </div>

      <div class="card">
        <h2>Intervals</h2>

        <div v-if="intervalStore.isLoading" class="loading">Loading intervals...</div>

        <div v-else-if="intervalStore.error" class="error">
          {{ intervalStore.error }}
        </div>

        <div v-else-if="intervalsForList.length === 0" class="empty">
          No intervals yet. Generate some data first.
        </div>

        <div v-else class="intervals-list">
          <IntervalItem
            v-for="interval in intervalsForList"
            :key="interval.id"
            :interval="interval"
          />
        </div>
      </div>
      <div class="card">
        <h2>Days</h2>

        <div v-if="dayStore.isLoading" class="loading">Loading days...</div>

        <div v-else-if="dayStore.error" class="error">
          {{ dayStore.error }}
        </div>

        <div v-else-if="sortedDays.length === 0" class="empty">No days available.</div>

        <div v-else class="days-list">
          <DayItem v-for="day in sortedDays" :key="day.id" :day="day" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  margin: 0 auto;
  padding: 1rem 2rem 3rem;
}

.dashboard-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.dashboard-header h1 {
  color: #333;
  font-size: 2.1rem;
  margin: 0;
}

.dashboard-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.dashboard-header strong {
  color: #667eea;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-ongoing {
  grid-column: 1 / -1;
  padding: 1.25rem 1.5rem;
}

.card-ongoing h2 {
  margin-bottom: 0.75rem;
}

.card h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.card p {
  color: #666;
}

.activities-list,
.stamps-list,
.intervals-list,
.days-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-button {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.activity-button:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 4px;
  border-radius: 10px;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
}

.empty {
  color: #9ca3af;
}
</style>
