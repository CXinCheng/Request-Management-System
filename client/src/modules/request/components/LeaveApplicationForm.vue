<template>
<v-container v-if="!isLoading">

    <v-row>

    <v-col cols="9"> 
    <form>
        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                v-model="school"
                hint="School is a non-editable field"
                label="School"
                variant="outlined"
                disabled         
                ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
                <v-text-field
                v-model="faculty"
                hint="To edit, please go to profile settings."
                label="Faculty"
                variant="outlined"
                persistent-hint
                disabled
                ></v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
                <v-text-field
                v-model="matriculationId"
                hint="Matriculation ID is a non-editable field"
                label="Matriculation ID"
                variant="outlined"
                disabled
                ></v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
                <v-text-field
                v-model="email"
                hint="To edit, please go to profile settings."
                label="Email"
                variant="outlined"
                persistent-hint
                disabled
                ></v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
                <v-text-field
                v-model="phoneNumber"
                hint="To edit, please go to profile settings."
                label="Phone Number"
                variant="outlined"
                persistent-hint
                disabled
                ></v-text-field>
            </v-col>

            <v-col cols="12">
                <v-textarea
                v-model="reason"
                label="Please input your reason for leave"
                row-height="25"
                rows="3"
                variant="outlined"
                :required="true"
                auto-grow
                ></v-textarea>
            </v-col>

            <v-col cols="12">
                <v-file-input
                    v-model="file"
                    label="Upload Supporting Documents"
                    variant="outlined"
                    accept=".jpg,.png,.pdf,.mp4"
                    hint="Accepted File Format .jpg,.png,.pdf"
                    show-size
                    required
                ></v-file-input>
            </v-col>

            <v-col cols="6">
            <v-btn 
            class="mt-2 mb-4" 
            block 
            variant="elevated"
            size="x-large"
            @click="goBackToModuleSelection"
            >
            Back</v-btn>
            </v-col>

            <v-col cols="6">
            <v-btn 
            class="mt-2 mb-4 bg-primary" 
            type="submit"
            block 
            variant="elevated"
            :disabled="submit"
            :loading="submit"
            size="x-large"
            @click="submit = !submit"
            >
            Submit</v-btn>
            
            </v-col>
        </v-row>
    </form>
    </v-col>

    <v-col cols="3"> 
    <v-card class="mx-auto">
    <v-card-title class="bg-blue-darken-4">Modules Selected</v-card-title>

    <v-card-text>
        <v-list> Start Date: {{ formattedStartDate }}  </v-list>
        <v-list> End Date: {{ formattedEndDate }}  </v-list>

        <v-list>
            <v-list-item
              v-for="mod in moduleStore.selectedModules"
              :key="mod.module_code"
              :title="mod.module_code"
              :subtitle="mod.name"
        ></v-list-item>
        </v-list>

    </v-card-text>
    </v-card>
    </v-col>

    </v-row>

    </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";
import { useModuleStore } from "../stores/useModuleStore";
import { useNotificationStore } from "@/utils/NotificationStore";
import { useRouter } from "vue-router";
import { requestApiService } from "@/utils/ApiService";

const leaveDateStore = useLeaveDateStore()
const moduleStore = useModuleStore()
const notify = useNotificationStore();
const router = useRouter();
const isLoading = ref(true);
const file = ref(null);

let submit = ref(false);

const isDataReady = computed(() => {
    return (
        moduleStore.selectedModules.length > 0 &&
        leaveDateStore.selectedLeaveDates?.startDate &&
        leaveDateStore.selectedLeaveDates?.endDate
    );
});

onMounted(async() => {
    await nextTick(); 
    if (!isDataReady.value) {
        router.replace({ path: '/leave' })
    } else {
        isLoading.value = false;
    }
});

watch(isDataReady, (newVal) => {
  if (!newVal) {
    router.replace({ path: "/leave" });
  }
});

const currentUser = localStorage.getItem("user");
const school = ref('National University of Singapore'); 
const matriculationId = JSON.parse(currentUser)?.matrix_id; 
const faculty = JSON.parse(currentUser)?.faculty; 
const email = JSON.parse(currentUser)?.email; 
const phoneNumber = JSON.parse(currentUser)?.contact;
const reason = ref('');

const goBackToModuleSelection = () => {
  router.push('/leave');
};

watch(submit, async(newVal) => {
    if (!newVal) return

    if (!file.value || reason.value.length == 0){
        submit.value = false
        return
    }
    
    const moduleIDs = []
    const approverIDs = []

    moduleStore.selectedModules.forEach((selectedMod)=>{
        moduleIDs.push({...selectedMod}.module_code)
        approverIDs.push({...selectedMod}.educator_id)
    })

    const startDateISO = new Date(leaveDateStore.selectedLeaveDates.startDate).toISOString().split('T')[0];
    const endDateISO = new Date(leaveDateStore.selectedLeaveDates.endDate).toISOString().split('T')[0];

    let formData = new FormData()
    formData.append("student", matriculationId)
    formData.append("reasonOfLeave", reason.value)
    formData.append("startDateOfLeave", startDateISO)
    formData.append("endDateOfLeave", endDateISO)
    formData.append("modules", moduleIDs)
    formData.append("approvers", approverIDs)
    formData.append("uploadFile", file.value)

    let response = ''
    try {
        response = await requestApiService.submit(formData);
        notify.showNotification({
            message: "Request submitted successfully! Redirecting you to view all your requests.",
            color: "success",
        });

        setTimeout(() => {
            router.replace({ path: "/requests" });
        }, 3000);
    } catch {
        notify.showNotification({
            message: response || "Error submitting requests. Please try again.",
            color: "error",
        });

        submit.value = false
    }

});

const formattedStartDate = computed(() =>
  leaveDateStore.selectedLeaveDates?.startDate
    ? new Date(leaveDateStore.selectedLeaveDates.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "N/A"
);

const formattedEndDate = computed(() =>
  leaveDateStore.selectedLeaveDates?.endDate
    ? new Date(leaveDateStore.selectedLeaveDates.endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "N/A"
);

</script>