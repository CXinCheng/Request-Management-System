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
    { title: 'Class Type', key: 'class_type' },
    { title: 'Day', key: 'day_of_week' },
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
import { ref, onMounted, watch, computed, watchEffect } from "vue";
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

const leaveDateStore = useLeaveDateStore()
const moduleStore = useModuleStore()

const getDayNumber = (day) => {
    const daysMap = { 
      "Sunday": 0, 
      "Monday": 1, 
      "Tuesday": 2, 
      "Wednesday": 3, 
      "Thursday": 4, 
      "Friday": 5, 
      "Saturday": 6 
    };

    return daysMap[day];
  };
  
const filterByWeekday = (data, sDate, eDate) => {
  const startDate = new Date(sDate)
  const endDate = new Date(eDate)

  const dateAfterAWeek = new Date(startDate);
  dateAfterAWeek.setDate(startDate.getDate() + 7);

  if (endDate >= dateAfterAWeek){
    modules.value = allModules.value
    // assumption made here is that all lectures/tutorials are recurring each week
    return data
  }

  const startDay = startDate.getDay();
  const endDay = endDate.getDay();  

  return data.filter(item => {
    const itemDay = getDayNumber(item.day_of_week);

    if (startDay <= endDay) { 
      console.log("normal range -- ", itemDay >= startDay && itemDay <= endDay)
      return itemDay >= startDay && itemDay <= endDay;
    } 
    else { // Wrapped range (e.g., Friday - Monday) 
      console.log("wrapped range -- ", itemDay >= startDay || itemDay <= endDay)
      return itemDay >= startDay || itemDay <= endDay;
    }
  });
};

const allModules = ref(null)

onMounted(async()=>{
  try { 
    const studentID = JSON.parse(localStorage.getItem("user")).matrix_id;
    const response = await gatewayApiService.getModulesTakenByStudent(studentID);

    if (response.success) {
        modules.value = response.data;
        allModules.value = response.data
    } else {
      console.log("something went wrong: ", response)
    }
    } catch (error) {
        console.error("Error fetching modules:", error);
    }
})

const formattedModules = computed(() => {
  let filtered = modules.value.map((module) => ({
    ...module,
    educator_name: module.professor ? module.professor.name : "N/A",
    educator_id: module.professor ? module.professor.matrix_id : ""
  }));

  if (selectedStartDate.value && selectedEndDate.value) {
    return filterByWeekday(filtered, selectedStartDate.value, selectedEndDate.value);
  }

  return filtered
});

watchEffect(() => {
  selectedItems.value = selectedItems.value.filter(selected =>
    formattedModules.value.some(module => module.module_code === selected.module_code)
  );
});

const goToLeaveDetails = () => {
  router.push('/leaveDetails');
};

watch([selectedStartDate, selectedEndDate], () => {
  if (selectedStartDate && selectedEndDate){
    leaveDateStore.setSelectedLeaveDates({
      "startDate": selectedStartDate,
      "endDate": selectedEndDate,
    })
  } 
});

watch(selectedItems, (newSelection) => {
  moduleStore.setSelectedModules(newSelection)
});

</script>

<style scoped>
</style>
