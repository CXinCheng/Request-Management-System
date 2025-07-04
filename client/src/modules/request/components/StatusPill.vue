<template>
  <span class="status-pill" :class="status?.toLowerCase()">
    {{ status }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.status-pill {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 999px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
  background-color: #bdbdbd;
  text-transform: capitalize;
}
.status-pill.approved {
  background-color: #5acc5f;
}
.status-pill.pending {
  background-color: #5d90ff;
}
.status-pill.rejected {
  background-color: #ff4b48;
}
</style>
