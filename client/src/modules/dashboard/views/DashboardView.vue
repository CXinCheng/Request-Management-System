<template>
  <div class="dashboard-container">
    <div class="main-content">
      <!-- Enrolled Modules Section -->
      <EnrolledModules :modules="modules" />

      <!-- Leave Application Section -->
      <RequestsTable/>
      
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import EnrolledModules from "../components/EnrolledModules.vue";
import LeaveApplication from "../components/LeaveApplication.vue";
import { aggregateDashboardData } from "../utils/DataAggregator";
import RequestsTable from "@/modules/request/components/RequestsTable.vue";

export default {
  name: "DashboardView",
  components: {
    EnrolledModules,    
    RequestsTable
  },
  setup() {
    const route = useRoute();
    const modules = ref([]);
    const leaveData = ref([]);
    let user = JSON.parse(localStorage.getItem('user'));
    const userId = user['matrix_id'];

    const fetchDashboardData = async () => {
      if (!userId) {
        console.error("User ID is missing from local storage.");
        return;
      }

      try {
        const { modules: moduleData, leaveData: leaveAppData } =
          await aggregateDashboardData(userId);
        modules.value = moduleData;
        leaveData.value = leaveAppData;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    // Fetch data on component mount
    onMounted(fetchDashboardData);

    return { modules, leaveData, route };
  },
};
</script>


<style scoped>
.dashboard-container {
  padding: 16px;
}
</style>
