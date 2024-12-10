<template>
    <div class="dashboard-container">
  
      <div class="main-content">
  
        <!-- Enrolled Modules Section -->
        <EnrolledModules />
  
        <!-- Leave Application Section -->
        <LeaveApplication />
      </div>
    </div>
  </template>
  
  <script>
  import { useRoute } from "vue-router";
  import EnrolledModules from "../components/EnrolledModules.vue";
  import LeaveApplication from "../components/LeaveApplication.vue";
  
  export default {
    name: "DashboardView",
    components: {
      EnrolledModules,
      LeaveApplication,
    },
    setup() {
      const route = useRoute();
      return { route };
    },
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    height: 100vh;
  }
  
  .main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background-color: #f9f9f9; /* Adjust background to match your design */
  }
  
  .main-content > * {
    margin-bottom: 16px; /* Add spacing between components */
  }
  </style>
  