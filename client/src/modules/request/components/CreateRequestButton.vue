<template>
    <button @click="createRequest" class="rounded">
      Add new Request
    </button>
</template>

<script>
export default {
  methods: {
    createRequest() {
      console.log("Add new Request button clicked");
      this.$router.push('/leave');
    }
  }
}
</script>
