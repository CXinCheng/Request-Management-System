<template>
  <v-container class="semester-view-container" fluid>
    <v-card class="mx-auto larger-card" max-width="750" elevation="10">
      <v-card-title class="headline">Academic Term Management</v-card-title>
      <v-card-subtitle>
        Current Academic Year: <strong>{{ currentAcademicYear }}</strong>
        <br />
        Current Semester: <strong>{{ currentSemester }}</strong>
      </v-card-subtitle>
      <v-card-text>
        <!-- COMBINED V-SELECT WITH INFINITE SCROLL -->
        <v-select
          v-model="selectedYear"
          :items="availableYears"
          label="Academic Year"
          outlined
          dense
        >
          <!-- Use the 'append-item' slot to add an element at the end of the list -->
          <template v-slot:append-item>
            <!-- This item will only show if there are more years to load -->
            <v-list-item
              v-if="!allYearsLoaded"
              v-intersect="onIntersect"
              class="text-center"
            >
              <v-list-item-title>
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
        <!-- END OF COMBINED V-SELECT -->

        <v-select
          v-model="selectedSemester"
          :items="availableSemesters"
          label="Semester"
          outlined
          dense
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="dialog = true"
          :disabled="!selectedYear || !selectedSemester"
        >
          Confirm Change
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Loading Indicator -->
    <v-dialog v-model="loading" persistent width="300">
      <v-card>
        <!-- Use v-card-text as a flexible container for the content -->
        <v-card-text class="d-flex flex-column align-center pa-6">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-5"
          ></v-progress-circular>

          <span>Updating semester, please wait...</span>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Semester Change</v-card-title>
        <v-card-text>
          Change academic term to:
          <br />
          <strong>{{ selectedYear }} - {{ selectedSemester }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" @click="submitSemesterChange" text>
            Confirm
          </v-btn>
          <v-btn color="red darken-1" @click="dialog = false" text
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { gatewayApiService, moduleApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

// --- EXISTING STATE ---
const notificationStore = useNotificationStore();
const loading = ref(false);
const dialog = ref(false);
const selectedYear = ref(null);
const selectedSemester = ref(null);
const availableYears = ref([
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "2026-2027",
]);
const availableSemesters = [
  "Semester 1",
  "Semester 2",
  "Special Semester 1",
  "Special Semester 2",
];
const semesterMapping = {
  "Semester 1": 1,
  "Semester 2": 2,
  "Special Semester 1": 3,
  "Special Semester 2": 4,
};
const systemSemesterSetting = ref([]);
const currentAcademicYear = computed(() => {
  const entry = systemSemesterSetting.value?.find(
    (item) => item.key === "academic_year"
  );

  return entry ? entry.value : "";
});

const currentSemester = computed(() => {
  const entry = systemSemesterSetting.value?.find(item => item.key === 'semester_number');
  if (!entry) return '';
  const semesterKey = Object.keys(semesterMapping).find(key => semesterMapping[key] === parseInt(entry.value));
  return semesterKey || '';
});

// --- NEW STATE FOR INFINITE SCROLL ---
const loadingYears = ref(false); // Prevents multiple simultaneous loads
const allYearsLoaded = ref(false); // Flag to stop loading when we've reached the end
const endYearLimit = 2100; // Set a practical limit to stop fetching years

// This function now calculates and returns a whole batch of years.
async function addMoreYears(batchSize = 5) {
  return new Promise((resolve) => {
    // The timeout now simulates a single network call for the entire batch
    setTimeout(() => {
      const newYearsBatch = [];
      let lastKnownYear = availableYears.value.at(-1);
      let [start, end] = lastKnownYear.split("-").map(Number);

      // Loop to generate the batch of new years
      for (let i = 0; i < batchSize; i++) {
        const nextStart = start + 1;
        const nextEnd = end + 1;

        // Stop if we reach the predefined limit
        if (nextStart >= endYearLimit) {
          break;
        }

        newYearsBatch.push(`${nextStart}-${nextEnd}`);

        // Update the start/end for the next iteration of the loop
        start = nextStart;
        end = nextEnd;
      }

      resolve(newYearsBatch);
    }, 100);
  });
}

// Fetch more years
const fetchMoreYears = async () => {
  if (loadingYears.value || allYearsLoaded.value) {
    return;
  }

  loadingYears.value = true;
  try {
    const batchSize = 5; // Define how many years to fetch at a time
    const newYears = await addMoreYears(batchSize);

    // Add the new years to the list if the batch isn't empty
    if (newYears && newYears.length > 0) {
      availableYears.value.push(...newYears);
    }

    // If the returned batch is smaller than requested, we've reached the end
    if (!newYears || newYears.length < batchSize) {
      allYearsLoaded.value = true;
      console.log("All available years have been loaded.");
    }
  } catch (error) {
    console.error("Error adding more years.", error);
  } finally {
    loadingYears.value = false;
  }
};

// Function triggered when the loading element at the bottom of the list becomes visible.
function onIntersect(isIntersecting) {
  // If the loading indicator is visible and we're not already fetching...
  if (isIntersecting) {
    console.log("Bottom of the list reached, fetching more years...");
    fetchMoreYears();
  }
}

// API call for semester change
const submitSemesterChange = async () => {
  if (!selectedYear.value || !selectedSemester.value) return;

  try {
    loading.value = true;
    dialog.value = false;
    const semesterInteger = semesterMapping[selectedSemester.value];
    const response = await gatewayApiService.updateSemester({
      academicYear: selectedYear.value,
      semester: semesterInteger,
    });

    if (response.success) {
      notificationStore.showNotification({
        message: "Semester updated successfully",
        color: "success",
      });
    } else {
      notificationStore.showNotification({
        message: response.message || "Failed to update semester",
        color: "error",
      });
    }
  } catch (error) {
    console.error("Error updating semester:", error);
    notificationStore.showNotification({
      message: error.message || "An unexpected error occurred",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const systemSemesterResp = await moduleApiService.getSystemSettings();
  if (systemSemesterResp.success) {
    systemSemesterSetting.value = systemSemesterResp.data.systemSettings;
  } else {
    notificationStore.showNotification({
      message: "Failed to fetch system settings",
      color: "error",
    });
  }
});
</script>

<style scoped>
.semester-view-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
.larger-card {
  font-size: 2rem;
  padding: 24px;
}
.larger-card .v-card-title {
  font-size: 2.5rem;
  font-weight: bold;
}
.larger-card .v-select input {
  font-size: 1.25rem;
}
.larger-card .v-btn {
  font-size: 1.3rem;
  padding: 24px 24px;
}
.text-center {
  text-align: center;
}
</style>
