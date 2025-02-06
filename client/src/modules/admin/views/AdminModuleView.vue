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
                    :sort-by="[{ key: 'code', order: 'asc' }]"
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                            icon="mdi-account-plus"
                            size="small"
                            color="primary"
                            @click="openAssignDialog(item)"
                        />
                        <v-btn
                            v-if="item.educator_name != 'Not Assigned'"
                            icon="mdi-account-remove"
                            size="small"
                            color="error"
                            class="ml-2"
                            @click="removeEducator(item)"
                        />
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="800px">
            <v-card>
                <v-card-title>
                    <span class="text-h5"
                        >Assign Professor to {{ selectedModule.code }}</span
                    >
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
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { moduleApiService, userApiService, adminApiService } from "@/utils/ApiService";
import UserTable from "../components/UsersTable.vue";

const search = ref("");
const searchProfessors = ref("");
const loading = ref(false);
const loadingProfessors = ref(false);
const dialog = ref(false);
const modules = ref([]);
const professors = ref([]);
const selectedModule = ref(null);

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
        title: "Assigned Educator",
        key: "educator_name",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "",
        key: "actions",
        align: "end",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];

const removeEducator = async (module) => {
    try {
        loading.value = true;
        await moduleApiService.updateEducator({
            module_code: module.code,
            educator_id: null,
        });
        await fetchModules();
    } catch (error) {
        console.error("Error removing educator:", error);
    } finally {
        loading.value = false;
    }
};

const openAssignDialog = async (module) => {
    selectedModule.value = module;
    dialog.value = true;
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
        }
    } catch (error) {
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
        }        
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        loading.value = false;
    }
};

const formattedModules = computed(() =>
    modules.value.map((module) => ({
        ...module,
        educator_name: professors.value.find((p) => p.matrix_id === module.educator_id)?.name ?? "Not Assigned",
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
