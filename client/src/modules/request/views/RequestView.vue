<template>
    <LeaveRequestForm />
</template>

<script>
import { defineComponent } from 'vue';
import LeaveRequestForm from "../components/LeaveApplicationForm.vue"
import { useModuleStore } from '../stores/useModuleStore';
import { useLeaveDateStore } from '../stores/useLeaveDatesStore';

export default defineComponent({
  name: "RequestView",
  components: {
    LeaveRequestForm,
  },
  setup() {
    const moduleStore = useModuleStore();
    const selectedModules = moduleStore.selectedModules;

    const leaveDateStore = useLeaveDateStore();
    const selectedLeaveDates = leaveDateStore.selectedLeaveDates;

    return { selectedModules, selectedLeaveDates};
  },
});
</script>

