<template>
  <div class="leave-application-container">
    <h2>My Leave Applications</h2>

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

        <template v-slot:item.start_date_of_leave="{ item }">
          {{ formatDate(item.start_date) }}
        </template>

        <template v-slot:item.end_date_of_leave="{ item }">
          {{ formatDate(item.end_date) }}
        </template>

        <template v-slot:item.created_at="{ item }">
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
              <v-list-item v-if="userRole === 'Student'" clickable @click="editRequest(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
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
    editRequest(item) {
      this.$router.push({ name: "EditRequestView", params: { requestId: item.id } });
    },
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
.leave-application-container {
  padding: 16px;
  max-width: 90%;
  margin: auto;
}

.table-container {
  width: 100%;
  margin-top: 16px;
}

.v-data-table {
  font-size: 14px;
}

.v-toolbar {
  background-color: #8692ff;
}

</style>
