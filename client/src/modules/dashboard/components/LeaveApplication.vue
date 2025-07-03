<template>
  <div class="leave-application-container">
    <h2 class="section-title">Leave Applications</h2>

    <v-container class="table-container" fluid>
      <v-data-table
        :headers="headers"
        :items="leaveData"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
        fixed-header
        dense
      >

        <template 
        v-slot:item.start_date_of_leave="{ item }">
          {{ formatDate(item.start_date) }}
        </template>

        <template 
        v-slot:item.end_date_of_leave="{ item }">
          {{ formatDate(item.end_date) }}
        </template>

        <template 
        v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" small>mdi-dots-vertical</v-icon>
            </template>
            <v-list>
              <v-list-item clickable @click="viewRequestDetails(item)">
                <v-list-item-title>View Details</v-list-item-title>
              </v-list-item>
              <!-- <v-list-item v-if="userRole === 'Student'" clickable @click="editRequest(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item> -->
              <v-list-item v-if="userRole === 'Student'" clickable @click="deleteRequest(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "LeaveApplication",
  props: {
    leaveData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      search: "",
      loading: false,
      userRole: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).role : "unknown",
      headers: [
        { title: "Leave Start", key: "start_date" },
        { title: "Leave End", key: "end_date" },
        { title: "Submitted", key: "created_at" },
        { title: "Status", key: "status" },
        { title: "Module", key: "module_code" },
        { title: "Approver", key: "approver_name" },
        { title: "Actions", key: "actions", sortable: false },
      ],
    };
  },
  methods: {
    formatDate(date) {
      return date ? dayjs(date).format("DD-MM-YYYY HH:mm:ss") : "-";
    },
    viewRequestDetails(item) {
      this.$router.push({ name: "RequestDetailsView", params: { requestId: item.id } });
    },
    // editRequest(item) {
    //   this.$router.push({ name: "EditRequestView", params: { requestId: item.id } });
    // },
    async deleteRequest(item) {
      console.log("Delete Request button clicked");
      try {
        await this.$axios.delete(`/api/requests/${item.id}`);
        this.$router.push("/requests");
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    },
  },
});
</script>

<style scoped>
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
  border-bottom: 3px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 10px;
}

/* Table Header - Bold & Centered */
:deep(th) {
  font-weight: bold;
  text-align: center !important;
  background-color: #1976d2 !important; /* Dark blue header */
  color: white !important;
}

/* Table Row Alternating Background Colors */
.row-light {
  background-color: #b8b8c2;
}

.row-dark {
  background-color: #4c5adf;
}

/* Center Text in All Cells */
.center-text {
  text-align: center !important;
}

/* Status Column - Bold & Color Adjustments */
.status-cell {
  font-weight: bold;
  text-transform: uppercase;
  color: #0d47a1; /* Deep Blue */
}

/* Actions Column Styling */
.actions-column {
  text-align: center;
}
</style>