import { ref, watch, type Ref } from 'vue'

/**
 * Composable for managing validated input fields.
 * Allows free typing but validates on blur, reverting to last valid value if invalid.
 */
export const useValidatedInput = <T extends string | number>(
  getValue: () => T,
  validator: (value: T) => boolean,
  onValidUpdate: (value: T) => void,
) => {
  const inputValue = ref<T>(getValue()) as Ref<T>

  // Watch for external changes (e.g., from sorting or other updates)
  watch(getValue, (newValue) => {
    inputValue.value = newValue
  })

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    inputValue.value = target.value as T
  }

  const handleBlur = () => {
    if (validator(inputValue.value)) {
      onValidUpdate(inputValue.value)
    } else {
      // Revert to last valid value
      inputValue.value = getValue()
    }
  }

  return {
    inputValue,
    handleInput,
    handleBlur,
  }
}
