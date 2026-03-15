<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import { useTimeSectionStore } from '@/store/useTimeSectionStore'
import { useDashboard } from './useDashboard'
import ActivityItem from '../sharedView/items/ActivityItem.vue'
import StampItem from '../sharedView/items/StampItem.vue'
import IntervalItem from '../sharedView/items/IntervalItem.vue'
import OngoinInterval from '../sharedView/OngoinInterval.vue'
import DayItem from '../sharedView/items/DayItem.vue'
import RegimeItem from '../sharedView/items/RegimeItem.vue'
import ContinuousCalendar from '@/feature/sharedView/continuousCalendar/continuousCalendar.vue'
import ClockDisplay from '../sharedView/clock.vue'

const route = useRoute()
const authStore = useAuthStore()
const timeSectionStore = useTimeSectionStore()
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

// Check if viewing as admin (viewing another user's data)
const isAdminView = computed(() => {
  return !!route.query.userId && route.query.userId !== authStore.loggedInUser?.id
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <ClockDisplay />
      <p v-if="!isAdminView">
        Welcome back, <strong>{{ authStore.currentContextUser?.nickname }}</strong
        >! {{ authStore.currentContextUser?.timezone }}
      </p>
      <div v-else class="admin-banner">
        <p>🔒 <strong>Admin View:</strong> Viewing user data (read-only mode)</p>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="grid-item grid-item-ongoing">
        <h2>Ongoing Interval</h2>
        <div class="card">
          <OngoinInterval
            :interval="ongoingInterval"
            :onStop="isAdminView ? () => {} : onStopPressed"
          />
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
            No activities yet.
          </div>

          <div v-else class="activities-list">
            <button
              v-for="activity in activityStore.activities"
              :key="activity.id"
              type="button"
              class="activity-button"
              :class="{ 'admin-disabled': isAdminView }"
              :disabled="isAdminView"
              @click="!isAdminView && onActivityPressed(activity)"
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
            <DayItem v-for="day in sortedDays" :key="day.dateKey" :day="day" />
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
        <h2>User Profile</h2>
        <div class="card">
          <UserItem />
        </div>
      </div>

      <div class="grid-item grid-item-timesection-top">
        <h2>Weeks</h2>
        <div class="card">
          <div v-if="timeSectionStore.isLoading" class="loading">Loading weeks...</div>

          <div v-else-if="timeSectionStore.error" class="error">
            {{ timeSectionStore.error }}
          </div>

          <div v-else-if="timeSectionStore.weeks.length === 0" class="empty">
            No weeks available.
          </div>

          <div v-else class="timesections-list">
            <div v-for="week in timeSectionStore.weeks" :key="week.id" class="timesection-item">
              <div class="timesection-header">
                <span class="timesection-key">{{ week.sectionKey }}</span>
                <span class="timesection-progress"
                  >{{ week.sectionPassed.toFixed(1) }}% complete</span
                >
              </div>
              <div v-if="week.percentageAchieved" class="timesection-achievement">
                Achievement: {{ week.percentageAchieved.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-item grid-item-timesection-bottom">
        <h2>Months & Years</h2>
        <div class="card">
          <div v-if="timeSectionStore.isLoading" class="loading">Loading time sections...</div>

          <div v-else-if="timeSectionStore.error" class="error">
            {{ timeSectionStore.error }}
          </div>

          <div v-else class="timesections-list">
            <div v-if="timeSectionStore.months.length > 0">
              <h3>Months</h3>
              <div
                v-for="month in timeSectionStore.months"
                :key="month.id"
                class="timesection-item"
              >
                <div class="timesection-header">
                  <span class="timesection-key">{{ month.sectionKey }}</span>
                  <span class="timesection-progress"
                    >{{ month.sectionPassed.toFixed(1) }}% complete</span
                  >
                </div>
                <div v-if="month.percentageAchieved" class="timesection-achievement">
                  Achievement: {{ month.percentageAchieved.toFixed(1) }}%
                </div>
              </div>
            </div>

            <div v-if="timeSectionStore.years.length > 0" style="margin-top: 1rem">
              <h3>Years</h3>
              <div v-for="year in timeSectionStore.years" :key="year.id" class="timesection-item">
                <div class="timesection-header">
                  <span class="timesection-key">{{ year.sectionKey }}</span>
                  <span class="timesection-progress"
                    >{{ year.sectionPassed.toFixed(1) }}% complete</span
                  >
                </div>
                <div v-if="year.percentageAchieved" class="timesection-achievement">
                  Achievement: {{ year.percentageAchieved.toFixed(1) }}%
                </div>
              </div>
            </div>

            <div
              v-if="timeSectionStore.months.length === 0 && timeSectionStore.years.length === 0"
              class="empty"
            >
              No months or years available.
            </div>
          </div>
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
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: auto minmax(300px, 1fr) minmax(400px, 1fr);
  gap: 1rem;
  grid-template-areas:
    'grid-item-ongoing grid-item-activities grid-item-regimes grid-item-extra1 grid-item-timesection-top'
    'grid-item-stamps grid-item-intervals grid-item-days grid-item-extra1 grid-item-timesection-top'
    'grid-item-stamps grid-item-intervals grid-item-days grid-item-extra2 grid-item-timesection-bottom';
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

.grid-item-timesection-top {
  grid-area: grid-item-timesection-top;
}

.grid-item-timesection-bottom {
  grid-area: grid-item-timesection-bottom;
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

.timesections-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timesections-list h3 {
  font-size: 1.1rem;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.timesection-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.timesection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.timesection-key {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.timesection-progress {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 500;
}

.timesection-achievement {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

/* Admin view specific styles */
.admin-banner {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
}

.admin-banner p {
  margin: 0;
  color: #92400e;
  font-size: 1rem;
}

.activity-button.admin-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.activity-button.admin-disabled:hover {
  opacity: 0.6;
}
</style>
