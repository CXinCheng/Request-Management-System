<template>
    <v-btn 
      @click="editRequest" 
      class="rounded text-subtitle-1 text-white bg-amber-darken-2 mr-sm-2"
    >
      Edit
    </v-btn>
</template>

<script>
export default {
  methods: {
    editRequest() {
      console.log("Edit Request button clicked");
      this.$router.push('/updateRequest');
    }
  }
}
</script>
