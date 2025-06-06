<template>
  <v-container class="semester-view-container" fluid>
    <v-card class="larger-card" max-width="750" elevation="10">
      <v-card-title class="headline">Academic Term Management</v-card-title>
      <v-card-text>
        Select the academic year and semester you want to set:
        <v-row class="mt-4">
          <v-col cols="6">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Academic Year"
              outlined
              dense
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="selectedSemester"
              :items="availableSemesters"
              label="Semester"
              outlined
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="dialog = true" :disabled="!selectedYear || !selectedSemester">
          Confirm Change
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Semester Change</v-card-title>
        <v-card-text>
          Change academic term to:
          <br />
          <strong>{{ selectedYear }} - Semester {{ selectedSemester }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" @click="submitSemesterChange" text>Confirm</v-btn>
          <v-btn color="red darken-1" @click="dialog = false" text>Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { moduleApiService } from "@/utils/ApiService";
import { gatewayApiService } from '@/utils/ApiService';
import { useNotificationStore } from "@/utils/NotificationStore";

const notificationStore = useNotificationStore();

const dialog = ref(false);
const selectedYear = ref(null);
const selectedSemester = ref(null);
const availableYears = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];
const availableSemesters = ["Semester 1", "Semester 2", "Special Semester 1", "Special Semester 2"];
const semesterMapping = {  "Semester 1": 1,  "Semester 2": 2,  "Special Semester 1": 3,  "Special Semester 2": 4,}; //Maps semester names to integer numbers

const submitSemesterChange = async () => {
  try {
    const semesterInteger = semesterMapping[selectedSemester.value]; // Uses semester integer value
    const response = await gatewayApiService.updateSystemSemester(
      selectedYear.value, 
      semesterInteger
    );
    
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
