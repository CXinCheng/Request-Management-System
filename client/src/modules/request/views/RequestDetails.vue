<template>
    <div v-if="request">
      <button @click="goBack" class="back-button">
        <v-icon>mdi-arrow-left</v-icon> Back
      </button>
      <h1 class="text-xl font-bold">Request Details</h1>
      <hr>
      <p><strong>Status:</strong> {{ request.status }}</p>
      <p><strong>Created At:</strong> {{ formatDate(request.created_at) }}</p>
      <p><strong>Last modified:</strong> {{ formatDate(request.modified_at) }}</p>
      <p><strong>Dates of request:</strong> {{ formatDate(request.start_date_of_leave) }} - {{ formatDate(request.end_date_of_leave) }}</p>
      <p><strong>Module:</strong> {{ request.module_code }}</p>
      <p><strong>Reason:</strong> {{ request.reason_of_leave }}</p>
      
      <div v-if="userRole === 'Student'">
        <EditRequestButton />
        <DeleteRequestButton />
      </div>
      <div v-else-if="userRole === 'Professor'">
        <StatusButton :requestId="request.id" actionType="Approve" @status-updated="handleStatusUpdate" />
        <StatusButton :requestId="request.id" actionType="Reject" @status-updated="handleStatusUpdate" />
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
</template>
  
  <script>
  import axios from "axios";
  import dayjs from "dayjs";
  import EditRequestButton from '../components/EditRequestButton.vue';
  import DeleteRequestButton from '../components/DeleteRequestButton.vue';
  import StatusButton from '../components/StatusButton.vue';
  
  export default {
    name: "RequestDetailsView",
    components: {
        EditRequestButton,
        DeleteRequestButton,
        StatusButton
    },
    data() {
      return {
        studentId: '',
        userRole: 'unknown',
        requestId: '',
        request: null,
      };
    },
    mounted() {
        this.requestId = this.$route.params.requestId; 
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            this.studentId = user['matrix_id'];
            this.userRole = user['role']
        }
        this.fetchRequest(); // Fetch request on page load
    },
    methods: {
      async fetchRequest() {
        try {
          const response = await axios.get(`http://localhost:3002/api/v1/requests/student/${this.studentId}/${this.requestId}`);
          this.request = response.data;
        } catch (error) {
          console.error("Error fetching request:", error);
        }
      },
      formatDate(date) {
        return date ? dayjs(date).format("DD MMM YYYY, HH:mm:ss") : "-";
      },
      goBack() {
        this.$router.push({ name: 'RequestListView' });
      },
    },
  };
  </script>

  <style scoped>
  .back-button {
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
  }
  </style>

