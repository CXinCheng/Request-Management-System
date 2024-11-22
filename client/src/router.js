import { createWebHistory, createRouter } from 'vue-router'

import AuthView from './modules/auth/views/AuthView.vue'
import DashboardView from './modules/dashboard/views/DashboardView.vue'
import RequestView from './modules/request/views/RequestView.vue'
import LeaveModuleSelection from './modules/request/views/LeaveModuleSelection.vue'
import RequestListView from './modules/request/views/RequestListView.vue'

const routes = [
  { path: '/', component: AuthView, name: 'AuthView' },
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