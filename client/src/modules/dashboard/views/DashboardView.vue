<template>
  <div class="dashboard-container">
    <div class="main-content">
      <!-- Enrolled Modules Section -->
      <EnrolledModules :modules="modules" />

      <!-- Leave Application Section -->
      <LeaveApplication :leave-data="leaveData" />
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import EnrolledModules from "../components/EnrolledModules.vue";
import LeaveApplication from "../components/LeaveApplication.vue";
import { aggregateDashboardData } from "../utils/DataAggregator";

export default {
  name: "DashboardView",
  components: {
    EnrolledModules,
    LeaveApplication,
  },
  setup() {
    const route = useRoute();
    const modules = ref([]); // Module data for EnrolledModules
    const leaveData = ref([]); // Leave application data for LeaveApplication

    const fetchDashboardData = async () => {
      try {
        // Fetch aggregated data for the dashboard
        const { modules: moduleData, leaveData: leaveAppData } =
          await aggregateDashboardData();
        modules.value = moduleData;
        leaveData.value = leaveAppData;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    // Fetch data when the component mounts
    onMounted(fetchDashboardData);

    return { modules, leaveData , route};
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}
</style>
