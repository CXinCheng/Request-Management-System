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

export default {
    data() {
        return {
            requestId: Number,
        };
    },
    mounted() {
        this.requestId = this.$route.params.requestId;
        if (localStorage.getItem("user")) {
            let user = JSON.parse(localStorage.getItem("user"));
            this.studentId = user["matrix_id"];
            this.userRole = user["role"];
        }
    },
    methods: {
        async deleteRequest() {
            console.log("Delete Request button clicked");
            try {
                //   await axios.delete(`http://localhost:3002/api/v1/requests/student/${this.requestId}`);
                await requestApiService.deleteRequest(this.requestId);
                this.$router.push("/requests"); // redirect to Request List page after deletion
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        },
    },
};
</script>
