<template>
    <v-snackbar
      v-model="notificationStore.show"
      :color="notificationStore.color"
      :timeout="notificationStore.timeout"
      location="top"
    >
      {{ notificationStore.message }}
  
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="notificationStore.hideNotification()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </template>
  
  <script setup>
  import { useNotificationStore } from '@/utils/NotificationStore';
  
  const notificationStore = useNotificationStore();
  </script>