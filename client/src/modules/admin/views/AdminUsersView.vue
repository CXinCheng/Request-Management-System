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
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            icon="mdi-pencil"
                            size="small"
                            color="primary"
                            class="mr-2"
                            @click="editUser(item)"
                        />
                        <v-btn
                            icon="mdi-delete"
                            size="small"
                            color="error"
                            @click="confirmDelete(item)"
                        />
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="text-h5"
                        >{{ isEdit ? "Edit" : "Add" }} User</span
                    >
                </v-card-title>
                <v-card-text>
                    <UserForm
                        :initial-data="formData"
                        :role-items="['Student', 'Professor', 'Admin']"
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
                                <v-btn color="primary" text type="submit"
                                    >Save</v-btn
                                >
                            </v-card-actions>
                        </template>
                    </UserForm>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="400px">
            <v-card>
                <v-card-title class="text-h5">Confirm Delete</v-card-title>
                <v-card-text>
                    Are you sure you want to delete this user?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="deleteDialog = false"
                        >Cancel</v-btn
                    >
                    <v-btn color="primary" text @click="handleDelete"
                        >Delete</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
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
const isEdit = ref(false);
const deleteDialog = ref(false);
const selectedUser = ref(null);
const formData = ref({
    name: "",
    matrix_id: "",
    email: "",
    role: "",
    password: "",
});

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
    {
        title: "Actions",
        key: "actions",
        align: "end",
        sortable: false,
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];

const editUser = (user) => {
    isEdit.value = true;
    formData.value = { ...user };
    dialog.value = true;
};

const confirmDelete = (user) => {
    selectedUser.value = user;
    deleteDialog.value = true;
};

const handleSave = async (userData) => {
    try {
        loading.value = true;
        const response = isEdit.value
            ? await userApiService.updateUser(userData)
            : await authApiService.register(userData);
        if (response.success) {
            await fetchUsers();
            dialog.value = false;
        } else {
            notificationStore.showNotification({
                message: response.message || "Error creating user",
                color: "error",
                timeout: 3000,
            });
        }
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        loading.value = false;
    }
};

const handleDelete = async () => {
    try {
        loading.value = true;
        const response = await userApiService.deleteUser(
            selectedUser.value.matrix_id
        );
        if (response.success) {
            await fetchUsers();
            deleteDialog.value = false;
        } else {
            notificationStore.showNotification({
                message: response.message || "Error deleting user",
                color: "error",
                timeout: 3000,
            });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
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
