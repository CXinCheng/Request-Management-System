<template>
    <div v-if="request">
      <h1 class="text-xl font-bold">Request Details</h1>
      <p><strong>Status:</strong> {{ request.status }}</p>
      <p><strong>Created At:</strong> {{ formatDate(request.created_at) }}</p>
      <p><strong>Start Date:</strong> {{ formatDate(request.start_date_of_leave) }}</p>
      <p><strong>End Date:</strong> {{ formatDate(request.end_date_of_leave	) }}</p>
      <p><strong>Reason:</strong> {{ request.reason_of_leave }}</p>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import dayjs from "dayjs";
  
  export default {
    name: "RequestDetailsView",
    components: {
    },
    data() {
      return {
        studentId: '',
        request: null,
      };
    },
    mounted() {
        const requestId = this.$route.params.requestId; 
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            this.studentId = user['matrix_id'];
        }
        this.fetchRequest(requestId); // Fetch request on page load
    },
    methods: {
      async fetchRequest(requestId) {
        try {
          const response = await axios.get(`http://localhost:3002/api/v1/requests/student/${this.studentId}/${requestId}`);
          console.log(response.data)
          this.request = response.data;
        } catch (error) {
          console.error("Error fetching request:", error);
        }
      },
      formatDate(date) {
        return date ? dayjs(date).format("DD-MM-YYYY HH:mm:ss") : "-";
      },
    },
  };
  </script>
  