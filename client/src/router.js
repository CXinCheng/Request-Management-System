import { createWebHistory, createRouter } from "vue-router";

import LoginView from "./modules/auth/views/LoginView.vue";
import RegisterView from "./modules/auth/views/RegisterView.vue";
import ResetView from "./modules/auth/views/ResetView.vue";
import DashboardView from "./modules/dashboard/views/DashboardView.vue";
import RequestView from "./modules/request/views/RequestView.vue";
import LeaveModuleSelection from "./modules/request/views/LeaveModuleSelection.vue";
import RequestListView from "./modules/request/views/RequestList.vue";
import RequestDetailsView from "./modules/request/views/RequestDetails.vue";
import EditRequestView from "./modules/request/views/EditRequest.vue";
import AdminUsersView from "./modules/admin/views/AdminUsersView.vue";
import AdminModuleView from "./modules/admin/views/AdminModuleView.vue";

const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp < Date.now() / 1000) {
            localStorage.removeItem("token");
            return false;
        }
        return true;
    } catch {
        localStorage.removeItem("token");
        return false;
    }
};

const routes = [
    {
        path: "/",
        redirect: '/dashboard',
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
        path: "/reset",
        component: ResetView,
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
    {
        path: "/admin/users",
        component: AdminUsersView,
        name: "AdminUsersView",
        meta: { requiresAuth: true, title: "Users" },
    },
    {
        path: "/admin/modules",
        component: AdminModuleView,
        name: "AdminModuleView",
        meta: { requiresAuth: true, title: "Modules" },
    },
    {
        path: "/requestDetails/:requestId",
        component: RequestDetailsView,
        name: "RequestDetailsView",
        meta: { requiresAuth: true, title: "Request Details" },
    },
    {
        path: "/editRequest/:requestId",
        component: EditRequestView,
        name: "EditRequestView",
        meta: { requiresAuth: true, title: "Edit Request" },
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
