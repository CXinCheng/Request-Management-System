<template>
  <div class="leave-application-container">
    <h2>Leave Applications</h2>

    <v-container class="chart-container" fluid>
      <v-row>
        <v-col cols="12" md="6" lg="4" v-for="module in leaveData" :key="module.module">
          <h3 class="module-name">{{ module.module }}</h3>
          <div class="chart-wrapper">
            <Doughnut
              :data="generateChartData(module)"
              :options="chartOptions"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { Doughnut } from "vue-chartjs";

export default {
  name: "LeaveApplication",
  components: {
    Doughnut,
  },
  props: {
    leaveData: {
      type: Array,
      required: true,
    },
  },
  methods: {
    generateChartData(module) {
      return {
        labels: ["Approved", "Rejected", "Pending"],
        datasets: [
          {
            data: [module.approved, module.rejected, module.pending],
            backgroundColor: [
              "rgb(76, 175, 80)",
              "rgb(244, 67, 54)",
              "rgb(255, 152, 0)",
            ],
          },
        ],
      };
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "bottom" },
        },
      },
    };
  },
};
</script>

<style scoped>
.leave-application-container {
  padding: 16px;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

.module-name {
  text-align: center;
  font-size: 18px;
  margin-bottom: 8px;
}
</style>
