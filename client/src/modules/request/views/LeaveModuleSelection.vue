<template>
    <v-container>
    <div class="text-h5 pb-1"> AY24/25 SEMESTER 2 </div>
    <div class="text-subtitle-2 pb-4"> You are currently in Week {{ currentWeek }} </div>
    <v-row dense>
        <v-col cols="12" md="6">
          <v-date-input    
            v-model="selectedStartDate"    
            label="Select a start date"
            prepend-icon=""
            prepend-inner-icon="$calendar"
            variant="solo"
            required
            :min="startDateOfSem"
            :max="selectedEndDate"
            :allowed-dates="allowedDates"
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
            :max="endDateOfSem"
            :allowed-dates="allowedDates"
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
    { title: 'Professor Name', key: 'educator_name' },
    { title: 'Weeks', key: 'weeks' }
    
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

const weeksInSemester = {
  0: { "start": "2025-02-22" }, // 0 -- recess week 
  1: { "start": "2025-01-13" },
  2: { "start": "2025-01-20" },
  3: { "start": "2025-01-27" },
  4: { "start": "2025-02-03" },
  5: { "start": "2025-02-10" },
  6: { "start": "2025-02-17" },
  7: { "start": "2025-03-03" },
  8: { "start": "2025-03-10" },
  9: { "start": "2025-03-17" },
  10: { "start": "2025-03-24" },
  11: { "start": "2025-03-31" },
  12: { "start": "2025-04-07" }, 
  13: { "start": "2025-04-14" } 
};

const startDateOfSem = new Date(weeksInSemester[1].start);
startDateOfSem.setHours(0,0,0,0)

const endDateOfSem = new Date(weeksInSemester[13].start);
endDateOfSem.setDate(endDateOfSem.getDate() + 6);

const allowedDates = (dateString)=>{
  const date = new Date(dateString);

  const recessWeekStart = new Date(weeksInSemester[0].start); 
  recessWeekStart.setHours(0,0,0,0);
  const recessWeekEnd = new Date(weeksInSemester[0].start);
  recessWeekEnd.setDate(recessWeekEnd.getDate() + 7);

  // Block Recess Week
  if (date >= recessWeekStart && date <= recessWeekEnd) {
    return false;
  }
  
  return true;
}

const getWeekOfSem = (date) => {
  const normalizedInputDate = new Date(date);
  normalizedInputDate.setHours(0, 0, 0, 0);

  for (let week in weeksInSemester) {
    const startDate = new Date(weeksInSemester[week].start);
    startDate.setHours(0, 0, 0, 0);
    const nextWeekStart = new Date(startDate);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    if (date >= startDate && date < nextWeekStart) {
      return week
    }
  }

  console.error("Date is out of semester range: ", date)
};

const currentWeek = getWeekOfSem(new Date())

const filterByWeekday = (data, sDate, eDate) => {
  const startDate = new Date(sDate)
  const endDate = new Date(eDate)

  const dateAfterAWeek = new Date(startDate);
  dateAfterAWeek.setDate(startDate.getDate() + 7);

  if (endDate >= dateAfterAWeek){
    modules.value = allModules.value
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
    const weekOfStartDate = getWeekOfSem(selectedStartDate.value)
    const weekOfEndDate = getWeekOfSem(selectedEndDate.value)

    // Apply first filter on weeks 
    filtered = filtered.filter(item => {
      const weekOfModulesObj = item.weeks;
      let isWithinRange = false;
      
      for (let index in weekOfModulesObj) {
        const week = weekOfModulesObj[index]

        if (parseInt(week) >= weekOfStartDate && parseInt(week) <= weekOfEndDate) {
          isWithinRange = true;
          break;
        } 
      }

      return isWithinRange;
    });


    // Apply first filter on days
    filtered = filterByWeekday(filtered, selectedStartDate.value, selectedEndDate.value);
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
