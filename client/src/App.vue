<template>
    <v-app class="rounded rounded-md">
        <Sidebar v-if="!isAuthRoute"></Sidebar>
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

const route = useRoute();
const isAuthRoute = computed(() => {
    return ['/login', '/register'].includes(route.path);
});

</script>