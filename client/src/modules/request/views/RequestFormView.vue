<template>
  <div class="request-leave-form">
    <h1>Request Leave</h1>

    <form @submit.prevent="submitForm">
      <!-- Student Particulars Here -->
       <!-- call the student api  -->
      <div class="form-group">
        <label for="name">Student: John Doe</label>
        <label for="student">Matriculation ID: A1234567Z</label>
        <!-- <input type="text" v-model="formData.student" id="student" required /> -->
      </div>

      <!-- Start Date of Leave -->
      <div class="form-group">
        <label for="startDateOfLeave">Start Date of Leave:</label>
        <input
          type="date"
          v-model="formData.startDateOfLeave"
          id="startDateOfLeave"
          required
        />
      </div>

      <!-- End Date of Leave -->
      <div class="form-group">
        <label for="endDateOfLeave">End Date of Leave:</label>
        <input
          type="date"
          v-model="formData.endDateOfLeave"
          id="endDateOfLeave"
          required
        />
      </div>

      <!-- Modules -->
       <!-- THIS PART SHD BE DYNAMICALLY RENDERED -->
      <div class="form-group">
        <label for="modules">Modules:</label>
        <input
          type="text"
          v-model="formData.modules"
          id="modules"
          placeholder="Comma-separated modules"
          required
        />
      </div>

      <!-- Approvers -->
       <!-- THIS PART SHD BE DYNAMICALLY RENDERED -->
      <div class="form-group">
        <label for="approvers">Approvers:</label>
        <input
          type="text"
          v-model="formData.approvers"
          id="approvers"
          placeholder="Comma-separated approvers"
          required
        />
      </div>

      <!-- Reason of Leave -->
      <div class="form-group">
        <label for="reasonOfLeave">Reason of Leave:</label>
        <textarea v-model="formData.reasonOfLeave" id="reasonOfLeave" required></textarea>
      </div>

      <!-- File Upload -->
      <div class="form-group">
        <label for="fileUpload">Upload Supporting Document:</label>
        <input
          type="file"
          id="fileUpload"
          @change="handleFileUpload"
          required
        />
      </div>

      <!-- Submit Button -->
      <button type="submit">Submit</button>
    </form>

    <!-- Display Success or Error Message -->
    <div v-if="submitStatus" :class="submitStatus.success ? 'success' : 'error'">
      <p>{{ submitStatus.message }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RequestView",
  data() {
    return {
      formData: {
        student: "",
        reasonOfLeave: "",
        startDateOfLeave: "",
        endDateOfLeave: "",
        modules: "",
        approvers: "",
        file: null,
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
        // Prepare data for submission
        const formDataToSubmit = new FormData();
        formDataToSubmit.append("student", this.formData.student);
        formDataToSubmit.append("reasonOfLeave", this.formData.reasonOfLeave);
        formDataToSubmit.append("startDateOfLeave", this.formData.startDateOfLeave);
        formDataToSubmit.append("endDateOfLeave", this.formData.endDateOfLeave);
        formDataToSubmit.append("modules", this.formData.modules);
        formDataToSubmit.append("approvers", this.formData.approvers);
        formDataToSubmit.append("file", this.formData.file);

        const response = await axios.post("/api/v1/requests/submit", formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

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
      this.formData.student = "";
      this.formData.reasonOfLeave = "";
      this.formData.startDateOfLeave = "";
      this.formData.endDateOfLeave = "";
      this.formData.modules = "";
      this.formData.approvers = "";
      this.formData.file = null;
    },
  },
};

</script>
  
<style scoped>
.request-leave-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

input[type="text"],
input[type="date"],
textarea {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
  