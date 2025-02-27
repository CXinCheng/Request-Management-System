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

        <v-dialog v-model="dialog" max-width="900px">
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

        <v-dialog v-model="enrollDialog" max-width="1100px">
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
                        :no-data-text="
                            students.length
                                ? ''
                                : 'This module has no classes in current semester'
                        "
                    >
                        <template
                            v-for="header in studentsTableHeaders"
                            v-slot:[header.key]="{ item }"
                        >
                            <div
                                class="d-flex align-center justify-space-between"
                            >
                                <v-select
                                    max-width="150px"
                                    v-if="
                                        selectedStudents.find(
                                            (c) =>
                                                c.matrix_id === item.matrix_id
                                        )
                                    "
                                    :items="
                                        Array.from(
                                            classes.find(
                                                (c) =>
                                                    c.classType === header.type
                                            )?.classNo
                                        )
                                    "
                                    :value="
                                        item.classes.find(
                                            (c) => c.classType === header.type
                                        )?.classNo || null
                                    "
                                    @update:modelValue="
                                        selectedStudents
                                            .find(
                                                (c) =>
                                                    c.matrix_id ===
                                                    item.matrix_id
                                            )
                                            .classes.find(
                                                (c) =>
                                                    c.classType === header.type
                                            ).classNo = $event
                                    "
                                    density="compact"
                                    hide-details
                                    placeholder="Not Assigned"
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
                                        handleStudentSelection(item)
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
import { ref, computed, onMounted } from "vue";
import { moduleApiService, gatewayApiService } from "@/utils/ApiService";
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
        sort: (a, b) => (
            a === 'Not Assigned' ? 1 : 
            b === 'Not Assigned' ? -1 : 
            a.localeCompare(b)
        )
    },
];
const studentsTableHeaders = ref([]);

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

    await fetchStudents();
    selectedStudents.value = students.value
        .filter((student) => student.classes.some((c) => c.classNo !== null))
        .map((student) => ({
            matrix_id: student.matrix_id,
            classes: student.classes,
        }));
    originalSelectedStudents.value = selectedStudents.value.map((student) => ({
        matrix_id: student.matrix_id,
        classes: student.classes.map((c) => ({
            classType: c.classType,
            classNo: c.classNo,
        })),
    }));
}

async function fetchClasses() {
    try {
        loading.value = true;
        const response = await moduleApiService.getClassesByModule(
            selectedModule.value.code
        );
        if (response.success) {
            classes.value = response.data.reduce(
                (acc, { class_type, class_no }) => {
                    const existing = acc.find(
                        (c) => c.classType === class_type
                    );
                    if (existing) {
                        existing.classNo.add(class_no);
                    } else {
                        acc.push({
                            classType: class_type,
                            classNo: new Set([class_no]),
                        });
                    }
                    return acc;
                },
                []
            );
        }
        studentsTableHeaders.value = [];
        classes.value.forEach(({ classType }) => {
            studentsTableHeaders.value.push({
                type: `${classType}`,
                title: `${classType} Class`,
                key: `${classType.toLowerCase()}_class_no`,
                align: "start",
                headerProps: { style: "font-weight: 600; font-size:20px;" },
            });
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
    } finally {
        loading.value = false;
    }
}

async function fetchStudents() {
    try {
        loading.value = true;
        const response = await gatewayApiService.getAllStudentsByModule(
            selectedModule.value.code
        );
        if (response.success) {
            students.value = response.data.students.map((student) => ({
                ...student,
                classes: classes.value.length
                    ? classes.value.map((c) => {
                          const classNo = student.classes.find(
                              (s) => s.class_type === c.classType
                          );
                          return {
                              classType: c.classType,
                              classNo: classNo ? classNo.class_no : null,
                          };
                      })
                    : student.classes.map((c) => ({
                          classType: c.class_type,
                          classNo: c.class_no,
                      })),
            }));
        }
    } catch (error) {
        notify.showNotification({
            message: "Error fetching students",
            color: "error",
        });
        console.error("Error fetching students:", error);
    } finally {
        loading.value = false;
    }
}

async function saveEnrollments() {
    const invalidStudents = selectedStudents.value.filter((student) =>
        student.classes.every((cls) => cls.classNo === null)
    );

    if (invalidStudents.length > 0) {
        notify.showNotification({
            message: "Each student must be assigned to at least one class",
            color: "warning",
        });
        return;
    }
    try {
        loading.value = true;
        const modifiedStudents = findModifiedStudents(
            selectedStudents.value,
            originalSelectedStudents.value
        );

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
            message: "Error updating enrollment",
            color: "error",
        });
        console.error("Error enrolling students:", error);
    } finally {
        loading.value = false;
    }
}

const handleStudentSelection = (item) => {
    const index = selectedStudents.value.findIndex(
        (s) => s.matrix_id === item.matrix_id
    );
    if (index !== -1) {
        selectedStudents.value.splice(index, 1);
    } else {
        selectedStudents.value.push({
            matrix_id: item.matrix_id,
            classes: classes.value.length
                ? classes.value.map((c) => ({
                      classType: c.classType,
                      classNo: null,
                  }))
                : [{ classType: "No Class", classNo: "0" }],
        });
    }
};

// const handleClassSelection = (student, classType, classNo) => {
//     const seletedStudent = selectedStudents.value.find(
//         (s) => s.matrix_id === student.matrix_id
//     );
//     const index = seletedStudent.classes.findIndex(
//         (c) => c.classType === classType
//     );
//     if (index === -1) {
//         seletedStudent.classes.push({ classType, classNo });
//     } else {
//         seletedStudent.classes[index].classNo = classNo;
//     }
// };

const findModifiedStudents = (selectedStudents, originalSelectedStudents) => {
    const result = {
        addedStudents: [],
        updatedStudents: [],
        deletedStudents: [],
    };

    const originalMap = new Map(
        originalSelectedStudents.map((student) => [student.matrix_id, student])
    );
    const selectedMap = new Map(
        selectedStudents.map((student) => [student.matrix_id, student])
    );

    for (const student of selectedStudents) {
        const original = originalMap.get(student.matrix_id);
        if (!original) {
            result.addedStudents.push({
                matrix_id: student.matrix_id,
                classes: student.classes,
            });
        } else {
            const hasChanges = student.classes.some((studentClass) => {
                const originalClass = original.classes.find(
                    (c) => c.classType === studentClass.classType
                );
                return (
                    !originalClass ||
                    originalClass.classNo !== studentClass.classNo
                );
            });
            if (hasChanges) {
                result.updatedStudents.push({
                    matrix_id: student.matrix_id,
                    classes: student.classes,
                });
            }
        }
    }

    result.deletedStudents = originalSelectedStudents
        .filter((original) => !selectedMap.has(original.matrix_id))
        .map((student) => student.matrix_id);

    return result;
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
        const response = await gatewayApiService.getAllModules();
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
