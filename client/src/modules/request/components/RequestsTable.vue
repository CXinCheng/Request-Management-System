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
                <span class="status-pill" :class="item.status?.toLowerCase()">
                  {{ item.status }}
                </span>
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
                        <v-list-item
                            clickable
                            @click="editRequest(item)"
                            v-if="userRole === 'Student' && item.status === 'Pending'"
                        >
                            <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            clickable
                            @click="deleteRequest(item)"
                            v-if="userRole === 'Student' && item.status === 'Pending'"
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

export default {
    components: {},
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
                { title: "Actions", value: "actions", sortable: false },
            ],
            requests: [],
            search: "", // For search functionality
            selectedItem: false,
            sortBy: [{ key: 'created_at', order:'desc'}],
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
                    response = await requestApiService.getRequestsByStudent(this.userId);
                }
                else if (this.userRole === "Professor") {
                    response = await requestApiService.getRequestsByProfessor(this.userId);
                }
                this.requests = response.data;
                
            } catch (error) {
                console.error("Error fetching requests on RequestsTable page:", error);
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
            this.$router.push({
                name: "RequestDetailsView",
                params: {
                    requestId: item.id,
                    module_code: item.module_code,
                },
            });
        },
        editRequest(item) {
            this.$router.push(`/editRequest/${this.requestId}`);
        },
        async deleteRequest(item) {
            console.log("Delete Request button clicked");
            try {
                await requestApiService.deleteRequest(item.id);
                this.$router.push("/requests"); // redirect to Request List page after deletion
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        },
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

.status-pill {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 999px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
  background-color: #bdbdbd;
  text-transform: capitalize;
}
.status-pill.approved {
  background-color: #5acc5f;
}
.status-pill.pending {
  background-color: #5d90ff;
}
.status-pill.rejected {
  background-color: #ff4b48;
}
</style>

