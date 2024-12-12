<template>
  <div class="login-container">
    <h4 class="text-h4 font-weight-bold title">Login</h4>
    <form @submit.prevent="handleLogin">
      <v-text-field
        label="Email Address"
        placeholder="johndoe@gmail.com"
        type="email"
        density="comfortable"
        v-model="email"
        :rules="[
          () => !!email || 'Email is required',
          () => /.+@.+\..+/.test(email) || 'Please enter a valid email address',
        ]"
      ></v-text-field>
      <v-text-field
        label="Password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="showPassword ? 'text' : 'password'"
        :rules="[() => !!password || 'Password is required']"
        density="comfortable"
        placeholder="Enter your password"
        @click:append-inner="showPassword = !showPassword"
        v-model="password"
      ></v-text-field>
      <div class="d-flex align-center justify-space-between">
        <v-checkbox
          class="d-inline-flex"
          v-model="isRememberMeSelected"
          label="Remember me"
          density="compact"
        ></v-checkbox>
        <a class="text-title text-decoration-none text-blue" href="#">
          Forgot Password?</a
        >
      </div>
      <v-btn
        :loading="isLoading"
        :disabled="isLoading"
        class="text-none text-subtitle-1 mt-4"
        color="primary"
        variant="flat"
        type="submit"
        block
        @click="handleLogin"
      >
        {{ isLoading ? "Logging in..." : "Login" }}
      </v-btn>
    </form>
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mt-4">
      {{ successMessage }}
    </v-alert>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <v-btn
      class="text-none text-subtitle-1"
      color="primary"
      variant="outlined"
      id="signup-btn"
      to="/register"
      >Sign up</v-btn
    >
    <v-btn class="text-none text-subtitle-1" color="primary" variant="outlined"
      >Log in with NUS SSO</v-btn
    >
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApiService } from "@/utils/ApiService";
import { useNotificationStore } from "@/utils/NotificationStore";

const router = useRouter();
const notificationStore = useNotificationStore();
const email = defineModel("email");
const password = defineModel("password");
const successMessage = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const isRememberMeSelected = defineModel("isRememberMeSelected");
const showPassword = defineModel("showPassword");

const handleLogin = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await authApiService.login({
      email: email.value,
      password: password.value,
    });

    if (response.success) {
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      successMessage.value = "Login successful! Redirecting...";

      setTimeout(() => {
        router.push(router.currentRoute.value.query.redirect || { name: 'Dashboard' });
      }, 1000);
    }
} catch (error) {
    errorMessage.value = error.response?.data?.error || "Login failed";
    if (error.response?.status >= 500) {
        notificationStore.showNotification({
            message: errorMessage.value,
            color: "error",
        });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.title {
  padding-bottom: 1rem;
}

#signup-btn {
  margin-top: 1rem;
  margin-bottom: 3rem;
}

.v-btn {
  width: 100%;
  border-radius: 2px;
}

.error {
  color: red;
}
</style>
