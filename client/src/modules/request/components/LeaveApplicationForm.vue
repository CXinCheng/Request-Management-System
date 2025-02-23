<template>
    <div class="request-leave-form">
      
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
        <label for="email">Email</label>
        <input
            type="text"
            id="email"
            v-model="formData.email"
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

  <button type="submit" class="submit-button" :disabled="isLoading">
      <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span v-if="isLoading"> Loading...</span>
      <span v-else>Submit</span>
  </button>

  </form>


  <div v-if="submitStatus" :class="['status-message', submitStatus.success ? 'success' : 'error']">
    <p>{{ submitStatus.message }}</p>
  </div>

  </div>
</template>
  
<script>
import { requestApiService } from "@/utils/ApiService";
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
  // redirect user back to select modules if no modules selected 
  if (this.selectedModules.length == 0) {
    this.$router.push({ path: '/leave' });
  }
  const currentUser = localStorage.getItem("user");
  console.log(this.selectedModules)
  return {
    formData: {
        student: JSON.parse(currentUser)?.name,
        school: "National University of Singapore",
        enrollment: JSON.parse(currentUser)?.faculty,
        email: JSON.parse(currentUser)?.email,
        matriculationId: JSON.parse(currentUser)?.matrix_id || "-",
        file: null,
        reason: '',
    },
    submitStatus: null,
    isLoading: null,
  };
},
methods: {
  handleFileUpload(event) {
    this.formData.file = event.target.files[0];
  },
  async submitForm() {
    this.isLoading = true
    this.submitStatus = null;

    const moduleIDs = []
    const approverIDs = []

    const leaveDateStore = useLeaveDateStore();
    const leaveDates = {...leaveDateStore}
    const startDate = leaveDates.selectedLeaveDates.startDate
    const endDate = leaveDates.selectedLeaveDates.endDate

    this.selectedModules.forEach((selectedMod)=>{
      const moduleID = {...selectedMod}.code
      const profID = {...selectedMod}.professorID

      moduleIDs.push(moduleID)
      approverIDs.push(profID)
    })

    let formData = new FormData()

    formData.append("student", this.formData.matriculationId)
    formData.append("reasonOfLeave", this.formData.reason)
    formData.append("startDateOfLeave", startDate)
    formData.append("endDateOfLeave", endDate)
    formData.append("modules", moduleIDs)
    formData.append("approvers", approverIDs)
    formData.append("uploadFile", this.formData.file)
    

    try {
      let response = await requestApiService.submit(formData);
      this.submitStatus = { success: true, message: 'Form submitted successfully! \n Redirecting you to Request Page.' };
      setTimeout(() => {
        this.$router.push({ path: '/requests' });
      }, 3000);

    } catch (error) {
      this.submitStatus = { success: false, message: 'Submission failed. Try again! \n Redirecting you to Submit a New Request.' };
      setTimeout(() => {
        this.$router.push({ path: '/leave' });
      }, 3000);
    }

    this.formData.reason = ''
    this.isLoading = null

    }  

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
  