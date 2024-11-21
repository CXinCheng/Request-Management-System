import { defineStore } from 'pinia';

export const useModuleStore = defineStore('moduleStore', {
  state: () => ({
    selectedModules: [],
  }),
  actions: {
    setSelectedModules(modules) {
      this.selectedModules = modules;
    },
  },
});
