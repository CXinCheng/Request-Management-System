<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="filteredRequests"
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

      <template v-slot:item.actions="{ item }">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" small>mdi-dots-vertical</v-icon>
          </template>
          <v-list>
            <v-list-item clickable @click="seeRequestDetails(1, { item })">
              <v-list-item-title>View Details</v-list-item-title>
            </v-list-item>
            <v-list-item
              clickable
              @click="editRequest(item)"
              v-if="userRole === 'Student'"
            >
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item
              clickable
              @click="deleteRequest(item)"
              v-if="userRole === 'Student'"
            >
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
import { requestApiService } from "@/utils/ApiService";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { saveAs } from "file-saver";

export default {
  props: {
    moduleFilter: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const router = useRouter();
    const userId = ref("");
    const userRole = ref("unknown");
    const requests = ref([]);
    const search = ref("");
    const sortBy = ref([{ key: "created_at", order: "desc" }]);
    const downloading = ref(false);

    // Set initial search value based on moduleFilter prop
    if (props.moduleFilter) {
      search.value = props.moduleFilter;
    }

    const headers = [
      { title: "Leave Start", value: "start_date_of_leave" },
      { title: "Leave End", value: "end_date_of_leave" },
      { title: "Submitted At", value: "created_at" },
      { title: "Status", value: "status" },
      { title: "Module", value: "module_code" },
      { title: "Actions", value: "actions", sortable: false },
    ];

    // Compute filtered requests based on props
    const filteredRequests = computed(() => {
      let result = [...requests.value];

      if (props.moduleFilter) {
        result = result.filter(
          (request) => request.module_code === props.moduleFilter
        );
      }

      return result;
    });

    watch(
      () => props.moduleFilter,
      (newValue) => {
        search.value = newValue || "";
      }
    );

    const fetchRequests = async () => {
      try {
        if (localStorage.getItem("user")) {
          let user = JSON.parse(localStorage.getItem("user"));
          userId.value = user["matrix_id"];
          userRole.value = user["role"];
        }

        let response = null;
        if (userRole.value === "Student") {
          response = await requestApiService.getRequestsByStudent(userId.value);
        } else if (userRole.value === "Professor") {
          response = await requestApiService.getRequestsByProfessor(
            userId.value
          );
        }

        if (response && response.data) {
          requests.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    const formatDate = (date) => {
      return date ? dayjs(date).format("DD MMM YYYY") : "-";
    };

    const formatCreatedDate = (date) => {
      return date ? dayjs(date).format("DD MMM YYYY, HH:mm:ss") : "-";
    };

    const seeRequestDetails = (event, { item }) => {
      if (!item) return;
      router.push({
        name: "RequestDetailsView",
        params: {
          requestId: item.id,
          module_code: item.module_code,
        },
      });
    };

    const downloadRequests = async () => {
      if (userRole.value !== "Professor") return;

      try {
        downloading.value = true;

        // Fetch detailed request data using the API
        const response =
          await requestApiService.getAllRequestsDetailsByProfessor(
            userId.value
          );

        if (!response || !response.success || !response.data) {
          throw new Error("Failed to fetch request details");
        }

        const requestsData = response.data;

        // Create CSV content
        let csvContent =
          "Request ID,Status,Module Code,Student Name,Student Email,Request Date,Start Date,End Date,Reason,Attachment URL\n";

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
        downloading.value = false;
      }
    };

    fetchRequests();

    return {
      userId,
      userRole,
      headers,
      requests,
      search,
      sortBy,
      filteredRequests,
      formatDate,
      formatCreatedDate,
      seeRequestDetails,
      downloadRequests,
      downloading,
    };
  },

  data() {
    return {
      selectedItem: false,
    };
  },
  methods: {
    async deleteRequest(item) {
      console.log("Delete Request button clicked");
      try {
        await requestApiService.deleteRequest(item.id);
        this.$router.push("/requests"); // redirect to Request List page after deletion
        this.fetchRequests();
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    },
    editRequest(item) {
      this.$router.push(`/editRequest/${item.id}`);
    },
  },
};
</script>

<style scoped>
.v-data-table >>> th {
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
