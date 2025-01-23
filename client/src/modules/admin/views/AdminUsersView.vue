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
                        <v-btn color="primary" @click="dialog = true"
                            >Add User</v-btn
                        >
                    </v-col>
                    <v-dialog v-model="dialog" max-width="500px">
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">Add New User</span>
                            </v-card-title>

                            <v-card-text>
                                <UserForm
                                    :initial-data="formData"
                                    :role-items="[
                                        'Student',
                                        'Professor',
                                        'Admin',
                                    ]"
                                    :show-confirm-password="false"
                                    @submit="handleSave"
                                >
                                    <template v-slot:actions>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="error"
                                                text
                                                @click="dialog = false"
                                                >Cancel</v-btn
                                            >
                                            <v-btn
                                                color="primary"
                                                text
                                                type="submit"
                                                >Save</v-btn
                                            >
                                        </v-card-actions>
                                    </template>
                                </UserForm>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </v-row>

                <v-data-table
                    :headers="headers"
                    :items="filteredUsers"
                    :search="search"
                    :loading="loading"
                    :sort-by="[{ key: 'role', order: 'asc' }]"
                >
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import UserForm from "@/components/forms/UserForm.vue";
import { authApiService, userApiService } from "@/utils/ApiService";

const search = ref("");
const roleFilter = ref("All");
const loading = ref(false);
const users = ref([]);
const dialog = ref(false);

const headers = [
    {
        title: "Name",
        key: "name",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Matrix ID",
        key: "matrix_id",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Email",
        key: "email",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Role",
        key: "role",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];
const handleSave = async (userData) => {
    try {
        loading.value = true;
        const response = await authApiService.register(userData);
        if (response.success) {
            await fetchUsers();
            dialog.value = false;
        }
        else {
            notificationStore.showNotification({
                message: response.message || 'Error creating user',
                color: 'error',
                timeout: 3000
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        loading.value = false;
    }
};

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
