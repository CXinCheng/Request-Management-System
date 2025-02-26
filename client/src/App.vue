<template>
    <v-app class="rounded rounded-md">
        <Sidebar v-if="!isAuthRoute" />

        <Header v-if="!isAuthRoute">
            <template #title>
                <div v-if="route.params.moduleCode">
                    <span
                        @click="goBack"
                        class="text-decoration-underline cursor-pointer text-blue"
                        >My Modules</span
                    >
                    <span> > {{ route.params.moduleCode }}</span>
                </div>
                <div v-else>
                    {{ pageTitle }}
                </div>
            </template>
        </Header>

        <v-main
            class="d-flex align-center justify-center"
            style="min-height: 300px"
        >
            <router-view />
        </v-main>

        <Snackbar />
    </v-app>
</template>

<script setup>
import { computed, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import Snackbar from "./components/Snackbar.vue";

const route = useRoute();
const router = useRouter();

const isAuthRoute = computed(() => {
    return ["/", "/login", "/register", "/reset", "/test"].includes(route.path);
});

const pageTitle = ref("");

watch(
    () => route.params,
    (params) => {
        if (route.path === "/dashboard") {
            const userData = localStorage.getItem("user");
            pageTitle.value = `Welcome, ${
                JSON.parse(userData)?.name || "User"
            }`;
        } else if (params.moduleCode) {
            pageTitle.value = `Module: ${params.moduleCode}`;
        } else {
            pageTitle.value = route.meta?.title || "";
        }
    },
    { immediate: true }
);

const goBack = () => {
    router.push({ name: "MyModuleView" });
};
</script>
