import type { Activity } from '@/type/mainTypes'
import { computed } from 'vue'
import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'
import { useIntervalStore } from '@/store/useIntervalStore'
import { useBundleService } from '@/service/useBundleService'

const toStampTimestamp = () => new Date().toISOString().slice(0, 19)

export const useDashboard = () => {
  const activityStore = useActivityStore()
  const stampStore = useStampStore()
  const intervalStore = useIntervalStore()
  const bundleService = useBundleService()

  const ongoingInterval = computed(
    () => intervalStore.intervals.find((interval) => interval.toDate === null) ?? null,
  )

  const intervalsForList = computed(() =>
    intervalStore.intervals.filter((interval) => interval.toDate !== null),
  )

  const onActivityPressed = async (activity: Activity) => {
    const created = await stampStore.createStamp({
      timestamp: toStampTimestamp(),
      type: 'start',
      activity_id: activity.id,
    })
    if (created) {
      await bundleService.loadUserBundle()
    }
    return created
  }

  const onStopPressed = async () => {
    if (!ongoingInterval.value) return null
    const created = await stampStore.createStamp({
      timestamp: toStampTimestamp(),
      type: 'stop',
      activity_id: null,
    })
    if (created) {
      await bundleService.loadUserBundle()
    }
    return created
  }

  return {
    activityStore,
    stampStore,
    intervalStore,
    ongoingInterval,
    intervalsForList,
    onActivityPressed,
    onStopPressed,
  }
}
