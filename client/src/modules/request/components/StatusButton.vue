<template>
  <button 
    @click="updateStatus"
    :class="buttonClass"
    class="px-4 py-2 rounded-lg text-white font-semibold"
  >
    {{ actionType }}
  </button>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    requestId: Number, // ID of the request to update
    actionType: String // 'Approve' or 'Reject'
  },
  computed: {
    buttonClass() {
      return this.actionType === 'Approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
    }
  },
  methods: {
    async updateStatus() {
      try {
        const newStatus = this.actionType === 'Approve' ? 'Approved' : 'Rejected';
        await axios.put(`http://localhost:3002/api/v1/professor/${this.profId}/${this.requestId}`, { status: newStatus });
        this.$emit('status-updated', newStatus); // Notify parent
      } catch (error) {
        console.error(`Error updating request to ${newStatus}:`, error);
      }
    }
  }
};
</script>
