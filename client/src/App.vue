<template>
    <v-app class="rounded rounded-md">
        <Sidebar></Sidebar>
        <v-main
            class="d-flex align-center justify-center"
            style="min-height: 300px"
        >
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script setup>
import Sidebar from "./components/Sidebar.vue";

</script>