import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import HomeView from '@/feature/home/HomeView.vue'
import DashboardView from '@/feature/dashboard/DashboardView.vue'
import AdminView from '@/feature/admin/AdminView.vue'
import NotFoundView from '@/view/NotFoundView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for session restore on first navigation
  if (!authStore.currentUser && !from.name) {
    await authStore.restoreSession()
  }

  // Redirect authenticated users away from home to dashboard
  if (to.name === 'home' && authStore.isAuthenticated) {
    console.log('🔀 User is authenticated. Redirecting to dashboard.')
    next({ name: 'dashboard' })
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to home if not authenticated
    console.log('🔀 No authentication. Redirecting to home.')
    next({ name: 'home' })
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard if not admin
    console.log('🔀 Admin access required. Redirecting to dashboard.')
    next({ name: 'dashboard' })
    return
  }

  // Allow navigation
  next()
})

export default router
