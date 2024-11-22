import { createWebHistory, createRouter } from 'vue-router'

import LoginView from './modules/auth/views/LoginView.vue'
import RegisterView from './modules/auth/views/RegisterView.vue'
import DashboardView from './modules/dashboard/views/DashboardView.vue'
import RequestView from './modules/request/views/RequestView.vue'
import LeaveModuleSelection from './modules/request/views/LeaveModuleSelection.vue'
import RequestListView from './modules/request/views/RequestListView.vue'

const routes = [
  { path: '/', component: DashboardView},
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', component: DashboardView, name: 'DashboardView' },
  { path: '/leave', component: LeaveModuleSelection, name: 'LeaveModuleSelection' },
  { path: '/leaveDetails', component: RequestView, name: 'RequestView' },
  { path: '/requests', component: RequestListView, name: 'RequestListView' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router