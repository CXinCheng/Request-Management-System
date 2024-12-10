<template>
    <div class="requests-view-container">

        <div class="main-container">
            <!-- Requests Table -->
            <RequestsTable />
        </div>
    </div>
  </template>
  
  <script>
    import { useRoute } from "vue-router";
    import RequestsTable from "../components/RequestsTable.vue";

    export default {
        name: "DashboardView",
        components: {
        RequestsTable,
        },
        setup() {
        const route = useRoute();
        return { route };
        },
    };
  </script>
  
  <style scoped>
    .requests-view-container {
        display: flex;
        width: 100%;
    }

    .main-container {
        width: 100%;
        padding: 16px;
    }
  </style>
  