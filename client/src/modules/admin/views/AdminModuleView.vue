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
                </v-row>

                <v-data-table
                    :headers="headers"
                    :items="formattedModules"
                    :search="search"
                    :loading="loading"
                    :sort-by="sortBy"
                    @update:sort-by="(value) => (sortBy = value)"
                >
                    <template v-slot:item.students="{ item }">
                        <div class="d-flex align-center justify-space-between">
                            <span>
                                {{ item.students }}
                            </span>
                            <v-btn
                                icon="mdi-account-multiple-plus"
                                size="small"
                                color="success"
                                @click="openEnrollDialog(item)"
                            />
                        </div>
                    </template>

                    <template v-slot:item.educator_name="{ item }">
                        <div class="d-flex align-center justify-space-between">
                            <span>
                                {{ item.educator_name }}
                            </span>
                            <div>
                                <v-btn
                                    icon="mdi-account-edit"
                                    size="small"
                                    color="primary"
                                    class="ms-2"
                                    @click="openAssignDialog(item)"
                                />
                                <v-btn
                                    v-if="item.educator_name !== 'Not Assigned'"
                                    icon="mdi-account-remove"
                                    size="small"
                                    color="error"
                                    class="ms-2"
                                    @click="removeEducator(item)"
                                />
                            </div>
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="800px">
            <v-card>
                <v-card-title>
                    <v-row class="mx-2 mt-2"
                        ><span class="text-h5 align-self-center"
                            >Assign Professor to {{ selectedModule.code }}</span
                        >
                        <v-spacer></v-spacer>
                        <v-col cols="4">
                            <v-text-field
                                v-model="searchProfessors"
                                label="Search Professors"
                                prepend-inner-icon="mdi-magnify"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <UserTable
                        :users="professors"
                        :loading="loadingProfessors"
                        :search="searchProfessors"
                    >
                        <template v-slot:actions="{ item }">
                            <v-btn
                                color="primary"
                                size="small"
                                @click="assignProfessor(item)"
                                :disabled="
                                    item.matrix_id ===
                                    selectedModule?.educator_id
                                "
                                style="min-width: 115px"
                            >
                                {{
                                    item.matrix_id ===
                                    selectedModule?.educator_id
                                        ? "Selected"
                                        : "Select"
                                }}
                            </v-btn>
                        </template>
                    </UserTable>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="dialog = false"
                        >Cancel</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="enrollDialog" max-width="800px">
            <v-card>
                <v-card-title>
                    <v-row class="mx-2 mt-2">
                        <span class="text-h5 align-self-center"
                            >Enroll Students to {{ selectedModule?.code }}</span
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
                    <UserTable
                        :additionalHeaders="studentsTableHeaders"
                        :users="students"
                        :loading="loading"
                        :search="searchStudents"
                        :initial-sort="studentsTableSort"
                        :no-data-text="
                            students.length
                                ? ''
                                : 'This module has no classes in current semester'
                        "
                    >
                        <template v-slot:class_no="{ item }">
                            <div
                                class="d-flex align-center justify-space-between"
                            >
                                <v-select
                                    v-if="
                                        selectedStudents.find(
                                            (c) =>
                                                c.matrix_id === item.matrix_id
                                        )
                                    "
                                    :items="classes.map((c) => c.class_no)"
                                    :value="
                                        item.class_no || classes[0]?.class_no
                                    "
                                    @update:modelValue="
                                        (val) =>
                                            (selectedStudents.find(
                                                (s) =>
                                                    s.matrix_id ===
                                                    item.matrix_id
                                            ).class_no = val)
                                    "
                                    density="compact"
                                    hide-details
                                />
                                <template v-else> Not enrolled </template>
                            </div>
                        </template>
                        <template v-slot:actions="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-checkbox-btn
                                    density="compact"
                                    :modelValue="
                                        selectedStudents.some(
                                            (s) =>
                                                s.matrix_id === item.matrix_id
                                        )
                                    "
                                    @update:modelValue="
                                        handleStudentSelection(item.matrix_id)
                                    "
                                />
                            </div>
                        </template>
                    </UserTable>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="enrollDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="primary" text @click="saveEnrollments">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { moduleApiService, adminApiService } from "@/utils/ApiService";
import UserTable from "../components/UsersTable.vue";
import { useNotificationStore } from "@/utils/NotificationStore";

const search = ref("");
const searchProfessors = ref("");
const loading = ref(false);
const loadingProfessors = ref(false);
const dialog = ref(false);
const modules = ref([]);
const professors = ref([]);
const selectedModule = ref(null);
const enrollDialog = ref(false);
const searchStudents = ref("");
const students = ref([]);
const selectedStudents = ref([]);
const originalSelectedStudents = ref([]);
const classes = ref([]);
const sortBy = ref([{ key: "code", order: "asc" }]);

const notify = useNotificationStore();

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
        title: "Assigned Educator",
        key: "educator_name",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];
const studentsTableHeaders = [
    {
        title: "Class",
        key: "class_no",
        align: "start",
        class: "font-weight-bold",
        headerProps: { style: "font-weight: 600; font-size:20px;" },
    },
];
const studentsTableSort = ref([{ key: "class_no", order: "desc" }]);

const removeEducator = async (module) => {
    try {
        loading.value = true;
        const response = await moduleApiService.updateEducator({
            module_code: module.code,
            educator_id: null,
        });
        if (response.success) {
            await fetchModules();
            notify.showNotification({
                message: "Professor removed successfully",
                color: "success",
            });
        } else {
            notify.showNotification({
                message: response.message || "Error removing professor",
                color: "error",
            });
        }
    } catch (error) {
        notify.showNotification({
            message: response.message || "Error removing professor",
            color: "error",
        });
        console.error("Error removing educator:", error);
    } finally {
        loading.value = false;
    }
};

const openAssignDialog = async (module) => {
    selectedModule.value = module;
    dialog.value = true;
};

async function openEnrollDialog(module) {
    selectedModule.value = module;
    enrollDialog.value = true;
    await fetchClasses(); // fix concurrent requests issue, possibly due to the SSH tunnel

    if (classes.value.length > 0) {
        await fetchStudents();
        selectedStudents.value = students.value
            .filter((student) => student.class_no)
            .map((student) => ({
                matrix_id: student.matrix_id,
                class_no: student.class_no,
            }));
        originalSelectedStudents.value = selectedStudents.value.map(
            (student) => ({
                matrix_id: student.matrix_id,
                class_no: student.class_no,
            })
        );
    } else {
        students.value = [];
    }
}

async function fetchClasses() {
    try {
        loading.value = true;
        const response = await moduleApiService.getClassesByModule(
            selectedModule.value.code
        );
        if (response.success) {
            classes.value = response.data
                .map((classItem) => ({
                    class_no: classItem.class_no,
                }))
                .sort((a, b) => a.class_no.localeCompare(b.class_no));
        }
    } catch (error) {
        console.error("Error fetching classes:", error);
    } finally {
        loading.value = false;
    }
}

async function fetchStudents() {
    try {
        loading.value = true;
        const response = await adminApiService.getAllStudentsByModule(
            selectedModule.value.code
        );
        if (response.success) {
            students.value = response.data.students.map((student) => ({
                ...student,
                class_no: student.class_no ?? null,
            }));
        }
    } catch (error) {
        notify.showNotification({
            message: response.message || "Error fetching students",
            color: "error",
        });
        console.error("Error fetching students:", error);
    } finally {
        loading.value = false;
    }
}

async function saveEnrollments() {
    try {
        loading.value = true;
        const modifiedStudents = {
            addedStudents: selectedStudents.value
                .filter(
                    (student) =>
                        !originalSelectedStudents.value.some(
                            (original) =>
                                original.matrix_id === student.matrix_id
                        )
                )
                .map((student) => ({
                    matrix_id: student.matrix_id,
                    class_no: student.class_no,
                })),

            updatedStudents: selectedStudents.value
                .filter((student) => {
                    const original = originalSelectedStudents.value.find(
                        (o) => o.matrix_id === student.matrix_id
                    );
                    return original && original.class_no !== student.class_no;
                })
                .map((student) => ({
                    matrix_id: student.matrix_id,
                    class_no: student.class_no,
                })),

            deletedStudents: originalSelectedStudents.value
                .filter(
                    (original) =>
                        !selectedStudents.value.some(
                            (student) =>
                                student.matrix_id === original.matrix_id
                        )
                )
                .map((student) => student.matrix_id),
        };

        const response = await moduleApiService.updateEnrollmentByModule({
            moduleCode: selectedModule.value.code,
            modifiedStudents: modifiedStudents,
        });
        if (response.success) {
            await fetchModules();
            enrollDialog.value = false;
            selectedStudents.value = [];
            originalSelectedStudents.value = [];
            notify.showNotification({
                message: "Enrollment updated successfully",
                color: "success",
            });
        } else {
            notify.showNotification({
                message: response.message || "Error updating enrollment",
                color: "error",
            });
        }
    } catch (error) {
        notify.showNotification({
            message: response.message || "Error updating enrollment",
            color: "error",
        });
        console.error("Error enrolling students:", error);
    } finally {
        loading.value = false;
    }
}

const handleStudentSelection = (matrix_id) => {
    const index = selectedStudents.value.findIndex(
        (s) => s.matrix_id === matrix_id
    );
    if (index !== -1) {
        selectedStudents.value.splice(index, 1);
    } else {
        selectedStudents.value.push({
            matrix_id: matrix_id,
            class_no: classes.value[0]?.class_no,
        });
    }
};

const assignProfessor = async (professor) => {
    try {
        loading.value = true;
        const response = await moduleApiService.updateEducator({
            module_code: selectedModule.value.code,
            educator_id: professor.matrix_id,
        });
        if (response.success) {
            await fetchModules();
            dialog.value = false;
            notify.showNotification({
                message: "Professor assigned successfully",
                color: "success",
            });
        } else {
            notify.showNotification({
                message:
                    error.response?.data?.error || "Error assigning professor",
                color: "error",
            });
        }
    } catch (error) {
        notify.showNotification({
            message: error.response?.data?.error || "Error assigning professor",
            color: "error",
        });
        console.error("Error assigning professor:", error);
    } finally {
        loading.value = false;
    }
};

const fetchModules = async () => {
    try {
        loading.value = true;
        const response = await adminApiService.getAllModules();
        if (response.success) {
            modules.value = response.data.modules;
            professors.value = response.data.educators;
        } else {
            notify.showNotification({
                message:
                    error.response?.data?.error || "Error fetching modules",
                color: "error",
            });
        }
    } catch (error) {
        notify.showNotification({
            message: error.response?.data?.error || "Error fetching modules",
            color: "error",
        });
        console.error("Error fetching users:", error);
    } finally {
        loading.value = false;
    }
};

const formattedModules = computed(() =>
    modules.value.map((module) => ({
        ...module,
        educator_name:
            professors.value.find((p) => p.matrix_id === module.educator_id)
                ?.name ?? "Not Assigned",
    }))
);

onMounted(() => {
    fetchModules();
});
</script>

<style scoped>
.v-data-table {
    margin-top: 1rem;
}
</style>
