import { ref, markRaw, type Component } from 'vue'
import type { ScaleLevel } from '@/type/mainTypes'
import ScaleForm from './forms/scaleForm/ScaleForm.vue'
import ActivityForm from './forms/activityForm/ActivityForm.vue'
import RegimeForm from './forms/regimeForm/RegimeForm.vue'
import DayForm from './forms/dayForm/DayForm.vue'

type FormType = 'scale' | 'activity' | 'regime' | 'day'

// Form-specific props
interface ScaleFormProps {
  initialScale?: ScaleLevel[]
  mode?: 'new' | 'edit'
}

// Union type for all form props (extend as other forms are implemented)
type FormProps = ScaleFormProps | Record<string, never> // Record<string, never> for forms without props

export const useEditModal = () => {
  const isOpen = ref(false)
  const currentForm = ref<Component | null>(null)
  const formProps = ref<FormProps>({})

  const formMap: Record<FormType, Component> = {
    scale: markRaw(ScaleForm),
    activity: markRaw(ActivityForm),
    regime: markRaw(RegimeForm),
    day: markRaw(DayForm),
  }

  const openModal = (formType: FormType, props?: FormProps) => {
    currentForm.value = formMap[formType]
    formProps.value = props || {}
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
    currentForm.value = null
    formProps.value = {}
  }

  const save = () => {
    // TODO: implement save logic
    closeModal()
  }

  return {
    isOpen,
    currentForm,
    formProps,
    openModal,
    closeModal,
    save,
  }
}
