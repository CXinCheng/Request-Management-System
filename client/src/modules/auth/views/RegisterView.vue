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
                    () => /.+@.+\..+/.test(email) || 'Email must be valid',
                ]"
            ></v-text-field>
            <v-text-field
                label="Password"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                :rules="[
                    () => !!password || 'Password is required',
                    () =>
                        password.length >= 8 ||
                        'Password must be at least 8 characters',
                ]"
                density="comfortable"
                placeholder="Enter your password"
                @click:append-inner="showPassword = !showPassword"
                v-model="password"
            ></v-text-field>
            <v-text-field
                label="Confirm Password"
                :append-inner-icon="
                    showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                "
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="[
                    () =>
                        !!confirmPassword ||
                        'Password confirmation is required',
                    () =>
                        confirmPassword === password || 'Passwords must match',
                ]"
                density="comfortable"
                placeholder="Confirm your password"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                v-model="confirmPassword"
            ></v-text-field>
            <v-text-field
                label="Full Name"
                placeholder="John Doe"
                density="comfortable"
                v-model="name"
                :rules="[
                    () => !!name || 'Name is required',
                    () =>
                        /^[A-Za-z\s]+$/.test(name) ||
                        'Name must contain only alphabets',
                ]"
            ></v-text-field>

            <v-text-field
                label="Matrix ID"
                placeholder="A1234567B"
                density="comfortable"
                v-model="matrixId"
                :rules="[
                    () => !!matrixId || 'Matrix ID is required',
                    () =>
                        /^[A-Za-z]\d{7}[A-Za-z]$/.test(matrixId) ||
                        'Invalid Matrix ID format (e.g. A1234567B)',
                ]"
            ></v-text-field>

            <v-select
                label="Role"
                density="comfortable"
                v-model="role"
                :items="['Student', 'Professor']"
                :rules="[() => !!role || 'Role is required']"
            ></v-select>
            <v-btn
                :loading="isLoading"
                :disabled="isLoading"
                class="text-none text-subtitle-1 mt-4"
                color="primary"
                variant="flat"
                type="submit"
                block
            >
                {{ isLoading ? "Registering..." : "Register" }}
            </v-btn>
            <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mt-4"
            >
                {{ successMessage }}
            </v-alert>
        </form>

        <div class="text-center mt-4">
            Already have an account?
            <router-link to="/login" class="text-blue text-decoration-none">
                Login here
            </router-link>
        </div>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
            {{ errorMessage }}
        </v-alert>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const name = ref("");
const matrixId = ref("");
const role = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref("");

const handleRegister = async () => {
    try {
        if (password.value !== confirmPassword.value) {
            errorMessage.value = "Passwords do not match";
            return;
        }

        const response = await axios.post("/api/v1/auth/register", {
            name: name.value,
            email: email.value,
            password: password.value,
            matrix_id: matrixId.value,
            role: role.value,
        });

        if (response.data) {
            successMessage.value =
                "Registration successful! Redirecting to login...";
            // Wait 2 seconds before redirecting
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Registration failed";
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
