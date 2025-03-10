<template>
  <v-container class="enrolled-modules-container">
    <h2 class="section-title">Enrolled Modules</h2>

    <v-row justify="center">
      <v-col
        v-for="(module, index) in modules"
        :key="index"
        cols="12"
        sm="6"
        md="4"  
      >
        <v-card class="module-card" :class="colorClasses[index % colorClasses.length]">
          <v-card-title class="card-title">{{ module.module_code }}</v-card-title>
          <v-card-text class="card-text">{{ module.name }}</v-card-text>
          <v-card-text class="card-text">
            <p><strong>Professor:</strong> {{ module.educator_name }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    modules: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      colorClasses: ["blue-medium"],
    };
  },
};
</script>

<style scoped>
/* Section Background */
.enrolled-modules-container {
  max-width: 95%;
  margin: auto;
  padding: 24px;
  background-color: #e3f2fd; /* Light blue background for the section */
  border-radius: 12px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
}

/* Section Title */
.section-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #0d47a1; /* Deep blue */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

/* Module Card Styles */
.module-card {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s;
}

/* Hover Effect */
.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

/* Title Styling */
.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #263238;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

/* Subtitle Styling */
.card-subtitle {
  font-size: 16px;
  color: #37474f;
  font-weight: 500;
}

/* Text Styling */
.card-text {
  font-size: 14px;
  color: #263238;
}

/* Color Variations for Cards */
.blue-medium {
  background: linear-gradient(135deg, #bbdefb, #64b5f6);
}
</style>
