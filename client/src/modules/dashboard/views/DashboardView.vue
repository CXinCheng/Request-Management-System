<template>
    <div class="dashboard-container">
      <!-- Sidebar -->
      <Sidebar />
  
      <div class="main-content">
        <!-- Header -->
        <Header />
  
        <!-- Enrolled Modules Section -->
        <EnrolledModules />
  
        <!-- Leave Application Section -->
        <LeaveApplication />
      </div>
    </div>
  </template>
  
  <script>
  import { useRoute } from "vue-router";
  import Sidebar from "../../common/Sidebar.vue";
  import Header from "../components/Header.vue";
  import EnrolledModules from "../components/EnrolledModules.vue";
  import LeaveApplication from "../components/LeaveApplication.vue";
  
  export default {
    name: "DashboardView",
    components: {
      Sidebar,
      Header,
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
  