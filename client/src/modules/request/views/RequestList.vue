<template>
  <div class="requests-view-container">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>
        {{ moduleFilter ? `Requests for ${moduleFilter}` : "All Requests" }}
      </h1>
      <create-request-button></create-request-button>
    </div>
    <!-- Requests Table -->
    <RequestsTable :moduleFilter="moduleFilter" />
  </div>
</template>

<script>
import { ref } from "vue";
import { useRoute } from "vue-router";
import CreateRequestButton from "../components/CreateRequestButton.vue";
import RequestsTable from "../components/RequestsTable.vue";

export default {
  name: "RequestListView",
  components: {
    CreateRequestButton,
    RequestsTable,
  },
  data() {
    return {
      username: "", // Replace with the actual student ID
    };
  },
  setup() {
    const route = useRoute();
    // Only keep moduleFilter
    const moduleFilter = ref(route.query.moduleFilter || null);

    return {
      moduleFilter,
    };
  },
};
</script>

<style scoped>
.requests-view-container {
  width: 80%;
}
</style>
