import { createWebHistory, createRouter } from 'vue-router'

import AuthView from './modules/auth/views/AuthView.vue'
import DashboardView from './modules/dashboard/views/DashboardView.vue'
import RequestView from './modules/request/views/RequestFormView.vue'

const routes = [
  { path: '/', component: AuthView },
  { path: '/dashboard', component: DashboardView },
  { path: '/leave', component: RequestView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router