<template>
    <v-container>
        <v-card>
            <v-card-title>API Test</v-card-title>
            <v-card-text>
                <v-btn color="primary" @click="testApiCall" :loading="loading">
                    Test API
                </v-btn>

                <div class="mt-4" v-if="response">
                    <pre>{{ response }}</pre>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from "vue";
import { moduleApiService, userApiService } from "./utils/ApiService";

const loading = ref(false);
const response = ref(null);
const students = ref([]);

async function testApiCall() {
    try {
        loading.value = true;
        response.value = null;
        
        const res = await moduleApiService.getModulesByProfessor("P0123456A");
        let count = 0;
        res.data.forEach(async (module) => {
            console.log("module:", module, "count:", count++);
            const response = userApiService.getAllUsers();
            console.log("module:", module, "response:", response);
        });
        response.value = res.data;
    } catch (error) {
        console.error("API call failed:", error);
        response.value = "Request failed.";
    } finally {
        loading.value = false;
    }
}
</script>
