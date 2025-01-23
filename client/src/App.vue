<template>
    <v-app class="rounded rounded-md">
        <Sidebar v-if="!isAuthRoute"></Sidebar>
        <Header v-if="!isAuthRoute" :title="pageTitle"></Header>
        <v-main
            class="d-flex align-center justify-center"
            style="min-height: 300px"
        >
            <router-view></router-view>
        </v-main>
        <Snackbar />
    </v-app>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import Snackbar from "./components/Snackbar.vue";

const route = useRoute();

const isAuthRoute = computed(() => {
    return ["/","/login", "/register", "/reset"].includes(route.path);
});

const pageTitle = computed(() => {
    if (route.path === "/dashboard") {
        const userData = localStorage.getItem("user");
        return `Welcome, ${JSON.parse(userData)?.name || "User"}`;
    }
    return route.meta?.title;
});
</script>
