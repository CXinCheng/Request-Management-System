<template>
    <v-container>
    <v-row dense>
        <v-col cols="12" md="6">
          <v-date-input    
            v-model="selectedStartDate"    
            label="Select a start date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            variant="solo"
            required
            :max="selectedEndDate"
          ></v-date-input>
        </v-col>

        <v-col cols="12" md="6">
          <v-date-input
            v-model="selectedEndDate"
            label="Select a end date"
            prepend-icon=""
            variant="solo"
            required
            :min="selectedStartDate"
          ></v-date-input>
        </v-col>
    </v-row>

    <v-data-table 
    :items="formattedModules"
    :headers="[
    { title: 'Module Code', key: 'module_code' },
    { title: 'Module Name', key: 'name' },
    { title: 'Professor Name', key: 'educator_name' }
    ]"
    v-model="selectedItems"
    items-per-page="5"
    item-value="module_code" 
    return-object
    show-select
    >
    </v-data-table>


    <v-btn @click="goToLeaveDetails" :disabled="!selectedItems.length || !selectedEndDate || !selectedStartDate">
      Next
    </v-btn>
    
  </v-container>

</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { gatewayApiService } from "@/utils/ApiService";
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";
import { useModuleStore } from "../stores/useModuleStore";
import { useRouter } from "vue-router";
import { VDateInput } from 'vuetify/labs/VDateInput'

const selectedItems = ref([]);
const router = useRouter();
const modules = ref([]);
const selectedStartDate = ref(null); 
const selectedEndDate = ref(null); 

const professsor = ref([]);
const leaveDateStore = useLeaveDateStore()
const moduleStore = useModuleStore()

onMounted(async()=>{
  try { 
    
    const studentID = JSON.parse(localStorage.getItem("user")).matrix_id;
    const response = await gatewayApiService.getModulesTakenByStudent(studentID);
    if (response.success) {
        modules.value = response.data;
        console.log("modules.value: ", modules.value)
    } else {
      console.log("something went wrong: ", response)
    }
    } catch (error) {
        console.error("Error fetching modules:", error);
    }
})

const formattedModules = computed(() => {
  return modules.value.map((module) => ({
    ...module,
    educator_name: module.professor ? module.professor.name : "N/A",
    educator_id: module.professor ? module.professor.matrix_id : ""
  }));
});

const fetchModules = () => {
  if (selectedStartDate && selectedEndDate){
    leaveDateStore.setSelectedLeaveDates({
      "startDate": selectedStartDate,
      "endDate": selectedEndDate,
    })
  }
};

const goToLeaveDetails = () => {
  router.push('/leaveDetails');
};

watch(selectedStartDate, (newVal) => {
  if (newVal) {
    fetchModules();
  }
});

watch(selectedEndDate, (newVal) => {
  if (newVal) {
    fetchModules();
  }
});

watch(selectedItems, (newSelection) => {
  moduleStore.setSelectedModules(newSelection)
});

</script>

<style scoped>
</style>
