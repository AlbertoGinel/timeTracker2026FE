<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { DateTime } from 'luxon'
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboard } from './useDashboard'
import ActivityItem from './ActivityItem.vue'
import StampItem from './StampItem.vue'
import IntervalItem from './IntervalItem.vue'
import OngoinInterval from './OngoinInterval.vue'
import DayItem from './DayItem.vue'
import RegimeItem from './RegimeItem.vue'
import ContinuousCalendar from '@/feature/continuousCalendar/continuousCalendar.vue'

const authStore = useAuthStore()
const {
  activityStore,
  stampStore,
  intervalStore,
  dayStore,
  regimeStore,
  ongoingInterval,
  intervalsForList,
  sortedDays,
  onActivityPressed,
  onStopPressed,
} = useDashboard()

// Clock
const currentTime = ref(DateTime.now())
let intervalId: number | null = null

const formattedDateTime = computed(() => {
  const tz = authStore.currentUser?.timezone || 'UTC'
  const dt = currentTime.value.setZone(tz)
  return {
    time: dt.toFormat('HH:mm:ss'),
    date: dt.toFormat('EEEE, MMMM d, yyyy'),
  }
})

onMounted(() => {
  intervalId = setInterval(() => {
    currentTime.value = DateTime.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <div class="clock">
        <div class="clock-time">{{ formattedDateTime.time }}</div>
        <div class="clock-date">{{ formattedDateTime.date }}</div>
      </div>
      <p>
        Welcome back, <strong>{{ authStore.currentUser?.nickname }}</strong
        >! {{ authStore.currentUser?.timezone }}
      </p>
    </div>

    <div class="dashboard-content">
      <div class="grid-item grid-item-ongoing">
        <h2>Ongoing Interval</h2>
        <div class="card">
          <OngoinInterval :interval="ongoingInterval" :onStop="onStopPressed" />
        </div>
      </div>

      <div class="grid-item grid-item-activities">
        <h2>Activities</h2>
        <div class="card">
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
      </div>

      <div class="grid-item grid-item-regimes">
        <h2>Regimes</h2>
        <div class="card">
          <div v-if="regimeStore.isLoading" class="loading">Loading regimes...</div>

          <div v-else-if="regimeStore.error" class="error">
            {{ regimeStore.error }}
          </div>

          <div v-else-if="regimeStore.regimes.length === 0" class="empty">
            No regimes yet. Create your first regime!
          </div>

          <div v-else class="regimes-list">
            <RegimeItem v-for="regime in regimeStore.regimes" :key="regime.id" :regime="regime" />
          </div>
        </div>
      </div>

      <div class="grid-item grid-item-stamps">
        <h2>Stamps</h2>
        <div class="card">
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
      </div>

      <div class="grid-item grid-item-intervals">
        <h2>Intervals</h2>
        <div class="card">
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
      </div>

      <div class="grid-item grid-item-days">
        <h2>Days</h2>
        <div class="card">
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

      <div class="grid-item grid-item-extra1">
        <h2>Calendar</h2>
        <div class="card">
          <ContinuousCalendar />
        </div>
      </div>

      <div class="grid-item grid-item-extra2">
        <h2>Extra 2</h2>
        <div class="card">
          <div class="empty">Extra section 2</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-height: calc(100vh - 80px);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.25rem;
  flex-shrink: 0;
}

.dashboard-header h1 {
  color: #333;
  font-size: 2.1rem;
  margin: 0;
}

.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.clock-time {
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.clock-date {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
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
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto minmax(300px, 1fr) minmax(400px, 1fr);
  gap: 1rem;
  grid-template-areas:
    'grid-item-ongoing grid-item-activities grid-item-regimes grid-item-extra1'
    'grid-item-stamps grid-item-intervals grid-item-days grid-item-extra1'
    'grid-item-stamps grid-item-intervals grid-item-days grid-item-extra2';
  flex: 1;
  min-height: 0;
}

.grid-item {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.grid-item h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  padding: 0 0.25rem;
  flex-shrink: 0;
}

.grid-item-ongoing {
  grid-area: grid-item-ongoing;
}

.grid-item-ongoing h2 {
  margin-bottom: 0.5rem;
}

.grid-item-activities {
  grid-area: grid-item-activities;
}

.grid-item-regimes {
  grid-area: grid-item-regimes;
}

.grid-item-stamps {
  grid-area: grid-item-stamps;
}

.grid-item-intervals {
  grid-area: grid-item-intervals;
}

.grid-item-days {
  grid-area: grid-item-days;
}

.grid-item-extra1 {
  grid-area: grid-item-extra1;
}

.grid-item-extra2 {
  grid-area: grid-item-extra2;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  min-height: 0;
  flex: 1;
}

.grid-item-ongoing .card {
  padding: 1rem 1.25rem;
}

.activities-list,
.stamps-list,
.intervals-list,
.days-list,
.regimes-list {
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
