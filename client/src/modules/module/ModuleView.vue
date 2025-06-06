<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        <v-row class="mx-2 mt-2">
          <span class="text-h5 align-self-center"
            >{{ moduleCode }} - {{ moduleName }}</span
          >
          <v-spacer></v-spacer>
          <v-col cols="3">
            <v-text-field
              v-model="searchStudents"
              label="Search Students"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="2">
            <v-btn color="primary" @click="openImportDialog"
              >Enroll Student</v-btn
            >
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <div v-if="!loading && (!enrolledStudents || !enrolledStudents.length)">
          No students enrolled yet
        </div>
        <div v-else>
          <v-card-text>
            <UserTable
              :additionalHeaders="studentsTableHeaders"
              :users="enrolledStudents"
              :loading="loading"
              :search="searchStudents"
            >
              <template v-slot:requests="{ item }">
                <v-btn
                  :color="item.requests !== 0 ? 'primary' : 'secondary'"
                  :variant="item.requests !== 0 ? 'elevated' : 'tonal'"
                  :readonly="item.requests === 0"
                  size="small"
                  text
                  @click="$router.push({ name: 'RequestListView', params: {} })"
                >
                  <div v-if="item.requests === 0">0 Requests</div>
                  <div v-else>{{ item.requests }} Requests</div>
                </v-btn>
              </template>
              <template v-slot:actions="{ item }">
                <v-icon
                  size="large"
                  color="red-darken-1"
                  @click="confirmDelete(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </UserTable>
          </v-card-text>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="enrollStudentDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Import Students</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <p class="mb-4">
                  Import multiple students from an Excel file (.xls, .xlsx) or
                  CSV file.
                </p>
                <div
                  class="file-upload-container pa-6 border rounded d-flex flex-column align-center"
                >
                  <v-icon size="50" color="primary" class="mb-2"
                    >mdi-file-excel</v-icon
                  >
                  <p class="text-center">
                    Drag&Drop file here or
                    <v-btn
                      color="primary"
                      variant="text"
                      @click="triggerFileInput"
                    >
                      Choose file
                    </v-btn>
                  </p>
                  <p class="text-caption text-disabled">
                    Supported formats: .XLS .XLSX .CSV
                  </p>
                  <p class="text-caption text-disabled">Maximum size: 25 MB</p>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    class="d-none"
                    @change="handleFileSelected"
                  />
                  <p v-if="selectedFile" class="mt-2 text-body-2">
                    Selected: {{ selectedFile.name }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" class="mt-4">
                <v-divider></v-divider>
                <div class="d-flex align-center mt-4">
                  <v-icon size="small" color="primary" class="mr-2"
                    >mdi-file-excel</v-icon
                  >
                  <span>Template</span>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    variant="text"
                    @click="downloadTemplate"
                  >
                    Download
                  </v-btn>
                </div>
                <p class="text-caption text-disabled mt-1">
                  You can download template as starting point for your own file.
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="enrollStudentDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            text
            :loading="importing"
            :disabled="!selectedFile"
            @click="importStudents"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resultDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Import Results</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-alert
                  v-if="enrollResults.enrolled.length > 0"
                  color="success"
                  icon="mdi-check-circle"
                  border="start"
                  class="mb-3"
                >
                  Successfully enrolled
                  {{ enrollResults.enrolled.length }} students
                </v-alert>

                <v-alert
                  v-if="enrollResults.alreadyEnrolled.length > 0"
                  color="info"
                  icon="mdi-information"
                  border="start"
                  class="mb-3"
                >
                  {{ enrollResults.alreadyEnrolled.length }} students were
                  already enrolled
                </v-alert>

                <v-alert
                  v-if="enrollResults.nonExistent.length > 0"
                  color="warning"
                  icon="mdi-alert"
                  border="start"
                  class="mb-3"
                >
                  {{ enrollResults.nonExistent.length }} students do not exist
                  in the system
                </v-alert>
              </v-col>

              <v-col
                cols="12"
                v-if="
                  enrollResults.enrolled.length > 0 ||
                  enrollResults.alreadyEnrolled.length > 0 ||
                  enrollResults.nonExistent.length > 0
                "
              >
                <v-divider class="mb-4"></v-divider>
                <div class="d-flex align-center">
                  <v-icon size="small" color="primary" class="mr-2"
                    >mdi-file-delimited</v-icon
                  >
                  <span>Download detailed results</span>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    variant="text"
                    @click="downloadResults"
                  >
                    Download CSV
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="resultDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editUserDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Edit Studnet</span>
        </v-card-title>
        <v-card-text>
          <UserForm
            :initial-data="formData"
            :show-confirm-password="false"
            @submit="handleSave"
          >
            <template v-slot:actions>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="editUserDialog = false"
                  >Cancel</v-btn
                >
                <v-btn color="primary" text type="submit">Save</v-btn>
              </v-card-actions>
            </template>
          </UserForm>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5"
          >Confirm Remove {{ selectedUser.name }}</v-card-title
        >
        <v-card-text>
          Are you sure you want to remove this student from {{ moduleCode }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="handleDelete">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {
  gatewayApiService,
  moduleApiService,
  requestApiService,
} from "@/utils/ApiService";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import UserTable from "@/modules/admin/components/UsersTable.vue";
import { authApiService, userApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const route = useRoute();
const moduleCode = route.params.moduleCode;
const moduleName = route.params.moduleName;
const loading = ref(false);
const enrollStudentDialog = ref(false);
const deleteDialog = ref(false);
const notificationStore = useNotificationStore();
const selectedUser = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const importing = ref(false);
const enrolledStudents = ref([]);
const bulkEnrollStudents = ref([]);

const moduleData = ref({
  code: moduleCode,
  name: moduleName,
  classes: [],
});

const studentsTableHeaders = ref([
  {
    title: "Pending Requests",
    key: "requests",
    align: "start",
    headerProps: {
      style: "font-weight: 600; font-size:20px;",
    },
  },
]);
const searchStudents = ref("");
const resultDialog = ref(false);
const enrollResults = ref({
  enrolled: [],
  alreadyEnrolled: [],
  nonExistent: []
});


const openImportDialog = () => {
  selectedFile.value = null;
  enrollStudentDialog.value = true;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const confirmDelete = (user) => {
  selectedUser.value = user;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    loading.value = true;
    const response = await moduleApiService.updateEnrollmentByModule({
      moduleCode: selectedModule.value.code,
      modifiedStudents: modifiedStudents,
    });
    if (response.success) {
      await fetchUsers();
      deleteDialog.value = false;
    } else {
      notificationStore.showNotification({
        message: response.message || "Error deleting user",
        color: "error",
        timeout: 3000,
      });
    }
  } catch (error) {
    notificationStore.showNotification({
      message: response.message || "Error deleting user",
      color: "error",
      timeout: 3000,
    });
    console.error("Error deleting user:", error);
  } finally {
    loading.value = false;
  }
};

const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file && file.size <= 25 * 1024 * 1024) {
    // 25MB limit
    selectedFile.value = file;
  } else if (file) {
    notificationStore.showNotification({
      message: "File size exceeds the 25MB limit",
      color: "error",
      timeout: 3000,
    });
    event.target.value = null;
  }
};

// Function to update table headers based on class types
const updateTableHeaders = () => {
  // Start with the base header (Pending Requests)
  studentsTableHeaders.value = [
    {
      title: "Pending Requests",
      key: "requests",
      align: "start",
      headerProps: {
        style: "font-weight: 600; font-size:20px;",
      },
    },
  ];

  // Add columns for each class type
  moduleData.value.classes.forEach(({ classType }) => {
    studentsTableHeaders.value.push({
      title: `${classType} Class`,
      key: `${classType.toLowerCase()}_class_no`,
      align: "start",
      headerProps: {
        style: "font-weight: 600; font-size:20px;",
      },
    });
  });
};

onMounted(async () => {
  loading.value = true;
  try {
    let response = await moduleApiService.getClassesByModule(moduleCode);
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch module data");
    }
    moduleData.value.classes = response.data.map((classData) => ({
      classType: classData.class_type,
      classNo: classData.class_no,
    }));
    updateTableHeaders();

    response = await gatewayApiService.getEnrolledStudentsByModule(moduleCode);
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch enrolled students");
    }
    enrolledStudents.value = response.data.students.map((student) => {
      const formattedStudent = {
        ...student,
      };

      // Convert classes array to individual properties
      if (student.classes && Array.isArray(student.classes)) {
        student.classes.forEach((classInfo) => {
          const classKey = `${classInfo.class_type.toLowerCase()}_class_no`;
          formattedStudent[classKey] = classInfo.class_no;
        });
      }

      // Remove the original classes array
      delete formattedStudent.classes;

      return formattedStudent;
    });

    response = await requestApiService.getAllRequestsByModule(moduleCode);
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch module requests");
    }
    enrolledStudents.value.map((student) => {
      student.requests = response.data.filter(
        (request) => request.user_id === student.matrix_id
      ).length;
    });
  } catch (error) {
    console.error("Error fetching module data:", error);
  } finally {
    loading.value = false;
  }
});

// Read Excel file
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Validate imported data
const validateImportData = (data) => {
  if (!data || !data.length) return false;

  const requiredFields = ["matrix_id", "name", "email"];
  return data.every((row) =>
    requiredFields.every((field) => row[field] !== undefined)
  );
};

// Process and import students
const importStudents = async () => {
  if (!selectedFile.value) return;
  
  importing.value = true;
  try {
    const data = await readExcelFile(selectedFile.value);
    
    // Validate data format
    if (!validateImportData(data)) {
      notificationStore.showNotification({
        message: "Invalid file format. Please use the template provided.",
        color: "error",
        timeout: 3000,
      });
      importing.value = false;
      return;
    }
    
    // Format data for API
    bulkEnrollStudents.value = data.map(row => ({
      matrix_id: row.matrix_id,
      name: row.name,
      email: row.email,
      classes: moduleData.value.classes.map(classInfo => {
        const classKey = `${classInfo.classType.toLowerCase()}_class_no`;
        return {
          class_type: classInfo.classType,
          class_no: row[classKey] || classInfo.classNo[0]  // Use first class as default
        };
      })
    }));
    
    // Call API to enroll students
    const response = await moduleApiService.bulkEnrollStudents({
      moduleCode: moduleCode,
      students: bulkEnrollStudents.value
    });
    
    if (!response.success) {
      throw new Error(response.message || "Failed to import students");
    }
    
    // Store results for display
    enrollResults.value = {
      enrolled: response.data.enrolled || [],
      alreadyEnrolled: response.data.alreadyEnrolled || [],
      nonExistent: response.data.nonExistent || []
    };
    
    // Refresh student list
    await refreshEnrolledStudents();
    
    // Show results dialog instead of notification
    enrollStudentDialog.value = false;
    resultDialog.value = true;
    
  } catch (error) {
    console.error("Error importing students:", error);
    notificationStore.showNotification({
      message: error.message || "Error importing students",
      color: "error",
      timeout: 3000,
    });
  } finally {
    importing.value = false;
  }
};

// Download template file
const downloadTemplate = () => {
  // Create worksheet with headers
  const headers = ["matrix_id", "name", "email"];

  // Add class headers
  moduleData.value.classes.forEach(({ classType }) => {
    headers.push(`${classType.toLowerCase()}_class_no`);
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet([
    headers.reduce((obj, header) => {
      obj[header] = "";
      return obj;
    }, {}),
  ]);

  // Create sample data row
  const sampleRow = {
    matrix_id: "A0123456X",
    name: "John Doe",
    email: "johndoe@u.nus.edu",
  };

  // Add class columns to sample
  moduleData.value.classes.forEach(({ classType, classNo }) => {
    sampleRow[`${classType.toLowerCase()}_class_no`] = classNo[0];
  });

  // Add sample row
  XLSX.utils.sheet_add_json(worksheet, [sampleRow], {
    skipHeader: true,
    origin: 1,
  });

  // Create workbook and file
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  // Generate file and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${moduleCode}_student_template.xlsx`);
};

const refreshEnrolledStudents = async () => {
  try {
    const response = await gatewayApiService.getEnrolledStudentsByModule(
      moduleCode
    );
    if (!response.success) {
      throw new Error(response.message || "Failed to refresh student list");
    }

    enrolledStudents.value = response.data.students.map((student) => {
      const formattedStudent = { ...student };

      if (student.classes && Array.isArray(student.classes)) {
        student.classes.forEach((classInfo) => {
          const classKey = `${classInfo.class_type.toLowerCase()}_class_no`;
          formattedStudent[classKey] = classInfo.class_no;
        });
      }

      delete formattedStudent.classes;
      return formattedStudent;
    });

    // Update requests count
    const requestResponse = await requestApiService.getAllRequestsByModule(
      moduleCode
    );
    if (requestResponse.success) {
      enrolledStudents.value.forEach((student) => {
        student.requests = requestResponse.data.filter(
          (request) => request.user_id === student.matrix_id
        ).length;
      });
    }
  } catch (error) {
    console.error("Error refreshing students:", error);
    throw error;
  }
};

const downloadResults = () => {
  try {
    // Prepare data for CSV
    const resultsData = [];

    // Add successfully enrolled students
    enrollResults.value.enrolled.forEach(student => {
        resultsData.push({
          matrix_id: student.matrix_id,
          name: student.name || '',
          email: student.email || '',
          status: 'Successfully Enrolled'  
        });
    });
    
    // Add already enrolled students
    enrollResults.value.alreadyEnrolled.forEach(student => {
        resultsData.push({
          matrix_id: student.matrix_id,
          name: student.name || '',
          email: student.email || '',
          status: 'Already enrolled'
        });
    });
    
    // Add non-existent students
    enrollResults.value.nonExistent.forEach(student => {
      resultsData.push({
        matrix_id: student.matrix_id,
        name: student.name || '',
        email: student.email || '',
        status: 'Does not exist'
      });
    });
    
    // Generate CSV content
    let csvContent = 'Matrix ID,Name,Email,Status\n';
    
    resultsData.forEach(row => {
      csvContent += `"${row.matrix_id}","${row.name}","${row.email}","${row.status}"\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${moduleCode}_enrollment_results.csv`);
    
  } catch (error) {
    console.error('Error downloading results:', error);
    notificationStore.showNotification({
      message: 'Error generating results file',
      color: 'error',
      timeout: 3000,
    });
  }
};

</script>

<style scoped>
.v-container {
  width: 80%;
}

.file-upload-container {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  transition: border-color 0.2s;
  cursor: pointer;
}

.file-upload-container:hover {
  border-color: #1976d2;
}
</style>
