<template>
    <div class="register-container">
        <h4 class="text-h4 font-weight-bold title">Register</h4>
        <form @submit.prevent="handleRegister">
            <v-text-field
                label="Email Address"
                placeholder="johndoe@gmail.com"
                type="email"
                density="comfortable"
                v-model="email"
                :rules="[
                    () => !!email || 'Email is required',
                    () => /.+@.+\..+/.test(email) || 'Email must be valid'
                ]"
            ></v-text-field>
            <v-text-field
                label="Password"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                :rules="[
                    () => !!password || 'Password is required',
                    () => password.length >= 8 || 'Password must be at least 8 characters'
                ]"
                density="comfortable"
                placeholder="Enter your password"
                @click:append-inner="showPassword = !showPassword"
                v-model="password"
            ></v-text-field>
            <v-text-field
                label="Confirm Password"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="[
                    () => !!confirmPassword || 'Password confirmation is required',
                    () => confirmPassword === password || 'Passwords must match'
                ]"
                density="comfortable"
                placeholder="Confirm your password"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                v-model="confirmPassword"
            ></v-text-field>
            <v-btn 
                class="text-none text-subtitle-1 mt-4" 
                color="primary" 
                variant="flat" 
                type="submit" 
                block
            >
                Register
            </v-btn>
            <div class="text-center mt-4">
                Already have an account? 
                <router-link 
                    to="/login" 
                    class="text-blue text-decoration-none"
                >
                    Login here
                </router-link>
            </div>
        </form>
        <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
        >
            {{ errorMessage }}
        </v-alert>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
    try {
        if (password.value !== confirmPassword.value) {
            errorMessage.value = 'Passwords do not match';
            return;
        }

        const response = await axios.post('/api/v1/auth/register', {
            email: email.value,
            password: password.value
        });

        if (response.data) {
            router.push('/login');
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.error || 'Registration failed';
    }
};
</script>

<style scoped>
.register-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.v-btn {
    width: 100%;
    border-radius: 2px;
}

.title {
    padding-bottom: 1rem;
}
</style>