<template>
    <div class="container">
      <h1>Requests for Student {{ studentId }}</h1>
      <v-data-table
        :headers="headers"
        :items="requests"
        class="elevation-1"
        item-value="id"
        dense
        hide-default-footer
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Requests</v-toolbar-title>
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

      <!-- <DataTable :data="requests" :columns="columns" :options="options" class="display" /> -->

      <!-- <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Student ID</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.user_id }}</td>
            <td>{{ request.reason_of_leave }}</td>
          </tr>
        </tbody>
      </table> -->
    </div>
  </template>
  
  <script>
  import DataTable from 'datatables.net-vue3';
  import DataTablesCore from 'datatables.net-dt';
  import 'datatables.net-select-dt';
  import 'datatables.net-responsive-dt';
  
  DataTable.use(DataTablesCore);

  export default {
    components: {
      DataTable,
    },
    data() {
      return {
        studentId: '3',  // Replace with the actual student ID
        requests: [],
        columns: [
          { title: "Request ID", data: "id" },
          { title: "Student ID", data: "user_id" },
          { title: "Reason", data: "reason_of_leave" },
          { title: "Date Submitted", data: "date_of_request" },
        ],
        options: {
          responsive: true,
          select: true,
        }
      };
    },
    mounted() {
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
  