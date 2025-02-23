<template>
    <div class="leave-application">

    <v-container>

    <h5>Select Dates</h5>
    <v-row dense>
        <v-col cols="12" md="6">
          <v-date-input    
            v-model="selectedStartDate"    
            label="Select a start date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            variant="solo"
            required
          ></v-date-input>
        </v-col>

        <v-col cols="12" md="6">
          <v-date-input
            v-model="selectedEndDate"
            label="Select a end date"
            prepend-icon=""
            variant="solo"
            required
          ></v-date-input>

        </v-col>
    </v-row>
      <hr />
      <v-data-table :items="modules"
      v-model="selectedItems"
      items-per-page="5"
      item-value="module_code" 
      show-select
      :headers="[
      { title: 'Module Code', key: 'module_code' },
      { title: 'Professor Name', key: 'name' }
      ]"
      ></v-data-table>
    </v-container>

    <v-btn @click="goToLeaveDetails" :disabled="!selectedItems.length">
      Next
    </v-btn>
    </div> 
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { moduleApiService } from "@/utils/ApiService";
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";
import { useModuleStore } from "../stores/useModuleStore";
import { useRouter } from "vue-router";
import { VDateInput } from 'vuetify/labs/VDateInput'

const selectedItems = ref([]);
const router = useRouter();
const modules = ref([]);
const selectedStartDate = ref(null); 
const selectedEndDate = ref(null); 

const loading = ref(false);
const leaveDateStore = useLeaveDateStore()
const moduleStore = useModuleStore()

onMounted(async()=>{
  try { 
    
    const studentID = JSON.parse(localStorage.getItem("user")).matrix_id;
    const response = await moduleApiService.getModulesByStudent(studentID);
    if (response.success) {
        modules.value = response.data;
        console.log("response: ", response.data)
    } else {
      console.log("something went wrong: ", response)
    }
    } catch (error) {
        console.error("Error fetching modules:", error);
    }

})

const fetchModules = () => {
  if (selectedStartDate){
    console.log("selectedStartDate:", selectedStartDate.value);
  }
  if (selectedEndDate){
    console.log("selectedEndDate:", selectedEndDate.value);
  }
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

watch(selectedEndDate, (newVal) => {
  if (newVal) {
    fetchModules();
  }
});

watch(selectedStartDate, (newVal) => {
  if (newVal) {
    fetchModules();
  }
});

watch(selectedItems, (newSelection) => {
  const moduleSelected = {...newSelection}
  console.log("Selected Items:", moduleSelected[0]); // Logs the selected objects
  moduleStore.setSelectedModules(newSelection)
});

</script>

<style scoped>
</style>
