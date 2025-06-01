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
        // const updatedRequest = await axios.put(`http://localhost:3002/api/v1/requests/professor/${this.userId}/${this.request.id}`, { status: newStatus, module_code: this.request.module_code });
        const updatedRequest = await requestApiService.updateRequestStatus(this.userId, this.request.id, this.request.module_code, newStatus);
        console.log(`Request ${this.requestId} updated to ${newStatus}:`, updatedRequest);
        this.$emit('status-updated', newStatus); // Notify parent
        window.location.reload(); // Refresh page to reflect changes
      } catch (error) {
        console.error(`Error updating request to ${newStatus}:`, error);
      }
    }
  }
};
</script>
