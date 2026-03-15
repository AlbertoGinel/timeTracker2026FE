<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()
</script>

<template>
  <div v-if="isOpen" :class="$style.overlay" @click.self="$emit('close')">
    <div :class="$style.modal">
      <div :class="$style.content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style module>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
