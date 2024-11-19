<template>
  <div class="enrolled-modules-container">
    <!-- Section Title -->
    <h2>Enrolled Modules</h2>

    <!-- Card Container -->
    <v-container class="cards-container" fluid>
      <v-row>
        <!-- Example Card 1 -->
        <v-col cols="12" sm="16" md="8" lg="3" elevation="16" hover rounded v-for="module in modules" :key="module.id">
          <v-card>
            <!-- Card Item (Header) -->
            <v-card-item>
              <div>
                <h3 class="module-title">{{ module.title }}</h3>
                <p class="module-code">{{ module.code }}</p>
              </div>
            </v-card-item>

            <!-- Card Text -->
            <v-card-text>
              <p><strong>Days:</strong> {{ module.days }}</p>
              <p><strong>Time:</strong> {{ module.time }}</p>
              <p><strong>Location:</strong> {{ module.location }}</p>
              <p><strong>Students:</strong> {{ module.students }}</p>
            </v-card-text>

            <!-- Card Actions -->
            <v-card-actions>
              <v-btn color="primary" @click="viewDetails(module.id)">View Details</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "EnrolledModules",
  data() {
    return {
      // Mock data for modules
      modules: [
        {
          id: 1,
          title: "Graphic Fundamentals",
          code: "ART101",
          days: "Mon & Wed",
          time: "9:00 AM - 10:30 AM",
          location: "Design Studio A",
          students: "200 Students",
        },
        {
          id: 2,
          title: "Advanced Web Design",
          code: "ITD201",
          days: "Tue & Thur",
          time: "1:30 PM - 3:00 PM",
          location: "Computer Lab 3",
          students: "40",
        },
        {
          id: 3,
          title: "User Experience Research",
          code: "UXD301",
          days: "Mon & Sat",
          time: "10:00 AM - 12:30 PM",
          location: "Design Lab 2",
          students: "20",
        },
        {
          id: 4,
          title: "3D Animation Techniques",
          code: "ANI301",
          days: "Wed",
          time: "2.00 PM - 5.00 PM",
          location: "Animation Studio",
          students: "80",
        },
      ],
    };
  },
  methods: {
    viewDetails(id) {
      // Navigate to module details
      console.log("Viewing details for module ID:", id);
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
  font-size: 22px;
  font-weight: bold;
  margin: 0;
}

.module-code {
  font-size: 16px;
  color: rgb(0, 0, 0);
  margin: 0;
}

.v-card {
  border: 2px solid #fff; /* Custom outline */
  transition: box-shadow 0.2s, border-color 0.2s;
}

.v-card:hover {
  border-color: #000000; /* Change border color on hover */
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3); /* Add hover shadow */
}
</style>
