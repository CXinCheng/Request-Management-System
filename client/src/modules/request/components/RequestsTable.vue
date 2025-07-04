<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="requests"
      :search="search"
      :items-per-page="10"
      v-model:sort-by="sortBy"
      @click:row="seeRequestDetails"
      class="striped outlined elevation-1"
      item-value="id"
      fixed-header
      dense
    >
      <template v-slot:top>
        <v-toolbar flat class="bg-primary">
          <v-toolbar-title class="white--text">Leave Requests</v-toolbar-title>
          <v-text-field
            v-model="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            v-if="userRole === 'Professor'"
            color="white"
            variant="text"
            :loading="downloading"
            @click="downloadRequests"
            class="download-btn"
          >
            <v-icon start>mdi-file-download</v-icon>
            Download CSV
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.start_date_of_leave="{ item }">
        {{ formatDate(item.start_date_of_leave) }}
      </template>

      <template v-slot:item.end_date_of_leave="{ item }">
        {{ formatDate(item.end_date_of_leave) }}
      </template>

      <template v-slot:item.created_at="{ item }">
        {{ formatCreatedDate(item.created_at) }}
      </template>

      <template v-slot:item.status="{ item }">
        <StatusPill :status="item.status" />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" small>mdi-dots-vertical</v-icon>
          </template>
          <v-list>
            <v-list-item
              clickable
              @click="seeRequestDetails(1, { item })"
            >
              <v-list-item-title>View Details</v-list-item-title>
            </v-list-item>
            <!-- <v-list-item
                clickable
                @click="editRequest(item)"
                v-if="userRole === 'Student' && item.status === 'Pending'"
            >
                <v-list-item-title>Edit</v-list-item-title>
            </v-list-item> -->
            <v-list-item
              clickable
              @click="openDeleteDialog(item)"
              v-if="userRole === 'Student' && item.status === 'Pending'"
            >
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <DeleteConfirmationDialog
            v-model="showDeleteDialog"
            title="Confirm Delete"
            message="Are you sure you want to delete this request?"
        >
            <template #confirm>
              <DeleteRequestButton :requestId="deleteRequestId" :class_type="deleteClassType" @deleted="showDeleteDialog = false" />
            </template>
        </DeleteConfirmationDialog>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
import { requestApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { saveAs } from "file-saver";
import StatusPill from "./StatusPill.vue";
import DeleteRequestButton from '../components/DeleteRequestButton.vue';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog.vue';

export default {
  components: {
    StatusPill,
    DeleteConfirmationDialog,
    DeleteRequestButton,
  },
  data() {
    return {
      userId: "", // Replace with the actual student ID from local storage
      userRole: "unknown",
      headers: [
        { title: "Leave Start", value: "start_date_of_leave" },
        { title: "Leave End", value: "end_date_of_leave" },
        { title: "Submitted At", value: "created_at" },
        { title: "Status", value: "status" },
        { title: "Module", value: "module_code" },
        { title: "Class Type", value: "class_type" },
        { title: "Actions", value: "actions", sortable: false },
      ],
      requests: [],
      search: "", // For search functionality
      selectedItem: false,
      sortBy: [{ key: 'created_at', order:'desc'}],
      notificationStore: useNotificationStore(),
      showDeleteDialog: false,
      deleteRequestId: null,
      deleteClassType: null,
      downloading: false, 
    };
  },
  mounted() {
    if (localStorage.getItem("user")) {
      let user = JSON.parse(localStorage.getItem("user"));
      this.userId = user["matrix_id"];
      this.userRole = user["role"];
    }
    this.fetchRequests(); // Fetch requests on page load
  },
  methods: {
    async fetchRequests() {
      try {
        let response = null;
        if (this.userRole === "Student") {
          response = await requestApiService.getAllRequestsByStudent(this.userId);
        }
        else if (this.userRole === "Professor") {
          response = await requestApiService.getAllRequestsByProfessor(this.userId);
        }
        this.requests = response.data;
      } catch (error) {
        console.error("Error fetching requests on RequestsTable page:", error);
        this.notificationStore.showNotification({
          message: error.response?.data?.message || "Failed to fetch requests",
          color: "error",
        });

      }
    },
    formatDate(date) {
      return date ? dayjs(date).format("DD MMM YYYY") : "-";
    },
    formatCreatedDate(date) {
      return date ? dayjs(date).format("DD MMM YYYY, HH:mm:ss") : "-";
    },
    seeRequestDetails(event, { item }) {
      console.log("Item clicked:", item);
      if (!item) return; // Prevent errors
      console.log("item.class_type:", item.class_type)
      this.$router.push({
        name: "RequestDetailsView",
        params: {
          requestId: item.id,
          module_code: item.module_code,
          class_type: item.class_type,
        },
      });
    },
    // editRequest(item) {
    //     this.$router.push({
    //         name: "EditRequestView",
    //         params: { 
    //             requestId: item.id, 
    //             module_code: item.module_code,
    //             request: JSON.stringify(item) 
    //         },
    //     });
    // },
    openDeleteDialog(item) {
      this.deleteRequestId = item.id;
      this.deleteClassType = item.class_type;
      this.showDeleteDialog = true;
    },
    async downloadRequests() {
      if (this.userRole !== "Professor") return;

      try {
        this.downloading = true;

        // Fetch detailed request data using the API
        const response =
          await requestApiService.getAllRequestsDetailsByProfessor(
            this.userId
          );

        if (!response || !response.success || !response.data) {
          throw new Error("Failed to fetch request details");
        }

        const requestsData = response.data;

        // Create CSV content
        let csvContent =
          "Request ID,Status,Module Code,Student Matrix ID,Student Name,Student Email,Request Date,Start Date,End Date,Reason,Attachment URL\n";

        requestsData.forEach((request) => {
          // Format dates
          const requestDate = request.request_date
            ? dayjs(request.request_date).format("YYYY-MM-DD HH:mm:ss")
            : "";
          const startDate = request.start_date
            ? dayjs(request.start_date).format("YYYY-MM-DD")
            : "";
          const endDate = request.end_date
            ? dayjs(request.end_date).format("YYYY-MM-DD")
            : "";

          // Escape fields to handle commas, quotes, and newlines in the data
          const escapeField = (field) => {
            if (field === null || field === undefined) return "";
            const stringField = String(field);
            if (
              stringField.includes(",") ||
              stringField.includes('"') ||
              stringField.includes("\n")
            ) {
              return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
          };

          // Add row to CSV
          csvContent +=
            [
              escapeField(request.id),
              escapeField(request.status),
              escapeField(request.module_code),
              escapeField(request.matrix_id),
              escapeField(request.user_name),
              escapeField(request.email),
              escapeField(requestDate),
              escapeField(startDate),
              escapeField(endDate),
              escapeField(request.reason),
              escapeField(request.attachment_url),
            ].join(",") + "\n";
        });

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const filename = `leave_requests_${dayjs().format("YYYY-MM-DD")}.csv`;
        saveAs(blob, filename);
      } catch (error) {
        console.error("Error downloading requests:", error);
        alert("Failed to download requests. Please try again.");
      } finally {
        this.downloading = false;
      }
    }
  },
};
</script>

<style scoped>
:deep(th) {
  font-weight: bold !important;
  text-align: center !important;
  background-color: #1867c0 !important; /* Dark blue header */
  color: white !important;
}

:deep(tr:hover) {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Shadow effect */
    transition: box-shadow 0.01s ease-in-out;
    cursor: pointer;
}
</style>
