<template>
    <v-btn
        @click="deleteRequest"
        class="rounded text-subtitle-1 text-white bg-red-darken-1 mr-sm-2"
    >
        Delete
    </v-btn>
</template>

<script>
import axios from "axios";
import { requestApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

export default {
    props: {
        requestId: {
            type: [String, Number],
            required: true,
        },
        class_type: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            notificationStore: useNotificationStore(),
        };
    },
    mounted() {
        if (localStorage.getItem("user")) {
            let user = JSON.parse(localStorage.getItem("user"));
            this.studentId = user["matrix_id"];
            this.userRole = user["role"];
        }
    },
    methods: {
        async deleteRequest() {
            console.log("Delete Request button clicked, passing in:", this.requestId, this.class_type);
            try {
                await requestApiService.deleteRequest(this.requestId, this.class_type);
                if (this.$route.path === "/requests") {
                    this.$router.go(); // Refresh the current page
                } else {
                    this.$router.push("/requests");
                }
                this.notificationStore.showNotification({
                    color: "success",
                    message: "Request deleted successfully.",
                });
            } catch (error) {
                console.error("Error deleting request:", error);
                this.notificationStore.showNotification({
                    color: "error",
                    message: error.response?.data?.message || "Failed to delete request",
                });
            }
        },
    },
};
</script>
