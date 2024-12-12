import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const show = ref(false);
  const message = ref('');
  const color = ref('success');
  const timeout = ref(3000);

  function showNotification({ message: msg, color: clr = 'success', timeout: t = 3000 }) {
    message.value = msg;
    color.value = clr;
    timeout.value = t;
    show.value = true;
  }

  function hideNotification() {
    show.value = false;
  }

  return {
    show,
    message,
    color,
    timeout,
    showNotification,
    hideNotification
  };
});