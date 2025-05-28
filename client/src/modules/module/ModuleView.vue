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
            <v-btn color="primary" @click="addUser">Enroll Student</v-btn>
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
                <v-icon class="me-2 ml-5" size="small" @click="editUser(item)">
                  mdi-pencil
                </v-icon>
                <v-icon size="small" @click="confirmDelete(item)">
                  mdi-delete
                </v-icon>
              </template>
            </UserTable>
          </v-card-text>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="addUserDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Enroll Student in {{ moduleCode }}</span>
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
                <v-btn color="error" text @click="addUserDialog = false"
                  >Cancel</v-btn
                >
                <v-btn color="primary" text type="submit">Save</v-btn>
              </v-card-actions>
            </template>
          </UserForm>
        </v-card-text>
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
          >Confirm REmove {{ selectedUser.name }}</v-card-title
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
import UserForm from "@/components/forms/UserForm.vue";
import UserTable from "@/modules/admin/components/UsersTable.vue";
import { authApiService, userApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

const route = useRoute();
const moduleCode = route.params.moduleCode;
const moduleName = route.params.moduleName;
const loading = ref(false);
const addUserDialog = ref(false);
const editUserDialog = ref(false);
const isEdit = ref(false);
const deleteDialog = ref(false);
const notificationStore = useNotificationStore();
const selectedUser = ref(null);

const enrolledStudents = ref([]);
const formData = ref({
  name: "",
  matrix_id: "",
  email: "",
  role: "Student",
  password: "",
});

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
  }
]);
const searchStudents = ref("");

const addUser = () => {
  isEdit.value = false;
  addUserDialog.value = true;
  formData.value = {
    name: "",
    matrix_id: "",
    email: "",
    role: "Student",
    password: "",
  };
};

const editUser = (user) => {
  isEdit.value = true;
  formData.value = { ...user };
  editUserDialog.value = true;
};

const confirmDelete = (user) => {
  selectedUser.value = user;
  deleteDialog.value = true;
};

const handleSave = async (userData) => {
  try {
    loading.value = true;

    // const response = isEdit.value
    //   ? await userApiService.updateUser(userData)
    //   : await authApiService.register(userData);

    let response;
    if (isEdit.value) {
      response = await userApiService.updateUser(userData);
    } else {
      response = await authApiService.register(userData);
      // TODO: Enroll the student in the module after registration
    }
    if (response.success) {
      await fetchUsers();
      addUserDialog.value = false;
      editUserDialog.value = false;
      notificationStore.showNotification({
        message: isEdit.value
          ? "User updated successfully"
          : "User created successfully",
        color: "success",
        timeout: 3000,
      });
    } else {
      notificationStore.showNotification({
        message: response.message || "Error creating user",
        color: "error",
        timeout: 3000,
      });
    }
  } catch (error) {
    notificationStore.showNotification({
      message: response.message || "Error creating user",
      color: "error",
      timeout: 3000,
    });
    console.error("Error creating user:", error);
  } finally {
    loading.value = false;
  }
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
    }
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
    moduleData.value.classes = response.data.map(classData => ({
      classType: classData.class_type,
      classNo: classData.class_no,
    }));
    updateTableHeaders();

    response = await gatewayApiService.getEnrolledStudentsByModule(moduleCode);
    if (!response.success) {
      throw new Error(response.message || "Failed to fetch enrolled students");
    }
    enrolledStudents.value = response.data.students.map(student => {
      const formattedStudent = {
        ...student,
      };

      // Convert classes array to individual properties
      if (student.classes && Array.isArray(student.classes)) {
        student.classes.forEach(classInfo => {
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
</script>

<style scoped>
.v-container {
  width: 80%;
}
</style>
