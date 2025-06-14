<template>
  <v-container class="semester-view-container" fluid>
    <v-card class="mx-auto larger-card" max-width="750" elevation="10">
      <v-card-title class="headline">Academic Term Management</v-card-title>

      <v-card-text>
        Select the academic year:

        <!-- infinite scroll picker for years -->
        <v-infinite-scroll
          :height="300"
          :items="availableYears"
          @load="loadMoreYears">
          <template v-for="(item, index) in availableYears" :key="item">
            <v-list-item
              :class="index % 2 === 0 ? 'bg-grey-lighten-2' : ''"
              @click="selectYear(item)"> 
              {{ item }}
            </v-list-item>
          </template>
        </v-infinite-scroll>

        <v-select
          v-model="selectedSemester"
          :items="availableSemesters"
          item-text="text"
          item-value="value"
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
    <v-dialog v-model="loading" persistent max-width="300">
      <v-card color="grey lighten-4" class="p-4">
        <v-progress-circular
          indeterminate
          color="blue"
          size="64">
        </v-progress-circular>
        <div class="text-center mt-4">
          Updating semester, please wait...
        </div>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Semester Change</v-card-title>
        <v-card-text>
          Change academic term to:
          <br />
          <strong>{{ selectedYear }} - Semester {{ selectedSemester }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" @click="submitSemesterChange" text
            >Confirm</v-btn
          >
          <v-btn color="red darken-1" @click="dialog = false" text
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { gatewayApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

const notificationStore = useNotificationStore();

const dialog = ref(false);
const selectedYear = ref(null);
const selectedSemester = ref(null);
const availableYears = ref(["2023-2024", "2024-2025", "2025-2026", "2026-2027"]);
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
}; //Maps semester names to integer numbers

// Loading additional years when you reach bottom
async function addMoreYears() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const last = availableYears.value.at(-1);
      const [start, end] = last.split("-").map(Number);
      const newStart = start + 1;
      const newEnd = end + 1;

      resolve({ newStart, newEnd });
    }, 1000);
  });
}

async function loadMoreYears({ done }) {
  try {
    // Wait for addMoreYears to compute the new range
    const { newStart, newEnd } = await addMoreYears();

    // Push the new range into the array
    availableYears.value.push(
      `${newStart}-${newEnd}`
    );

    done("ok");

  } catch (error) {
    console.error("Error adding more years.", error);
    done("error");

  }
}

function selectYear(year) {
  selectedYear.value = year;
}
const submitSemesterChange = async () => {
  try {
    const semesterInteger = semesterMapping[selectedSemester.value]; // Uses semester integer value
    const response = await gatewayApiService.updateSemester({
      academicYear: selectedYear.value,
      semester: semesterInteger,
    });

    dialog.value = false;

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
    dialog.value = false;
    notificationStore.showNotification({
      message: error.message || "Failed to update semester",
      color: "error",
    });
  }
};
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
</style>
