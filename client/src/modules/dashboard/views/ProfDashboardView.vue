<template>
    <v-container>
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="4" xl="4">
                <v-card>
                    <v-card-text>
                        <VueUiDonut
                            :dataset="dataset"
                            :config="config"
                        ></VueUiDonut>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="12" md="12" lg="8" xl="8">
                <v-card>
                    <v-card-text>
                        <p>Reserved for timetable</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row class="mt-4 mb-4"></v-row>
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
import { ref, onMounted, computed } from "vue";
import { gatewayApiService, requestApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";
import { useRouter } from "vue-router";
import { VueUiDonut } from "vue-data-ui";
import "vue-data-ui/style.css";

const notificationStore = useNotificationStore();
const router = useRouter();
const modules = ref([]);
const requests = ref([]);
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
const config = ref({
    table: {
        th: { backgroundColor: "#FFFFFF", color: "#1A1A1A" },
        td: { backgroundColor: "#FFFFFF", color: "#1A1A1A" },
    },
    style: {
        chart: {
            backgroundColor: "#FFFFFF",
            color: "#1A1A1A",
            legend: { backgroundColor: "#FFFFFF", color: "#1A1A1A" },
            tooltip: {
                backgroundColor: "#FFFFFF",
                color: "#1A1A1A",
                showPercentage: true,
                borderColor: "#CCCCCC",
                backgroundOpacity: 30,
            },
            title: {
                text: "Request Status Overview",
                color: "#1A1A1A",
                textAlign: "left",
                paddingLeft: 24,
            },
            layout: {
                labels: {
                    percentage: { color: "#1A1A1A" },
                    name: { color: "#6A6A6A" },
                    hollow: {
                        show: false,
                        average: { show: false },
                        total: {
                            show: true,
                            text: "",
                            value: {
                                color: "#1A1A1A",
                                offsetY: 4,
                                fontSize: 64,
                            },
                        },
                    },
                },
                donut: { strokeWidth: 24 },
            },
            useGradient: false,
        },
    },
    userOptions: {
        show: false,
    },
});
const dataset = computed(() => [
    {
        name: "Pending",
        color: "#FFC107",
        values: [totalRequests.value.pending],
    },
    {
        name: "Approved",
        color: "#4CAF50",
        values: [totalRequests.value.approved],
    },
    {
        name: "Rejected",
        color: "#F44336",
        values: [totalRequests.value.rejected],
    },
]);

const totalRequests = computed(() => {
    const totals = {
        pending: 0,
        approved: 0,
        rejected: 0,
    };

    requests.value.forEach((request) => {
        totals.pending += request.pending || 0;
        totals.approved += request.approved || 0;
        totals.rejected += request.rejected || 0;
    });

    return totals;
});

const viewModule = (moduleCode) => {
    router.push({
        name: "ModuleView",
        params: {
            moduleCode: moduleCode,
            moduleName: modules.value.find(
                (module) => module.code === moduleCode
            ).name,
        },
    });
};

onMounted(async () => {
    try {
        loading.value = true;
        const profId = JSON.parse(localStorage.getItem("user")).matrix_id;
        let response =
            await gatewayApiService.getModulesWithRequestsByProfessor(profId);
        if (response.success) {
            modules.value = response.data.modules;
        } else {
            notificationStore.showNotification({
                message: "Error fetching modules",
                color: "error",
            });
        }
        requests.value = modules.value.map((module) => {
            return {
                moduleCode: module.code,
            };
        });

        response = await requestApiService.getAllRequestsByProfessor(profId);
        if (response.success) {
            const requestsByModule = response.data.reduce((acc, request) => {
                if (!acc[request.module_code]) {
                    acc[request.module_code] = {
                        pending: 0,
                        rejected: 0,
                        approved: 0,
                    };
                }
                if (request.status === "Pending")
                    acc[request.module_code].pending++;
                else if (request.status === "Rejected")
                    acc[request.module_code].rejected++;
                else if (request.status === "Approved")
                    acc[request.module_code].approved++;
                return acc;
            }, {});
            requests.value = requests.value.map((module) => ({
                ...module,
                pending: requestsByModule[module.moduleCode]?.pending || 0,
                rejected: requestsByModule[module.moduleCode]?.rejected || 0,
                approved: requestsByModule[module.moduleCode]?.approved || 0,
            }));
        } else {
            notificationStore.showNotification({
                message: "Error fetching requests",
                color: "error",
            });
        }
    } catch (error) {
        console.error("Error fetching modules:", error);
        notificationStore.showNotification({
            message: "Error fetching data",
            color: "error",
        });
    } finally {
        loading.value = false;
    }
});
</script>
