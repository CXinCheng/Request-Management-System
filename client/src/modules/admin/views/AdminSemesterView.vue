<template>
  <v-container class="semester-view-container" fluid>
    <v-card class="mx-auto" max-width="500" elevation="10">
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
    <v-dialog v-model="dialog" max-width="400">
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

<script>
export default {
  name: "AdminSemesterView",
  data() {
    return {
      dialog: false,
      selectedYear: null,
      selectedSemester: null,
      availableYears: ["2023-2024", "2024-2025", "2025-2026"], 
      availableSemesters: ["1", "2", "3" , "4"], 
    };
  },
  methods: {
    async submitSemesterChange() {
      try {
        const payload = {
          academic_year: this.selectedYear,
          semester: this.selectedSemester,
        };

        const response = await this.$axios.put("/api/semester/update", payload); //change to use Angel's API
        this.dialog = false;
        this.$toast.success("Semester updated successfully.");
        console.log("API response:", response.data);
      } catch (error) {
        this.dialog = false;
        this.$toast.error("Failed to update semester.");
        console.error("Error:", error);
      }
    },
  },
};
</script>

<style scoped>
.semester-view-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>
