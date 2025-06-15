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
import AdminSemesterView from "./modules/admin/views/AdminSemesterView.vue"
import ProfileView from "./modules/user/ProfileView.vue";
import ModuleView from "./modules/module/ModuleView.vue";
import ProfDashboardView from "./modules/dashboard/views/ProfDashboardView.vue";

const getUserAuthInfo = () => {
    const token = localStorage.getItem("token");    
    if (!token) return { authenticated: false, role: null };

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp < Date.now() / 1000) {
            localStorage.removeItem("token");
            return { authenticated: false, role: null };
        }
        return { authenticated: true, role: payload.role };
    } catch {
        localStorage.removeItem("token");
        return { authenticated: false, role: null };
    }
};

const routes = [
    {
        path: "/",
        redirect: "/dashboard",
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
        meta: { requiresAuth: true,
            allowedRoles: ["Student"],
         },
    },
    {
        path: "/leave",
        component: LeaveModuleSelection,
        name: "LeaveModuleSelection",
        meta: { requiresAuth: true, title: "Leave Application",
            allowedRoles: ["Student"],
         },
    },
    {
        path: "/leaveDetails",
        component: RequestView,
        name: "RequestView",
        meta: { requiresAuth: true, title: "Request Details",
            allowedRoles: ["Student"],
         },
    },
    {
        path: "/requests",
        component: RequestListView,
        name: "RequestListView",
        meta: { requiresAuth: true, title: "Request List",
            allowedRoles: ["Student", "Professor"],
         },
    },
    {
        path: "/admin/users",
        component: AdminUsersView,
        name: "AdminUsersView",
        meta: { requiresAuth: true, title: "Users",
            allowedRoles: ["Admin"],
         },
    },
    {
        path: "/admin/modules",
        component: AdminModuleView,
        name: "AdminModuleView",
        meta: { requiresAuth: true, title: "Modules",
            allowedRoles: ["Admin"],
         },
    },
    {
        path: "/admin/Semester",
        component: AdminSemesterView,
        name: "AdminSemesterView",
        meta: { requiresAuth: true, title: "Semester" },
    },
    {
        path: "/requestDetails/:requestId/:module_code",
        component: RequestDetailsView,
        name: "RequestDetailsView",
        meta: { requiresAuth: true, title: "Request Details",
            allowedRoles: ["Student", "Professor"],
         },
    },
    {
        path: "/editRequest/:requestId",
        component: EditRequestView,
        name: "EditRequestView",
        meta: { requiresAuth: true, title: "Edit Request",
            allowedRoles: ["Student"],
         },
    },
    {
        path: "/profile",
        component: ProfileView,
        name: "ProfileView",
        meta: { requiresAuth: true, title: "Profile Settings" },
    },
    {
        path: "/professor/dashboard",
        component: ProfDashboardView,
        name: "ProfDashboardView",
        meta: { requiresAuth: true, title: "Dashboard",
            allowedRoles: ["Professor"],
         },
    },
    {
        path: "/professor/module/:moduleCode/:moduleName",
        component: ModuleView,
        name: "ModuleView",
        meta: { requiresAuth: true, title: "Module",
            allowedRoles: ["Professor"],
         },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const authInfo = getUserAuthInfo();
    const isLoggedIn = authInfo.authenticated;
    const userRole = authInfo.role;

    if (requiresAuth && !isLoggedIn) {
      return next({ 
        name: "Login", 
        query: { redirect: to.fullPath } 
      });
    }
  
    if (to.meta.allowedRoles && isLoggedIn) {
      if (!to.meta.allowedRoles.includes(userRole)) {
        if (userRole === "Student") {
          return next({ name: "Dashboard" });
        } else if (userRole === "Professor") {
          return next({ name: "ProfDashboardView" });
        } else if (userRole === "Admin") {
          return next({ name: "AdminUsersView" });
        } 
        // else {
        //   localStorage.removeItem("token");
        //   return next({ name: "Login" });
        // }
      }
    }
    next();
  });

export default router;
