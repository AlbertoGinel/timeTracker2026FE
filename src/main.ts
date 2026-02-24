import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAppInitializer } from './feature/initializer/useAppInitializer'

// Import global styles and design tokens
import '@/styles/global.css'
import '@/styles/tokens.module.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize the app before mounting
const { initializeApp } = useAppInitializer()
initializeApp()
  .then(() => {
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Failed to initialize app:', error)
  })
