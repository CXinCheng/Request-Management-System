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
                >
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { moduleApiService } from "@/utils/ApiService";

const search = ref("");
const loading = ref(false);
const modules = ref([]);

const headers = [
    { 
        title: "Module Code", 
        key: "code",
        align: 'start',
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    { 
        title: "Module Name", 
        key: "name",
        align: 'start',
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    { 
        title: "Assigned Educator", 
        key: "educator_id",
        align: 'start',
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];

const fetchModules = async () => {
    try {
        loading.value = true;
        const response = await moduleApiService.getAllModules();
        if (response.success) {
            modules.value = response.data;
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        loading.value = false;
    }
};

const formattedModules = computed(() => 
  modules.value.map(module => ({
    ...module,
    educator_id: module.educator_id || 'Not Assigned'
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
