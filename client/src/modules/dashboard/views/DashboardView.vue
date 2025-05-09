<template>
  <div class="dashboard-container">
    <div class="main-content">
      <!-- Enrolled Modules Section -->
      <EnrolledModules :modules="modules" />

      <!-- Leave Application Section -->
      <div class="leave-application-container">
        <h2 class="section-title">Leave Applications</h2>
        <RequestsTable/>
      </div>
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
  width: 80%;
}

/* Leave Application Section Styling */
.leave-application-container {
  max-width: 95%;
  margin: auto;
  padding: 24px;
  background-color: #e3f2fd; /* Light blue background */
  border-radius: 12px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
}

/* Section Title */
.section-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #0d47a1; /* Deep blue */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
