<template>
    <v-container>
        <v-data-table
            :headers="headers"
            :items="requests"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            :item-class="hover - shadow"
            @click:row="seeRequestDetails"
            v-model="selected"
            class="striped outlined"
            item-value="id"
            fixed-header
            dense
        >
            <template v-slot:top>
                <v-toolbar flat class="bg-white">
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                </v-toolbar>
            </template>
            <template v-slot:item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
            </template>

            <template v-slot:item.start_date_of_leave="{ item }">
                {{ formatDate(item.start_date_of_leave) }}
            </template>

            <template v-slot:item.end_date_of_leave="{ item }">
                {{ formatDate(item.end_date_of_leave) }}
            </template>

            <template v-slot:item.actions="{ item }">
                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" small>mdi-dots-vertical</v-icon>
                    </template>
                    <v-list>
                        <v-list-item clickable @click:item="seeRequestDetails">
                            <v-list-item-title>View Details</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            clickable
                            @click:item="editRequest"
                            v-if="userRole === 'Student'"
                        >
                            <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            clickable
                            @click:item="deleteRequest"
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
import axios from "axios";
import dayjs from "dayjs";

export default {
    components: {},
    data() {
        return {
            studentId: "", // Replace with the actual student ID from local storage
            userRole: "unknown",
            headers: [
                { title: "Leave Start", key: "start_date_of_leave" },
                { title: "Leave End", key: "end_date_of_leave" },
                { title: "Submitted", key: "created_at" },
                { title: "Status", key: "status" },
                { title: "Module", key: "module_code" },
                { title: "Approver", key: "approver_name" },
                { title: "Actions", key: "actions", sortable: false },
            ],
            requests: [],
            search: "", // For search functionality
            selectedItem: false,
        };
    },
    mounted() {
        if (localStorage.getItem("user")) {
            let user = JSON.parse(localStorage.getItem("user"));
            this.studentId = user["matrix_id"];
            this.userRole = user["role"];
        }
        this.fetchRequests();
    },
    methods: {
        async fetchRequests() {
            try {
                const response = await axios.get(
                    `http://localhost:3002/api/v1/requests/student/${this.studentId}`
                );
                this.requests = response.data;
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        },
        formatDate(date) {
            return date ? dayjs(date).format("DD-MM-YYYY HH:mm:ss") : "-";
        },
        seeRequestDetails(event, { item }) {
            this.$router.push({
                name: "RequestDetailsView",
                params: {
                    requestId: item.id,
                },
            });
        },
        async editRequest(event, { item }) {
            this.$router.push({
                name: "RequestDetailsView",
                params: {
                    requestId: item.id,
                },
            });
        },
        async deleteRequest(event, { item }) {
            console.log("Delete Request button clicked");
            try {
                await axios.delete(
                    `http://localhost:3002/api/v1/requests/student/${item.id}`
                );
                this.$router.push("/requests"); // redirect to Request List page after deletion
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        },
    },
};
</script>

<style scoped>
:deep(th span) {
    font-weight: bold !important;
}
:deep(tr hover) {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Shadow effect */
    transition: box-shadow 0.01s ease-in-out;
    cursor: pointer;
}
</style>
