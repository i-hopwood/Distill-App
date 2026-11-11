import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser, logout } from '@/services/authService'
import { isUserAllowed } from '@/services/accessService'

const baseRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/vHome.vue'),
    meta: { auth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Auth/vLogin.vue'),
    meta: { auth: false },
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: () => import('../views/vAccessDenied.vue'),
    meta: { auth: false },
  },
]

const routes = baseRoutes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(async (to) => {
  if (to.meta.auth) {
    const user = await getCurrentUser()
    if (!user) {
      return { name: 'login' }
    }

    const allowed = await isUserAllowed(user.uid)
    if (!allowed) {
      const deniedEmail = user.email
      await logout()
      return { name: 'access-denied', query: { email: deniedEmail } }
    }
  }
})

export default router
