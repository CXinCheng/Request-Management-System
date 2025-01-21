<template>
    <v-container>
        <v-card>
            <v-card-text>
                <v-row>
                    <v-col cols="4">
                        <v-text-field
                            v-model="search"
                            label="Search"
                            prepend-inner-icon="mdi-magnify"
                            density="comfortable"
                            hide-details
                        />
                    </v-col>
                    <v-col cols="2">
                        <v-select
                            v-model="roleFilter"
                            :items="['All', 'Student', 'Professor', 'Admin']"
                            label="Role"
                            density="comfortable"
                            hide-details
                        />
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="2">
                        <v-btn color="primary" @click=""> Add User </v-btn>
                    </v-col>
                </v-row>

                <v-data-table
                    :headers="headers"
                    :items="filteredUsers"
                    :search="search"
                    :loading="loading"
                >
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userApiService } from "@/utils/ApiService";

const search = ref("");
const roleFilter = ref("All");
const loading = ref(false);
const users = ref([]);

const headers = [
    { title: "Name", key: "name" },
    { title: "Matrix ID", key: "matrix_id" },
    { title: "Email", key: "email" },
    { title: "Role", key: "role" },
];

const filteredUsers = computed(() => {
    if (roleFilter.value === "All") return users.value;
    return users.value.filter((user) => user.role === roleFilter.value);
});

const fetchUsers = async () => {
    try {
        loading.value = true;
        const response = await userApiService.getAllUsers();
        if (response.success) {
            users.value = response.data;
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.v-data-table {
    margin-top: 1rem;
}
</style>
