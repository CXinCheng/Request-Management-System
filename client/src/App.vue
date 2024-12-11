<template>
    <v-app class="rounded rounded-md">
        <Sidebar v-if="!isAuthRoute"></Sidebar>
        <Header :title="pageTitle"></Header>
        <v-main
            class="d-flex align-center justify-center"
            style="min-height: 300px"
        >
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";

const route = useRoute();
const isAuthRoute = computed(() => {
    return ['/login', '/register'].includes(route.path);
});

const pageTitle = computed(() => {
    if (route.path === '/' || route.path === '/dashboard') {
        const userData = localStorage.getItem('user');
        return `Welcome, ${JSON.parse(userData)?.name || 'User'}`;
    }
    return route.meta?.title;
});

</script>