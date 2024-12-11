import { createWebHistory, createRouter } from "vue-router";

import LoginView from "./modules/auth/views/LoginView.vue";
import RegisterView from "./modules/auth/views/RegisterView.vue";
import DashboardView from "./modules/dashboard/views/DashboardView.vue";
import RequestView from "./modules/request/views/RequestView.vue";
import LeaveModuleSelection from "./modules/request/views/LeaveModuleSelection.vue";
import RequestListView from "./modules/request/views/RequestListView.vue";

const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

const routes = [
    {
        path: "/",
        component: DashboardView,
        name: "Dashboard",
        meta: { requiresAuth: true },
    },
    {
        path: "/login",
        component: LoginView,
        name: "Login",
        meta: { requiresAuth: false },
    },
    {
        path: "/register",
        component: RegisterView,
        meta: { requiresAuth: false },
    },
    {
        path: "/dashboard",
        component: DashboardView,
        name: "Dashboard",
        meta: { requiresAuth: true },
    },
    {
        path: "/leave",
        component: LeaveModuleSelection,
        name: "LeaveModuleSelection",
        meta: { requiresAuth: true , title: "Leave Application"},
    },
    {
        path: "/leaveDetails",
        component: RequestView,
        name: "RequestView",
        meta: { requiresAuth: true, title: "Request Details" },
    },
    {
        path: "/requests",
        component: RequestListView,
        name: "RequestListView",
        meta: { requiresAuth: true, title: "Request List" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isLoggedIn = isAuthenticated();

    if (requiresAuth && !isLoggedIn) {
        next({ name: 'Login', query: { redirect: to.fullPath },});
    } else {
        next();
    }
});

export default router;
