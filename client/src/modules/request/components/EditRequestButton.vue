<template>
    <v-btn 
      @click="editRequest" 
      class="rounded text-subtitle-1 text-white bg-amber-darken-2 mr-sm-2"
    >
      Edit
    </v-btn>
</template>

<script>
import { useLeaveDateStore } from "../stores/useLeaveDatesStore";
import { useModuleStore } from "../stores/useModuleStore";

export default {
    data() {
      return {
        requestId: Number,
        module_code: String
      };
    },
    mounted() {
        this.requestId = this.$route.params.requestId;
        this.module_code = this.$route.params.module_code;
        if (localStorage.getItem('user')) {
            let user = JSON.parse(localStorage.getItem('user'));
            this.studentId = user['matrix_id'];
            this.userRole = user['role']
        }
    },
  methods: {
    editRequest() {
      console.log("Edit Request button clicked");
      this.$router.push({
        path: `/editRequest/${this.requestId}/${this.module_code}`,
      });
    }
  }
}
</script>
