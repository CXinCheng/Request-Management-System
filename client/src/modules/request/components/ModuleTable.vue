<template>
  <div class="modules">
    <h5>Select Module(s)</h5>

    <table>
      <thead>
        <tr>
          <th></th>
          <th>Course Name</th>
          <th>Course Code</th>
          <th>Professor</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="module in modules" :key="module.id">
          <td>
            <input
              type="checkbox"
              :value="module"
              :checked="selectedModules.includes(module)"
              @change="onCheckboxChange(module)"
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
      onCheckboxChange(module) {
      const updatedModules = [...this.selectedModules];
      const index = updatedModules.indexOf(module);
      if (index === -1) {
          updatedModules.push(module); 
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
  margin-top: 2rem;
}

.modules table {
  margin-top: 1rem;
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
