<template>
  <div class="detail-item">
    <strong>{{ title }}:</strong>
    <template v-if="$slots.value">
      <p class="mt-2"><slot name="value" /></p>
    </template>
    <template v-else>
      <p v-if="!isLink" class="text-grey-darken-1">{{ value }}</p>
      <p v-else>
        <a :href="value" target="_blank" rel="noopener noreferrer">{{ value }}</a>
        <img 
          :src="value" 
          style="max-width: 100%; max-height: 70vh;"
          alt="Full size attachment"
        />
      </p>
    </template>
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
      required: false,
      default: "",
    },
  },
  computed: {
    isLink() {
      return typeof this.value === "string" &&
        (this.value.startsWith("http://") || this.value.startsWith("https://"));
    },
  },
};
</script>

<style scoped>
.detail-item {
  margin-bottom: 8px;
}
</style>