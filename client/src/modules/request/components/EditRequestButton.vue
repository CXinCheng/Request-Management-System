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
    data() {
      return {
        requestId: Number
      };
    },
    mounted() {
        this.requestId = this.$route.params.requestId; 
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            this.studentId = user['matrix_id'];
            this.userRole = user['role']
        }
    },
  methods: {
    editRequest() {
      console.log("Edit Request button clicked");
      this.$router.push(`/editRequest/${this.requestId}`);
    }
  }
}
</script>
