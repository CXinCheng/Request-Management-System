<template>
    <v-container>
      <v-card>
        <v-card-title class="text-h5">
          Module Code: {{ moduleCode }} - {{ moduleData.name }}
        </v-card-title>
  
        <v-card-text>
          <div v-if="!moduleData.enrolledStudents || !moduleData.enrolledStudents.length">
            No students enrolled yet
          </div>
          <div v-else>
            <v-list>
              <v-list-item
                v-for="student in moduleData.enrolledStudents"
                :key="student.matrix_id"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ student.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Matrix ID: {{ student.matrix_id }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { moduleApiService } from '@/utils/ApiService';
  import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const moduleCode = route.params.moduleCode;
const moduleData = ref({ code: '', name: '', enrolledStudents: [] });

function goBack() {
  router.push({ name: 'MyModuleView' });
}
  onMounted(async () => {
    try {
    //   const response = await moduleApiService.getModuleDetails(moduleCode);
    //   if (response.success) {
    //     moduleData.value = response.data;
    //   }
    } catch (error) {
      console.error('Error fetching module data:', error);
    }
  });
  </script>