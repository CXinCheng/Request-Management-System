import { createMemoryHistory, createRouter } from 'vue-router'

import LoginView from './modules/auth/views/LoginView.vue'
import RegisterView from './modules/auth/views/RegisterView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router