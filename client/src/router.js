import { createMemoryHistory, createRouter } from 'vue-router'

import AuthView from './modules/auth/views/AuthView.vue'

const routes = [
  { path: '/', component: AuthView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router