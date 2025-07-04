<template>
  <div class="details-container">
    <div v-if="request">
      <button @click="$router.back()" class="back-button">
        <v-icon>mdi-arrow-left</v-icon> Back
      </button>
      <br>
      <h1 class="text-xl font-bold">Request Details</h1>
      <hr>
      <br>

      <div v-if="userRole === 'Professor'">
        <DetailItem
          :title="'Requested By'"
          :value="request.user_name"
        />
        <DetailItem
          :title="'Student ID'"
          :value="request.user_id"
        />
      </div>
      
      <DetailItem
        :title="'Status'"
      >
        <template #value>
          <StatusPill :status="request.status" />
        </template>
      </DetailItem>
      <DetailItem
        :title="'Created At'"
        :value="formatDate(request.created_at)"
      />
      <DetailItem
        :title="'Last modified'"
        :value="formatDate(request.modified_at)"
      />
      <DetailItem
        :title="'Dates of request'"
        :value="`${formatDate(request.start_date_of_leave)} - ${formatDate(request.end_date_of_leave)}`"
      />
      <DetailItem
        :title="'Module Code'"
        :value="request.module_code"
      />
      <DetailItem
        :title="'Module Name'"
        :value="request.module_name"
      />
      <DetailItem
        :title="'Approver'"
        :value="request.approver_name"
        v-if="userRole === 'Student'"
      />
      <DetailItem
        :title="'Reason'"
        :value="request.reason_of_leave"
      />
      <DetailItem
        :title="'Attachment'"
        :value="request.blob_url"
      />
      
      <div v-if="userRole === 'Student' && request.status === 'Pending'">
        <!-- <EditRequestButton /> -->
        <DeleteRequestButton />
      </div>
      <div v-else-if="userRole === 'Professor'">
        <StatusButton :request="request" actionType="Approve" />
        <StatusButton :request="request" actionType="Reject" />
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>
  
<script>
  import axios from "axios";
  import dayjs from "dayjs";
  // import EditRequestButton from '../components/EditRequestButton.vue';
  import DeleteRequestButton from '../components/DeleteRequestButton.vue';
  import StatusButton from '../components/StatusButton.vue';
  import DetailItem from "../components/DetailItem.vue";
  import StatusPill from "../components/StatusPill.vue";
  import { requestApiService } from "@/utils/ApiService";
  import { useNotificationStore } from "@/utils/NotificationStore";
  
  export default {
    name: "RequestDetailsView",
    components: {
        // EditRequestButton,
        DeleteRequestButton,
        StatusButton,
        StatusPill,
        DetailItem
    },
    data() {
      return {
        userId: '',
        userRole: 'unknown',
        requestId: '',
        module_code: '',
        request: null,
        notificationStore: useNotificationStore(),
      };
    },
    mounted() {
        this.requestId = this.$route.params.requestId; 
        this.module_code = this.$route.params.module_code;
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            this.userId = user['matrix_id'];
            this.userRole = user['role']
        }
        this.fetchRequest(); // Fetch request on page load
    },
    methods: {
      async fetchRequest() {
        try {
          const response = await requestApiService.getRequestDetails(this.requestId, this.module_code);
          console.log("Response for RequestDetailsView:", response);
          this.request = response.data;
        } catch (error) {
          console.error("Error fetching request:", error);
          this.notificationStore.showNotification({
            color: "error",
            message: error.response?.data?.message || "Failed to fetch requests",
          });
        }
      },
      formatDate(date) {
        return date ? dayjs(date).format("DD MMM YYYY, HH:mm:ss") : "-";
      },
    },
  };
</script>

<style scoped>
  .details-container {
    padding: 16px;
    width: 80%;
  }

  .back-button {
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
  }
  
</style>

