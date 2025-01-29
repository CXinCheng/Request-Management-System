<template>
    <v-btn 
      @click="createRequest" 
      class="rounded text-subtitle-1 bg-blue-darken-4"
    >
      Add new Request
    </v-btn>
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
