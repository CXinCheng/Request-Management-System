<template>
    <div class="detail-item">
      <strong>{{ title }}:</strong>
      <p v-if="!isLink" class="text-grey-darken-1">{{ value }}</p>
      <p v-else>
        <a :href="value" target="_blank" rel="noopener noreferrer">{{ value }}</a>
        <img 
          :src="value" 
          style="max-width: 100%; max-height: 70vh;"
          alt="Full size attachment"
        />
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: "DetailItem",
    props: {
      title: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
    computed: {
        isLink() {
            // Check if the value is a valid URL
            return this.value.startsWith("http://") || this.value.startsWith("https://");
        },
    },
  };
  </script>
  
  <style scoped>
  .detail-item {
    margin-bottom: 8px;
  }
  </style>