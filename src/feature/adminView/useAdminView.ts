import { ref, computed } from 'vue'
import type { Activity } from '@/type/mainTypes'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useStampStore } from '@/store/useStampStore'
import { useIntervalStore } from '@/store/useIntervalStore'
import { useActivityStore } from '@/store/useActivityStore'
import { useRegimeStore } from '@/store/useRegimeStore'
import { useBundleService } from '@/service/useBundleService'

export const useAdminView = () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const stampStore = useStampStore()
  const intervalStore = useIntervalStore()
  const activityStore = useActivityStore()
  const regimeStore = useRegimeStore()
  const bundleService = useBundleService()

  const selectedUserId = ref<string>('')

  const selectedUser = computed(() => {
    if (!selectedUserId.value) return null
    return userStore.users.find((u) => u.id === selectedUserId.value) || null
  })

  const ongoingInterval = computed(
    () => intervalStore.intervals.find((interval) => interval.toDate === null) ?? null,
  )

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

  const onActivityPressed = async (activity: Activity) => {
    if (!selectedUserId.value) {
      console.error('No user selected')
      return
    }

    console.log('[AdminView] Creating stamp for activity:', activity.name)
    // Pass user in the request body for admin stamp creation
    const created = await stampStore.createStamp({
      timestamp: new Date().toISOString(),
      type: 'start',
      activity_id: activity.id,
      user: selectedUserId.value,
    })
    console.log('[AdminView] Stamp created:', created)

    if (created) {
      console.log('[AdminView] Loading bundle for user:', selectedUserId.value)
      await bundleService.loadUserBundle(selectedUserId.value)
      console.log('[AdminView] Bundle loaded. Total stamps in store:', stampStore.stamps.length)
      console.log('[AdminView] First 3 stamps:', stampStore.stamps.slice(0, 3))
    }
  }

  const onStopPressed = async () => {
    if (!ongoingInterval.value) return
    if (!selectedUserId.value) {
      console.error('No user selected')
      return
    }

    // Pass user in the request body for admin stamp creation
    const created = await stampStore.createStamp({
      timestamp: new Date().toISOString(),
      type: 'stop',
      activity_id: null,
      user: selectedUserId.value,
    })

    if (created) {
      await bundleService.loadUserBundle(selectedUserId.value)
    }
  }

  return {
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
  }
}
