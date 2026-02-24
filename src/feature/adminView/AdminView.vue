<script setup lang="ts">
import UserItem from '@/feature/sharedView/userItem.vue'
import StampItem from '@/feature/sharedView/StampItem.vue'
import IntervalItem from '@/feature/sharedView/IntervalItem.vue'
import ActivityItem from '@/feature/sharedView/ActivityItem.vue'
import RegimeItem from '@/feature/sharedView/RegimeItem.vue'
import OngoinInterval from '@/feature/sharedView/OngoinInterval.vue'
import ContinuousCalendar from '@/feature/sharedView/continuousCalendar/continuousCalendar.vue'
import ClockDisplay from '@/feature/sharedView/clock.vue'
import TimeSectionItem from '@/feature/sharedView/TimeSectionItem.vue'
import { useAdminView } from './useAdminView'
import { useTimeSectionStore } from '@/store/useTimeSectionStore'

const {
  userStore,
  activityStore,
  stampStore,
  intervalStore,
  regimeStore,
  selectedUserId,
  selectedUser,
  ongoingInterval,
  onUserSelected,
  onActivityPressed,
  onStopPressed,
} = useAdminView()

const timeSectionStore = useTimeSectionStore()
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
        <h3>Activities and regimes</h3>
        <div :class="$style.card">
          <div style="padding: 8px">
            <ClockDisplay v-if="selectedUser" />
            <OngoinInterval :interval="ongoingInterval" :on-stop="onStopPressed" />
          </div>
          <ActivityItem
            v-for="activity in activityStore.activities"
            :key="activity.id"
            :activity="activity"
            variant="admin"
            :on-click="onActivityPressed"
          />
          <div :class="$style.regimesSection">
            <h4 :class="$style.sectionTitle">Regimes</h4>
            <RegimeItem
              v-for="regime in regimeStore.regimes"
              :key="regime.id"
              :regime="regime"
              variant="admin"
            />
          </div>
        </div>
      </div>

      <div :class="[$style.gridItem, $style.spanTwo]">
        <h3>Calendar</h3>
        <div :class="$style.card">
          <ContinuousCalendar v-if="selectedUser" variant="admin" />
          <p v-else :class="$style.placeholderText">Select a user to view calendar</p>
        </div>
      </div>

      <div :class="$style.gridItem">
        <h3>Section 5</h3>
        <div :class="$style.card">Content 5</div>
      </div>

      <div :class="$style.gridItem">
        <h3>Stamps</h3>
        <div :class="$style.card">
          <StampItem
            v-for="stamp in stampStore.stamps"
            :key="stamp.id"
            :stamp="stamp"
            variant="admin"
          />
        </div>
      </div>

      <div :class="$style.gridItem">
        <h3>Intervals</h3>
        <div :class="$style.card">
          <IntervalItem
            v-for="interval in intervalStore.intervals"
            :key="interval.id"
            :interval="interval"
            variant="admin"
          />
        </div>
      </div>

      <div :class="$style.gridItem">
        <h3>Time Sections</h3>
        <div :class="$style.card">
          <div :class="$style.regimesSection">
            <h4 :class="$style.sectionTitle">Weeks</h4>
            <TimeSectionItem
              v-for="week in timeSectionStore.weeks"
              :key="week.id"
              :time-section="week"
              variant="admin"
            />
          </div>
          <div :class="$style.regimesSection">
            <h4 :class="$style.sectionTitle">Months</h4>
            <TimeSectionItem
              v-for="month in timeSectionStore.months"
              :key="month.id"
              :time-section="month"
              variant="admin"
            />
          </div>
          <div :class="$style.regimesSection">
            <h4 :class="$style.sectionTitle">Years</h4>
            <TimeSectionItem
              v-for="year in timeSectionStore.years"
              :key="year.id"
              :time-section="year"
              variant="admin"
            />
          </div>
        </div>
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
  min-height: 0;
  overflow: hidden;
}

.gridItem h3 {
  color: var(--color-text);
  font-size: var(--font-lg);
  margin: 0 0 var(--spacing-sm) 0;
  padding: 0 var(--spacing-xs);
  flex-shrink: 0;
}

.spanTwo {
  grid-column: span 2;
}

.card {
  background: var(--color-bg);
  padding: 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: auto;
  flex: 1;
  min-height: 0;
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

.regimesSection {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sectionTitle {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
}

.placeholderText {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-xl);
  margin: 0;
}
</style>
