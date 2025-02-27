<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h5 mb-4"> My Modules </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="modules"
                    :loading="loading"
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            color="primary"
                            size="small"
                            icon="mdi-eye"
                            @click="viewModule(item.code)"
                        >
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { gatewayApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";
import { useRouter } from "vue-router";

const notificationStore = useNotificationStore();
const router = useRouter();
const modules = ref([]);
const loading = ref(false);
const headers = [
    {
        title: "Module Code",
        key: "code",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Module Name",
        key: "name",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Enrolled Students",
        key: "students",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Pending Requests",
        key: "requests",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "",
        key: "actions",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];

const viewModule = (moduleCode) => {
    router.push({
        name: "ModuleView",
        params: {
            moduleCode: moduleCode,
            moduleName: modules.value.find((module) => module.code === moduleCode).name,
        },
    });
};

onMounted(async () => {
    try {
        loading.value = true;
        const profId = JSON.parse(localStorage.getItem("user")).matrix_id;
        const response =
            await gatewayApiService.getModulesWithRequestsByProfessor(profId);
        if (response.success) {
            modules.value = response.data.modules;
        } else {
            notificationStore.showNotification({
                message: response.error,
                color: "error",
            });
        }
    } catch (error) {
        console.error("Error fetching modules:", error);
        notificationStore.showNotification({
            message: "Error fetching modules",
            color: "error",
        });
    } finally {
        loading.value = false;
    }
});
</script>
