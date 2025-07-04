<template>
  <button 
    @click="updateStatus"
    :class="buttonClass"
    class="px-4 py-2 rounded mr-sm-2"
  >
    {{ actionType }}
  </button>
</template>

<script>
import axios from 'axios';
import { requestApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

export default {
  props: {
    request: Object, // the request to update
    actionType: String // 'Approve' or 'Reject'
  },
  computed: {
    buttonClass() {
      return this.actionType === 'Approve' ? 'bg-green hover:bg-green-lighten-1' : 'bg-red hover:bg-red-lighten-1';
    }
  },
  data() {
    return {
      userId: '',
      notificationStore: useNotificationStore(),
    };
  },
  mounted() {
      if (localStorage.getItem('user')) {
          let user = JSON.parse(localStorage.getItem('user'));
          this.userId = user['matrix_id'];
      }
  },
  methods: {
    async updateStatus() {
      const newStatus = this.actionType === 'Approve' ? 'Approved' : 'Rejected';
      try {
        const updatedRequest = await requestApiService.updateRequestStatus(this.userId, this.request.id, this.request.module_code, newStatus, this.request.class_type);
        console.log(`Request ${this.requestId} updated to ${newStatus}:`, updatedRequest);
        this.$emit('status-updated', newStatus); // Notify parent
        window.location.reload(); // Refresh page to reflect changes
      } catch (error) {
        console.error(`Error updating request to ${newStatus}:`, error);
        this.notificationStore.showNotification({
            color: "error",
            message: error.response?.data?.message || "Failed to update request status",
        });
      }
    }
  }
};
</script>
