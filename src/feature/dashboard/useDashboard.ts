import type { Activity } from '@/type/mainTypes'
import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'
import { useBundleService } from '@/service/useBundleService'

const toStampTimestamp = () => new Date().toISOString().slice(0, 19)

export const useDashboard = () => {
  const activityStore = useActivityStore()
  const stampStore = useStampStore()
  const bundleService = useBundleService()

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

  return {
    activityStore,
    stampStore,
    onActivityPressed,
  }
}
