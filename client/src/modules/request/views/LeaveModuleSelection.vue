<template>
    <v-container>
    <v-skeleton-loader v-if="loading" type="card, table, actions" />
    <template v-else>
    <div class="text-h5 pb-1">{{ semesterDisplay }}</div>
    <div v-if="isCurrentWeekValid" class="text-subtitle-2 pb-4"> You are currently in Week {{ currentWeek }} </div>
    <template v-if="!isCurrentWeekValid">
      <v-alert type="error" class="mt-4">
        Semester settings not updated by admin or you are not in a valid semester period.
      </v-alert>
    </template>
    <template v-else>
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
            :max="startDateMax"
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
            :min="endDateMin"
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
    :item-selectable="isRowSelectable"
    >
      <template #item.weeks="{ item }">
        <div v-if="item.weeksDisplayInfo">
          <div>Start: {{ item.weeksDisplayInfo.start }}</div>
          <div>End: {{ item.weeksDisplayInfo.end }}</div>
          <div>Weeks: [{{ item.weeksDisplayInfo.weeks.join(', ') }}]</div>
        </div>
        <div v-else>
          [{{ item.weeks.join(', ') }}]
        </div>
      </template>
    </v-data-table>


    <v-btn @click="goToLeaveDetails" :disabled="!selectedItems.length || !selectedEndDate || !selectedStartDate">
      Next
    </v-btn>
    <v-btn color="blue-darken-4" class="ml-2" @click="resetDates">
      Reset
    </v-btn>
    </template>
    </template>
  </v-container>

</template>

<script setup>
import { ref, onMounted, watch, computed, watchEffect } from "vue";
import { gatewayApiService, moduleApiService, requestApiService } from "@/utils/ApiService";
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";
import { useModuleStore } from "../stores/useModuleStore";
import { useRouter, useRoute } from "vue-router";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useNotificationStore } from "@/utils/NotificationStore";

const selectedItems = ref([]);
const router = useRouter();
const modules = ref([]);
const selectedStartDate = ref(null); 
const selectedEndDate = ref(null); 
const loading = ref(true);

const leaveDateStore = useLeaveDateStore()
const moduleStore = useModuleStore()

const weeksInSemester = ref({})
const systemSemesterSetting = ref([]);

const academicYear = computed(() => {
  const entry = systemSemesterSetting.value?.find(item => item.key === 'academic_year');
  return entry ? entry.value : '';
});

const semesterNumber = computed(() => {
  const entry = systemSemesterSetting.value?.find(item => item.key === 'semester_number');
  return entry ? entry.value : '';
});

const semesterDisplay = computed(() => {
  if (semesterNumber.value === '3') {
    return `Special Term Part 1 (AY ${academicYear.value})`;
  } else if (semesterNumber.value === '4') {
    return `Special Term Part 2 (AY ${academicYear.value})`;
  } else if (semesterNumber.value && academicYear.value) {
    return `AY${academicYear.value} Semester ${semesterNumber.value}`;
  } else {
    return '';
  }
});

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

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const allowedDates = (dateString)=>{
  const date = new Date(dateString);

  const recessWeekStart = new Date(weeksInSemester.value[0].start); 
  recessWeekStart.setHours(0,0,0,0);
  const recessWeekEnd = new Date(weeksInSemester.value[0].start);
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

  console.log("weeksInSemester.value", weeksInSemester.value, date)
  for (let week in weeksInSemester.value) {
    console.log("week in weeksInSemester:", weeksInSemester.value[week].start)
    const startDate = new Date(weeksInSemester.value[week].start);
    startDate.setHours(0, 0, 0, 0);
    const nextWeekStart = new Date(startDate);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    if (date >= startDate && date < nextWeekStart) {
      return week
    }
  }
};

const currentWeek = computed(() => {
  return getWeekOfSem(new Date());
});

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

const startDateOfSem = computed(() => {
  if (!weeksInSemester.value[1]) return null;
  const d = new Date(weeksInSemester.value[1].start);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]
});

const endDateOfSem = computed(() => {
  if (!weeksInSemester.value[13]) return null;
  const d = new Date(weeksInSemester.value[13].start);
  d.setDate(d.getDate() + 6);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]
});

const allModules = ref(null)

const route = useRoute();
const requestId = route.params.requestId || null;
const module_code = route.params.module_code || null;
console.log("request:", requestId, module_code);

onMounted(async()=>{
  loading.value = true;
  try {
    const systemSemesterResp = await moduleApiService.getSystemSettings();
    systemSemesterSetting.value = systemSemesterResp.data.systemSettings;
    const semesterStartEntry = systemSemesterSetting.value.find(item => item.key === 'semester_start_date');
    const week1Start = semesterStartEntry ? new Date(semesterStartEntry.value) : null;
    console.log(`semesterStartDate:`, week1Start);
    console.log(`systemSemesterSetting:`,systemSemesterSetting.value)
    const weeks = {};
    // Generate Weeks 1 to 13
    if (week1Start) {
      for (let i = 1; i <= 13; i++) {
        const weekStart = new Date(week1Start);
        weekStart.setDate(week1Start.getDate() + (i - 1) * 7);
        weeks[i] = { start: formatDate(weekStart) };
      }
      const recessWeekStart = new Date(week1Start);
      recessWeekStart.setDate(recessWeekStart.getDate() + 6 * 7);
      weeks[0] = { start: formatDate(recessWeekStart) };
    }
    weeksInSemester.value = weeks;
    const studentID = JSON.parse(localStorage.getItem("user")).matrix_id;
    const response = await gatewayApiService.getModulesTakenByStudent(studentID);
    if (response.success) {
      modules.value = response.data;
      allModules.value = response.data
    } else {
      console.log("something went wrong: ", response)
    }
    console.log("startDateOfSem:", startDateOfSem.value)
    // If requestId is provided, fetch the request details
    if (requestId) {
      try {
        const response = await requestApiService.getRequestDetails(requestId, module_code);
        console.log("Request to edit:", response);
        selectedStartDate.value = response.data.start_date_of_leave;
        selectedEndDate.value = response.data.end_date_of_leave;
      } catch (error) {
        console.error("Error fetching request:", error);
        this.notificationStore.showNotification({
            message: error.response?.data?.message || "Failed to retrieve request",
            color: "error",
        });
      }
    }
  } catch (err) {
    console.error('Error during initial API calls:', err);
  } finally {
    loading.value = false;
  }
})

// Helper to extract week numbers from various formats
function extractWeeks(weeksData) {
  if (!weeksData) return [];
  // If already an array
  if (Array.isArray(weeksData)) return weeksData;
  // If stringified array
  if (typeof weeksData === 'string' && weeksData.trim().startsWith('[')) {
    try {
      const arr = JSON.parse(weeksData);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  // If stringified object
  if (typeof weeksData === 'string' && weeksData.trim().startsWith('{')) {
    try {
      const obj = JSON.parse(weeksData);
      if (Array.isArray(obj.weeks)) return obj.weeks;
      if (obj.start && obj.end) {
        return obj; // Return the object for special handling
      }
    } catch {}
  }
  // If object with weeks property
  if (typeof weeksData === 'object' && weeksData !== null && Array.isArray(weeksData.weeks)) {
    return weeksData.weeks;
  }
  // If object with start/end only, return the object for special handling
  if (typeof weeksData === 'object' && weeksData !== null && weeksData.start && weeksData.end) {
    return weeksData;
  }
  return [];
}

// Helper to calculate weeks array from start/end and weekInterval
function calculateWeeksFromRange(start, end, weekInterval = 1) {
  const weeks = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  for (let weekNum in weeksInSemester.value) {
    if (weekNum === '0') continue; // skip recess week
    const weekInfo = weeksInSemester.value[weekNum];
    if (!weekInfo) continue;
    const weekStart = new Date(weekInfo.start);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // end of the week
    // If the module's date range overlaps with this week
    if (weekEnd >= startDate && weekStart <= endDate) {
      if ((parseInt(weekNum) - 1) % weekInterval === 0) {
        weeks.push(parseInt(weekNum));
      }
    }
  }
  return weeks;
}

const formattedModules = computed(() => {
  let filtered = modules.value.map((module) => {
    let normalizedWeeks = extractWeeks(module.weeks);
    let start = null, end = null, weekInterval = 1, displayWeeks = [];
    if (
      normalizedWeeks &&
      typeof normalizedWeeks === 'object' &&
      normalizedWeeks.start &&
      normalizedWeeks.end
    ) {
      start = normalizedWeeks.start;
      end = normalizedWeeks.end;
      weekInterval = normalizedWeeks.weekInterval || 1;
      // If explicit weeks array, use it, else calculate
      if (Array.isArray(normalizedWeeks.weeks)) {
        displayWeeks = normalizedWeeks.weeks;
      } else {
        displayWeeks = calculateWeeksFromRange(start, end, weekInterval);
      }
      normalizedWeeks = displayWeeks;
    } else if (Array.isArray(normalizedWeeks)) {
      displayWeeks = normalizedWeeks;
    }
    return {
      ...module,
      educator_name: module.professor ? module.professor.name : "N/A",
      educator_id: module.professor ? module.professor.matrix_id : "",
      weeks: displayWeeks,
      weeksDisplayInfo: start && end ? { start, end, weeks: displayWeeks } : null
    };
  });

  if (selectedStartDate.value && selectedEndDate.value) {
    console.log("selectedStartDate.value: ", selectedStartDate.value)
    console.log("selectedEndDate.value: ", selectedEndDate.value)
    const weekOfStartDate = getWeekOfSem(selectedStartDate.value)
    const weekOfEndDate = getWeekOfSem(selectedEndDate.value)

    // Apply first filter on weeks 
    filtered = filtered.filter(item => {
      const weekNumbersOrObj = item.weeks;
      // If weeks is an array, use the week range logic
      if (Array.isArray(weekNumbersOrObj)) {
        let isWithinRange = false;
        for (let i = 0; i < weekNumbersOrObj.length; i++) {
          const week = parseInt(weekNumbersOrObj[i]);
          if (!isNaN(week) && week >= weekOfStartDate && week <= weekOfEndDate) {
            isWithinRange = true;
            break;
          }
        }
        return isWithinRange;
      }
      // If weeks is an object with start/end, check if any class date in that range matches the selected range and class day
      if (
        weekNumbersOrObj &&
        typeof weekNumbersOrObj === 'object' &&
        weekNumbersOrObj.start &&
        weekNumbersOrObj.end
      ) {
        const classDay = getDayNumber(item.day_of_week);
        const start = normalizeDate(weekNumbersOrObj.start);
        const end = normalizeDate(weekNumbersOrObj.end);
        const selStart = normalizeDate(selectedStartDate.value);
        const selEnd = normalizeDate(selectedEndDate.value);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const nd = normalizeDate(d);
          console.log(
            'Checking date:', nd,
            'classDay:', classDay,
            'd.getDay():', nd.getDay(),
            'selStart:', selStart,
            'selEnd:', selEnd,
            'd >= selStart:', nd >= selStart,
            'd <= selEnd:', nd <= selEnd
          );
          if (nd.getDay() === classDay && nd >= selStart && nd <= selEnd) {
            console.log('MATCHED:', nd);
            return true;
          }
        }
        return false;
      }
      return false;
    });

    // New: Filter by actual class dates in selected date range
    const startDate = normalizeDate(selectedStartDate.value);
    const endDate = normalizeDate(selectedEndDate.value);
    filtered = filtered.filter(item => {
      const weekNumbersOrObj = item.weeks;
      const classDay = getDayNumber(item.day_of_week);
      // If weeks is an array, use the week logic
      if (Array.isArray(weekNumbersOrObj)) {
        for (let i = 0; i < weekNumbersOrObj.length; i++) {
          const week = weekNumbersOrObj[i];
          const weekInfo = weeksInSemester.value[week];
          if (!weekInfo) continue;
          const weekStart = normalizeDate(weekInfo.start);
          // Calculate offset: if weekStart is Monday (1), Friday (5) is +4 days
          const weekStartDay = weekStart.getDay(); // 1 for Monday
          let offset = classDay - weekStartDay;
          if (offset < 0) offset += 7; // wrap around if needed
          const classDate = new Date(weekStart);
          classDate.setDate(weekStart.getDate() + offset);
          const nd = normalizeDate(classDate);
          console.log('Module', item.module_code, 'week', week, 'weekStart:', weekStart, 'classDate:', nd, 'classDay:', classDay, 'selected range:', startDate, endDate);
          if (nd >= startDate && nd <= endDate) {
            return true;
          }
        }
        return false;
      }
      // If weeks is an object with start/end, check if any class date in that range matches the selected range and class day
      if (
        weekNumbersOrObj &&
        typeof weekNumbersOrObj === 'object' &&
        weekNumbersOrObj.start &&
        weekNumbersOrObj.end
      ) {
        const start = normalizeDate(weekNumbersOrObj.start);
        const end = normalizeDate(weekNumbersOrObj.end);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const nd = normalizeDate(d);
          console.log('Module', item.module_code, 'checking classDate:', nd, 'classDay:', classDay, 'd.getDay():', nd.getDay(), 'selected range:', startDate, endDate);
          if (nd.getDay() === classDay && nd >= startDate && nd <= endDate) {
            console.log('MATCHED (actual class date):', nd);
            return true;
          }
        }
        return false;
      }
      return false;
    });
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
      "startDate": selectedStartDate.value,
      "endDate": selectedEndDate.value,
    })
  } 
});

watch(selectedItems, (newSelection) => {
  moduleStore.setSelectedModules(newSelection)
});

const allowedDatesArray = computed(() => {
  const dates = [];
  if (weeksInSemester.value[1] && weeksInSemester.value[13]) {
    const semStart = new Date(weeksInSemester.value[1].start);
    const semEnd = new Date(weeksInSemester.value[13].start);
    semEnd.setDate(semEnd.getDate() + 6);
    for (
      let d = new Date(semStart);
      d <= semEnd;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split('T')[0];
      if (allowedDates(dateString)) {
        dates.push(dateString);
      }
    }
  }
  return dates;
});

const startDateMax = computed(() => {
  if (selectedEndDate.value) return selectedEndDate.value;
  return allowedDatesArray.value.length
    ? allowedDatesArray.value[allowedDatesArray.value.length - 1]
    : null;
});

const endDateMin = computed(() => {
  if (selectedStartDate.value) return selectedStartDate.value;
  return allowedDatesArray.value.length
    ? allowedDatesArray.value[0]
    : null;
});

const resetDates = () => {
  selectedStartDate.value = null;
  selectedEndDate.value = null;
  selectedItems.value = [];
  moduleStore.setSelectedModules([]);
};

const isCurrentWeekValid = computed(() => {
  // currentWeek is null/undefined or not a valid week number
  if (!currentWeek.value || !weeksInSemester.value[currentWeek.value]) return false;
  return true;
});

// Helper to normalize a date to midnight
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Function to determine if a row is selectable
const isRowSelectable = (item) => {
  return item.class_type !== 'No Class';
};

</script>

<style scoped>
</style>