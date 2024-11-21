<template>
  <div class="modules">
    <h2>Applying for the following Module(s):</h2>
    <table>
      <thead>
        <tr>
          <th>Select</th>
          <th>Course Name</th>
          <th>Course Code</th>
          <th>Professor</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="module in modules" :key="module.code">
          <td>
            <input
              type="checkbox"
              :value="module.code"
              :checked="selectedModules.includes(module.code)"
              @change="onCheckboxChange(module.code)"
            />
          </td>
          <td>{{ module.name }}</td>
          <td>{{ module.code }}</td>
          <td>{{ module.professor }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script>
export default {
  name: "ModulesTable",
  props: {
      modules: Array,
      selectedModules: Array,
  },
  methods: {
      onCheckboxChange(moduleCode) {
      const updatedModules = [...this.selectedModules];
      const index = updatedModules.indexOf(moduleCode);
      if (index === -1) {
          updatedModules.push(moduleCode); 
      } else {
          updatedModules.splice(index, 1);
      }
      this.$emit('update:selectedModules', updatedModules);
      },
  },
};
</script>

<style scoped>
.modules {
  margin-top: 1rem;
}

.modules table {
  width: 100%;
  border-collapse: collapse;
}

.modules th,
.modules td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
}

.modules th {
  background-color: #f4f4f4;
}
</style>
