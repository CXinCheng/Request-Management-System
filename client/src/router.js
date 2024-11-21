import { createMemoryHistory, createRouter } from 'vue-router'

import AuthView from './modules/auth/views/AuthView.vue'
import DashboardView from './modules/dashboard/views/DashboardView.vue'
import RequestView from './modules/request/views/RequestFormView.vue'

const routes = [
  //{ path: '/', component: AuthView },
  //{ path: '/', component: DashboardView },
  { path: '/', component: RequestView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router