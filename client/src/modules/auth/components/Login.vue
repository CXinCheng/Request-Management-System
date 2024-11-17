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
                :rules="[() => !!email || 'Email is required']"
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
            <v-btn class="text-none text-subtitle-1" color="primary" variant="flat" type="submit"
                >Log in</v-btn
            >
        </form>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

        <v-btn
            class="text-none text-subtitle-1"
            color="primary"
            variant="outlined"
            id="signup-btn"
            >Sign up</v-btn
        >
        <v-btn class="text-none text-subtitle-1" color="primary" variant="outlined"
            >Log in with NUS SSO</v-btn
        >
    </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const email = defineModel('email');
const password = defineModel('password');
const errorMessage = ref("");
const isRememberMeSelected = defineModel('isRememberMeSelected');
const showPassword = defineModel('showPassword');

const handleLogin = async () => {
    try {
        const response = await axios.post("/api/login", {
            email: email.value,
            password: password.value,
        });
    } catch (error) {
        errorMessage.value = error.response?.data?.error || "Login failed";
    }
};
</script>

<style scoped>
.login-container {
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

label {
    display: block;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    border-radius: 4px;
}

#signup-btn {
    margin-top: 1rem;
    margin-bottom: 3rem;
}

button {
    width: 100%;
    border-radius: 2px;
}

.error {
    color: red;
}
</style>
