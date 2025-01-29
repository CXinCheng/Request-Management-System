<template>
    <div class="container">
      <v-data-table
        :headers="headers"
        :items="requests"
        class="striped outlined"
        item-value="id"
        dense
      >
        <template v-slot:top>
          <v-toolbar 
            flat 
            class="bg-white"
          >
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>
        </template>
      </v-data-table>
    </div>
  </template>
  
  <script>

  export default {
    components: {
    },
    data() {
      return {
        studentId: '',  // Replace with the actual student ID from local storage
        headers: [
          { title: 'Leave Start', key: 'start_date_of_leave' },
          { title: 'Leave End', key: 'end_date_of_leave' },
          { title: 'Submitted', key: 'created_at' },
          { title: 'Status', key: 'status' },
          { title: 'Approver', key: 'approver_name' }
        ],
        requests: [],
        search: '', // For search functionality
      };
    },
    mounted() {
      if (localStorage.getItem('user')) {
        let user = JSON.parse(localStorage.getItem('user'));
        this.studentId = user['matrix_id'];
      }
      this.fetchRequests();
    },
    methods: {
      fetchRequests() {
        // Make an API call to get the requests for the student
        fetch(`http://localhost:3002/api/v1/requests/student/${this.studentId}`)
          .then(response => response.json())
          .then(data => {
            this.requests = data;
          })
          .catch(error => {
            console.error('Error retrieving requests:', error);
          });
      },
    },
  };
  </script>
  
  <style scoped>

  </style>
  