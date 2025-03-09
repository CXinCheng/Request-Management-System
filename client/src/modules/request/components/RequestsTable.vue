<template>
    <v-container>
        <v-data-table
            :headers="headers"
            :items="requests"
            :search="search"
            :items-per-page="10"
            v-model:sort-by="sortBy"
            @click:row="seeRequestDetails"
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
                        <v-list-item 
                            clickable 
                            @click="seeRequestDetails(1, { item })"
                        >
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
import axios from "axios";
import dayjs from "dayjs";

export default {
    components: {},
    data() {
        return {
            studentId: "", // Replace with the actual student ID from local storage
            userRole: "unknown",
            headers: [
                { title: "Leave Start", value: "start_date_of_leave" },
                { title: "Leave End", value: "end_date_of_leave" },
                { title: "Submitted", value: "created_at" },
                { title: "Status", value: "status" },
                { title: "Module", value: "module_code" },
                { title: "Approver", value: "approver_name" },
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
            console.log("Item clicked:", item);
            if (!item) return; // Prevent errors
            this.$router.push({
                name: "RequestDetailsView",
                params: {
                    requestId: item.id,
                },
            });
        },
        editRequest(item) {
            this.$router.push(`/editRequest/${this.requestId}`);
        },
        async deleteRequest(item) {
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

:deep(tr:hover) {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Shadow effect */
    transition: box-shadow 0.01s ease-in-out;
    cursor: pointer;
}
</style>
