import { defineStore } from 'pinia';

export const useLeaveDateStore = defineStore('leaveDateStore', {
  state: () => ({
    selectedLeaveDates: [],
  }),
  actions: {
    setSelectedLeaveDates(dates) {
      this.selectedLeaveDates = dates;
    },
  },
});
