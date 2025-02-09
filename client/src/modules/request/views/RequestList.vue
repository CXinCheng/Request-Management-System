<template>
    <div class="requests-view-container">
        <div class="d-flex justify-space-between">
            <h1>Requests</h1>
            <create-request-button></create-request-button>
        </div>
        <!-- Requests Table -->
        <RequestsTable />
    </div>
  </template>
  
  <script>
    import { useRoute } from "vue-router";
    import CreateRequestButton from '../components/CreateRequestButton.vue';
    import RequestsTable from "../components/RequestsTable.vue";

    export default {
        name: "RequestListView",
        components: {
            CreateRequestButton,
            RequestsTable,
        },
        data() {
            return {
                username: '',  // Replace with the actual student ID
            };
        },
        setup() {
        const route = useRoute();
        return { route };
        },
    };
  </script>
  
  <style scoped>
    .requests-view-container {
        width: 80%;
    }
  </style>
  