<template>
  <div class="leave-application-container">
    <h2>Leave Applications</h2>

    <v-container class="chart-container" fluid>
      <v-row>
        <v-col cols="12" md="6">
          <!-- Pie Chart -->
          <div class="chart-wrapper">
            <Doughnut
              :data="doughnutChartData"
              :options="chartOptions"
            />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <!-- Placeholder for additional content -->
          <p class="chart-info">
            This chart shows the distribution of leave applications by status:
          </p>
          <ul>
            <li>Approved: {{ doughnutChartData.datasets[0].data[0] }}%</li>
            <li>Rejected: {{ doughnutChartData.datasets[0].data[1] }}%</li>
            <li>Pending: {{ doughnutChartData.datasets[0].data[2] }}%</li>
          </ul>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Doughnut } from "vue-chartjs";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default defineComponent({
  name: "LeaveApplication",
  components: {
    Doughnut: Doughnut,
  },
  data() {
    return {
      // Placeholder chart data
      doughnutChartData: {
        labels: ["Approved", "Rejected", "Pending"],
        datasets: [
          {
            label: "Leave Applications",
            data: [75, 10, 15], // Placeholder values
            backgroundColor: [
              "rgb(76, 175, 80)",
              "rgb(244, 67, 54)",
              "rgb(255, 152, 0)",
            ], // RGB Colors
            hoverBackgroundColor: [
              "rgb(56, 142, 60)",
              "rgb(211, 47, 47)",
              "rgb(245, 124, 0)",
            ], // Hover Colors
            borderColor: [
              "rgb(255, 255, 255)",
              "rgb(255, 255, 255)",
              "rgb(255, 255, 255)",
            ], // White borders
            borderWidth: 2,
          },
        ],
      },
      // Chart options
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.label || "";
                const value = tooltipItem.raw || 0;
                return `${label}: ${value}%`;
              },
            },
          },
        },
      },
    };
  },
});
</script>

<style scoped>
.leave-application-container {
  padding: 16px;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-wrapper {
  width: 100%;
  height: 400px; /* Set a fixed height for the chart */
}

.chart-info {
  font-size: 16px;
  margin-top: 16px;
}

ul {
  padding: 0;
  list-style-type: none;
}

li {
  margin-bottom: 8px;
}
</style>
