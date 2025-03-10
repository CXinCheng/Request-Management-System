<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h5">
                <v-row class="mx-2 mt-2">
                        <span class="text-h5 align-self-center"
                            >{{ moduleCode }} - {{ moduleName }}</span
                        >
                        <v-spacer></v-spacer>
                        <v-col cols="4">
                            <v-text-field
                                v-model="searchStudents"
                                label="Search Students"
                                prepend-inner-icon="mdi-magnify"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>
            </v-card-title>

            <v-card-text>
                <div v-if="!enrolledStudents || !enrolledStudents.length">
                    No students enrolled yet
                </div>
                <div v-else>
                    <v-card-text>
                    <UserTable
                        :additionalHeaders="studentsTableHeaders"
                        :users="enrolledStudents"
                        :loading="loading"
                        :search="searchStudents"
                    >
                    <template v-slot:actions>
                        <v-btn
                            color="primary"
                            text
                            @click="$router.push({ name: 'RequestListView', params: {} })"
                        >
                            View Requests
                        </v-btn>
                    </template>

                    </UserTable>
                    </v-card-text>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { gatewayApiService, requestApiService } from "@/utils/ApiService";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import UserTable from "@/modules/admin/components/UsersTable.vue";

const route = useRoute();
const moduleCode = route.params.moduleCode;
const moduleName = route.params.moduleName;
const loading = ref(false);

const enrolledStudents = ref([]);

const studentsTableHeaders = [
    {
        title: "Pending Requests",
        key: "requests",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];
const searchStudents = ref("");

onMounted(async () => {
    loading.value = true;
    try {
        let response = await gatewayApiService.getEnrolledStudentsByModule(moduleCode);
        if (response.success) {
            enrolledStudents.value = response.data.students;
        }
        else {
            console.error("Error fetching enrolled students:", response.error);
        }
        response = await requestApiService.getAllRequestsByModule(moduleCode);
        if (response.success) {
            enrolledStudents.value.map((student) => {
                student.requests = response.data.filter((request) => request.user_id === student.matrix_id).length;
            });
        }
        else {
            console.error("Error fetching requests:", response.error);
        }
        loading.value = false;
    } catch (error) {
        console.error("Error fetching module data:", error);
    }
});
</script>
