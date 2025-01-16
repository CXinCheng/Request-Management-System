<template>
    <div class="leave-application">
      <h1>Leave Application</h1>
  
      <!-- Applicant Info -->
      <div class="applicant-info">
      <p class="info-item">
        <strong>Applicant:</strong> {{ user.name }}
      </p>
      <p class="info-item">
        <strong>Matriculation ID:</strong> {{ user.matriculationId }}
      </p>
    </div>

    <ProgresBar/>
  
    <!-- Date Selection -->
    <div class="date-selection">
      <label for="startDate">From:</label>
      <input
        type="date"
        id="startDate"
        v-model="leaveDates.startDate" 
        @change="fetchModules"
        required
      />

      <label for="endDate">To:</label>
      <input
        type="date"
        id="endDate"
        v-model="leaveDates.endDate"
        min=""
        @change="fetchModules"
        required
      />
    </div>
  
    <!-- Modules -->
    <ModulesTable v-if="showModuleTable" v-model:selectedModules="selectedModules" :modules="modules" />

    <!-- Next Button -->
    <div class="form-actions">
      <button @click="goToNextPage" :disabled="!selectedModules.length">
        Next
      </button>
    </div>

    </div>
</template>
  
<script>
import { useRoute } from "vue-router";
import ProgresBar from "../components/ProgressBar.vue"
import ModulesTable from "../components/ModuleTable.vue"
import { useModuleStore } from '../stores/useModuleStore';
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";

export default {
  name: "LeaveModuleSelection",
  components: {
    ProgresBar,
    ModulesTable
  },
  data() {
    return {
      user: {
          name: "John Doe",
          matriculationId: "A0123456Z",
      },
      leaveDates: {
          startDate: null,
          endDate: null,
      },
      modules: [],
      selectedModules: [],
      showModuleTable: false,
      };
    },
  methods: {
    fetchModules() {
      if (this.leaveDates.startDate){
        document.getElementById("endDate").setAttribute("min",this.leaveDates.startDate)
      }

      if (this.leaveDates.startDate && this.leaveDates.endDate) {
        const leaveDateStore = useLeaveDateStore();
        leaveDateStore.setSelectedLeaveDates(this.leaveDates)
        // Mocking module data for now
        this.modules = [
          { id: 1, name: "Software Engineering Capstone", code: "TIC4901", professor: "Prof Xavier", professorID: "1" },
          { id: 3, name: "Graphic Design Fundamentals", code: "ART101", professor: "Prof Xavier", professorID: "1" },
          { id: 4, name: "Digital Illustration", code: "ART103", professor: "Prof Xavier", professorID: "1" },
          { id: 5, name: "UX/UI Design Principles", code: "UXD301", professor: "Prof Jane", professorID: "2" },
          { id: 6, name: "Color Theory and Application", code: "ART102", professor: "Prof Jane", professorID: "2" },
          { id: 7, name: "Visual Communication Design", code: "ART202", professor: "Prof Jane", professorID: "2" },
        ];
        this.showModuleTable = true
        
      } else {
        this.modules = [];
      }
    },
    goToNextPage() {
      const moduleStore = useModuleStore()
      moduleStore.setSelectedModules(this.selectedModules)

      this.$router.push('/leaveDetails');
    },
  },
};
</script>
  
<style scoped>
.leave-application {
  max-width: 900px;
  width: 90%;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: left;
  margin-bottom: 2rem;
}

.applicant-info {
  display: flex;
  gap: 10px; 
}

.info-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.date-selection {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.date-selection label {
  margin-right: 1rem;
}

.form-actions {
  text-align: right;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

</style>
