import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/useAuthStore'
import HomeView from '@/feature/home/HomeView.vue'
import DashboardView from '@/feature/adminView/DashboardView.vue'
import AdminView from '@/feature/adminView/AdminView.vue'
import NotFoundView from '@/view/NotFoundView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  // ============================================================
  // PUBLIC ROUTES
  // ============================================================
  {
    path: '/',
    name: 'root',
    redirect: () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return { name: 'home' }
      return authStore.isAdmin ? { name: 'admin' } : { name: 'user' }
    },
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false },
  },

  // ============================================================
  // USER ROUTES (Regular users)
  // ============================================================
  {
    path: '/user',
    name: 'user',
    component: HomeView, // TODO: Replace with UserView when created
    meta: { requiresAuth: true },
  },

  // ============================================================
  // ADMIN ROUTES (Admin users only)
  // ============================================================
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // ============================================================
  // 404 CATCH-ALL
  // ============================================================
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

// ============================================================
// NAVIGATION GUARDS
// ============================================================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Restore session on first navigation
  if (!authStore.loggedInUser && !from.name) {
    await authStore.restoreSession()
  }

  // Redirect authenticated users away from public home
  if (to.name === 'home' && authStore.isAuthenticated) {
    const redirectTo = authStore.isAdmin ? 'admin' : 'user'
    console.log(`🔀 Already authenticated. Redirecting to ${redirectTo}.`)
    next({ name: redirectTo })
    return
  }

  // Check authentication requirement
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🔀 Authentication required. Redirecting to home.')
    next({ name: 'home' })
    return
  }

  // Check admin requirement
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.log('🔀 Admin access required. Redirecting to user view.')
    next({ name: 'user' })
    return
  }

  // Allow navigation
  next()
})

export default router
