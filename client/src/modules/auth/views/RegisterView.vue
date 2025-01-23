<template>
    <div class="register-container">
        <h4 class="text-h4 font-weight-bold mb-5">Register</h4>

        <UserForm
            :initial-data="formData"
            :role-items="['Student', 'Professor']"
            :show-confirm-password="true"
            @submit="handleRegister"
        >
            <template v-slot:messages>
                <v-alert
                    v-if="successMessage"
                    type="success"
                    variant="tonal"
                    class="mt-4"
                >
                    {{ successMessage }}
                </v-alert>
                <v-alert
                    v-if="errorMessage"
                    type="error"
                    variant="tonal"
                    class="mt-4"
                >
                    {{ errorMessage }}
                </v-alert>
            </template>
            <template v-slot:actions>
                <v-btn
                    :loading="isLoading"
                    :disabled="isLoading"
                    class="text-none text-subtitle-1 mt-4"
                    color="primary"
                    variant="flat"
                    type="submit"
                    block
                >
                    {{ isLoading ? "Registing..." : "Register Account" }}
                </v-btn>
            </template>
        </UserForm>

        <div class="text-center mt-4">
            Already have an account?
            <router-link to="/login" class="text-blue text-decoration-none">
                Login here
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApiService } from "@/utils/ApiService";
import UserForm from "@/components/forms/UserForm.vue";

const router = useRouter();
const formData = ref({
    name: "",
    matrix_id: "",
    email: "",
    password: "",
    role: "Student",
});
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleRegister = async (data) => {
    try {
        isLoading.value = true;
        const response = await authApiService.register(data);

        if (response.success) {
            successMessage.value =
                "Registration successful! Redirecting to login...";
            errorMessage.value = "";
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Registration failed";
        successMessage.value = "";
    } finally {
        isLoading.value = false;
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
</style>
