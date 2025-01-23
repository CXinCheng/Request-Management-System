<template>
    <form @submit.prevent="handleSubmit">
      <v-text-field
        label="Full Name"
        placeholder="John Doe"
        density="comfortable"
        v-model="formData.name"
        :rules="[
          () => !!formData.name || 'Name is required',
          () => /^[A-Za-z\s]+$/.test(formData.name) || 'Name must contain only alphabets',
        ]"
      ></v-text-field>
      <v-text-field
        label="Matrix ID"
        placeholder="A1234567B"
        density="comfortable"
        v-model="formData.matrix_id"
        :rules="[
          () => !!formData.matrix_id || 'Matrix ID is required',
          () => /^[A-Za-z]\d{7}[A-Za-z]$/.test(formData.matrix_id) || 'Invalid Matrix ID format (e.g. A1234567B)',
        ]"
      ></v-text-field>
      <v-text-field
        label="Email Address"
        placeholder="johndoe@gmail.com"
        type="email"
        density="comfortable"
        v-model="formData.email"
        :rules="[
          () => !!formData.email || 'Email is required',
          () => /.+@.+\..+/.test(formData.email) || 'Please enter a valid email address',
        ]"
      ></v-text-field>
      <v-text-field
        label="Password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showPassword ? 'text' : 'password'"
        :rules="[
          () => !!formData.password || 'Password is required',
          () => formData.password.length >= 8 || 'Password must be at least 8 characters',
        ]"
        density="comfortable"
        placeholder="Enter your password"
        @click:append-inner="showPassword = !showPassword"
        v-model="formData.password"
      ></v-text-field>
      <v-text-field
        v-if="showConfirmPassword"
        label="Confirm Password"
        :append-inner-icon="showConfirmPasswordIcon ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showConfirmPasswordIcon ? 'text' : 'password'"
        :rules="[
          () => !!confirmPassword || 'Password confirmation is required',
          () => confirmPassword === formData.password || 'Passwords must match',
        ]"
        density="comfortable"
        placeholder="Confirm your password"
        @click:append-inner="showConfirmPasswordIcon = !showConfirmPasswordIcon"
        v-model="confirmPassword"
      ></v-text-field>
      <v-select
        label="Role"
        density="comfortable"
        v-model="formData.role"
        :items="roleItems"
        :rules="[() => !!formData.role || 'Role is required']"
      ></v-select>
      <slot name="messages"></slot>
      <slot name="actions"></slot>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    initialData: {
      type: Object,
      default: () => ({
        name: '',
        matrix_id: '',
        email: '',
        password: '',
        role: 'Student'
      })
    },
    showConfirmPassword: {
      type: Boolean,
      default: true
    },
    roleItems: {
      type: Array,
      default: () => ['Student', 'Professor']
    }
  });
  
  const emit = defineEmits(['submit']);
  
  const formData = ref({ ...props.initialData });
  const confirmPassword = ref('');
  const showPassword = ref(false);
  const showConfirmPasswordIcon = ref(false);
  
  const handleSubmit = () => {
    emit('submit', formData.value);
  };
  </script>