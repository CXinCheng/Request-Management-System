<template>
    <div class="request-leave-form">
      <h1>Leave Application</h1>
      
    <form @submit.prevent="submitForm">

    <div class="user-particulars">
        <div class="form-group">
        <label for="school">School</label>
        <input
            type="text"
            id="school"
            v-model="formData.school"
            disabled
        />
        </div>
        <div class="form-group">
        <label for="matriculationId">Matriculation ID</label>
        <input
            type="text"
            id="matriculationId"
            v-model="formData.matriculationId"
            disabled
        />
        </div>
        <div class="form-group">
        <label for="enrollment">Enrollment</label>
        <input
            type="text"
            id="enrollment"
            v-model="formData.enrollment"
            disabled
        />
        </div>
        <div class="form-group">
        <label for="contactNumber">Contact Number</label>
        <input
            type="text"
            id="contactNumber"
            v-model="formData.contactNumber"
            disabled
        />
        </div>
    </div>
    
    <!-- Modules --> 
    <div class="form-group modules">
  
      <v-expansion-panels>
        <v-expansion-panel color="white">
        <v-expansion-panel-title>
          <strong>You Are Applying For The Following Module(s):</strong>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-list lines="two">
            <v-list-item
              v-for="mod in selectedModules"
              :key="mod.code"
              :title="mod.code + ' ' + mod.name"
              :subtitle="'Taught by ' + mod.professor"
            ></v-list-item>
          </v-list>
        </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

    </div>

    <!-- Reason -->
    <div class="form-group reason">
        <label for="reason">Reason *</label>
        <textarea
        id="reason"
        v-model="formData.reason"
        placeholder="Please input reason here"
        required
        ></textarea>
    </div>

    <!-- File Upload -->
    <div class="form-group file-upload">
        <label for="fileUpload">File Upload *</label>
        <div class="file-upload-box">
        <input
            type="file"
            id="fileUpload"
            @change="handleFileUpload"
            accept=".jpg,.png,.pdf,.mp4"
            required
        />
        <p>Choose a file or drag & drop it here</p>
        <small>JPEG, PNG, PDF, and MP4 formats, up to 50MB</small>
    </div>

  </div>

  <!-- Submit Button -->
  <div class="form-group">
      <button type="submit" class="submit-button">Submit</button>
  </div>
  </form>

  <div v-if="submitStatus" :class="['status-message', submitStatus.success ? 'success' : 'error']">
    <p>{{ submitStatus.message }}</p>
  </div>

  </div>
</template>
  
<script>
import axios from "axios";
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";

export default {
name: "LeaveRequestForm",
props: {
  selectedModules: {
    type: Array,
    required: true,
  },
},
data() {
  return {
    // update this to take actual student data
    formData: {
        student: "John Doe",
        school: "National University of Singapore",
        enrollment: "Bachelor of Technology - Software Engineering",
        contactNumber: "9123 4567",
        matriculationId: "A01234567",
        file: null,
        reason: '',
    },
    submitStatus: null,
  };
},
methods: {
  handleFileUpload(event) {
    this.formData.file = event.target.files[0];
  },
  async submitForm() {
    try {

      const moduleIDs = []
      const approverIDs = []

      const leaveDateStore = useLeaveDateStore();
      const leaveDates = {...leaveDateStore}
      const startDate = leaveDates.selectedLeaveDates.startDate
      const endDate = leaveDates.selectedLeaveDates.endDate

      this.selectedModules.forEach((selectedMod)=>{
        const moduleID = {...selectedMod}.id
        const profID = {...selectedMod}.professorID

        moduleIDs.push(moduleID)
        approverIDs.push(profID)
      })

      const formDataToSubmit = {
        student: 3,
        reasonOfLeave: this.formData.reason,
        startDateOfLeave: startDate,
        endDateOfLeave: endDate,
        modules: moduleIDs,
        approvers: approverIDs,
      };

      console.log(formDataToSubmit);

      const response = await axios.post("http://localhost:3001/api/v1/requests/submit", 
      formDataToSubmit,
      {
        headers: {
          'Content-Type': 'application/json',},
        }
      );
      this.submitStatus = {
        success: true,
        message: "Leave request submitted successfully!",
      };
      this.resetForm();

      } catch (error) {
        this.submitStatus = {
          success: false,
          message: "Error submitting form. Please try again.",
        };
      }
    },
    resetForm() {
      this.formData.reason = "";
      this.formData.file = null;
    },
},
};
</script>
  
<style scoped>

.request-leave-form {
  max-width: 1000px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.modules {
  margin-bottom: 1.5rem;
}

h1 {
  text-align: left;
  font-size: 1.8rem;
  margin-bottom: 2rem;
}

.user-particulars {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-particulars .form-group {
  flex: 1 1 calc(50% - 1rem);
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}

input[type="text"],
input[type="date"],
input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.file-upload-box {
  border: 2px dashed #ccc;
  padding: 1.5rem;
  text-align: center;
  border-radius: 8px;
}

.file-upload-box p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

button.submit-button {
  background-color: #007bff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: block;
  width: 100%;
}

button.submit-button:hover {
  background-color: #0056b3;
}

.status-message {
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}


</style>
  