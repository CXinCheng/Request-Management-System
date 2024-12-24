<template>
  <div class="enrolled-modules-container">
    <h2>My Enrolled Modules</h2>

    <v-container class="cards-container" fluid>
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3" v-for="module in modules" :key="module.id">
          <v-card>
            <v-card-item>
              <div>
                <h3 class="module-title">{{ module.name }}</h3>
                <p class="module-code"><strong>Code:</strong> {{ module.code }}</p>
                <p class="module-description">
                  <strong>Description:</strong> {{ module.description }}
                </p>
              </div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "EnrolledModules",
  props: {
    modules: {
      type: Array, // List of module data
      required: true,
    },
  },
};
</script>

<style scoped>
.enrolled-modules-container {
  padding: 16px;
}

.cards-container {
  margin-top: 16px;
}

.module-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.module-code,
.module-description {
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
