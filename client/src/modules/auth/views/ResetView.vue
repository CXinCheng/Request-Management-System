<template>
    <div class="reset-container">
        <h4 class="text-h4 font-weight-bold mb-5">Reset Password</h4>

        <v-stepper v-model="step">
            <v-stepper-header>
                <v-stepper-item
                    value="1"
                    title="Verify Email Address"
                    :complete="step > 0"
                ></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item
                    value="2"
                    title="Verify OTP"
                    :complete="step > 1"
                ></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item value="3" title="New Password"></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <div class="text-subtitle-2 mb-3 text-grey-darken-2">
                        Enter the email address you used to create the account,
                        and we will email you the verification code(OTP) the
                        reset your password
                    </div>
                    <form @submit.prevent="verifyEmail">
                        <v-text-field
                            label="Email Address"
                            placeholder="johndoe@gmail.com"
                            type="email"
                            density="comfortable"
                            v-model="email"
                            :rules="[
                                () => !!email || 'Email is required',
                                () =>
                                    /.+@.+\..+/.test(email) ||
                                    'Please enter a valid email address',
                            ]"
                        ></v-text-field>
                        <v-btn
                            :loading="isLoading"
                            :disabled="isLoading"
                            class="text-none text-subtitle-1 mt-4"
                            color="primary"
                            variant="flat"
                            type="submit"
                            block
                        >
                            {{ isLoading ? "Sending..." : "Send OTP" }}
                        </v-btn>
                    </form>
                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <div class="text-subtitle-1 mb-3 text-grey-darken-4">
                        Didn't receive the email? Check your spam folder or
                        <v-btn
                            class="text-none text-subtitle-1"
                            color="primary"
                            variant="plain"
                            density="compact"
                            type="button"
                            slim
                            @click="resendOTP"
                            :disabled="countdown > 0"
                        >
                            Resend OTP
                            {{ countdown > 0 ? formattedCountdown : "" }}
                        </v-btn>
                        <p
                            v-if="resendMessage"
                            class="text-success ml-2"
                        >
                            {{ resendMessage }}
                    </p>
                    </div>

                    <div class="text-subtitle-1 mb-3 text-grey-darken-4">
                        Wrong email address?
                        <v-btn
                            class="text-none text-subtitle-1"
                            color="primary"
                            base-color="primary"
                            variant="plain"
                            density="compact"
                            slim
                            @click="step = 0"
                        >
                            Change Email Address
                        </v-btn>
                    </div>
                    <form @submit.prevent="verifyOTP">
                        <v-text-field
                            label="Verification OTP"
                            placeholder="Enter the OTP sent to your email address"
                            density="comfortable"
                            v-model="otp"
                            :rules="[() => !!otp || 'OTP code is required']"
                        ></v-text-field>
                        <v-btn
                            :loading="isLoading"
                            :disabled="isLoading"
                            class="text-none text-subtitle-1 mt-4"
                            color="primary"
                            variant="flat"
                            type="submit"
                            block
                        >
                            {{ isLoading ? "Verifying..." : "Verify OTP Code" }}
                        </v-btn>
                    </form>
                </v-stepper-window-item>

                <v-stepper-window-item value="3">
                    <div class="text-subtitle-2 mb-3 text-grey-darken-2">
                        Your new password must be different from your previous used password
                    </div>
                    <form @submit.prevent="resetPassword">
                        <v-text-field
                            label="New Password"
                            :append-inner-icon="
                                showPassword ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            :type="showPassword ? 'text' : 'password'"
                            :rules="[
                                () =>
                                    !!newPassword || 'New password is required',
                                () =>
                                    newPassword.length >= 8 ||
                                    'Password must be at least 8 characters',
                            ]"
                            density="comfortable"
                            placeholder="Enter new password"
                            @click:append-inner="showPassword = !showPassword"
                            v-model="newPassword"
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
                                    confirmPassword === newPassword ||
                                    'Passwords must match',
                            ]"
                            density="comfortable"
                            placeholder="Confirm new password"
                            @click:append-inner="
                                showConfirmPassword = !showConfirmPassword
                            "
                            v-model="confirmPassword"
                        ></v-text-field>
                        <v-btn
                            :loading="isLoading"
                            :disabled="isLoading"
                            class="text-none text-subtitle-1 mt-4"
                            color="primary"
                            variant="flat"
                            type="submit"
                            block
                        >
                            {{ isLoading ? "Resetting..." : "Reset Password" }}
                        </v-btn>
                    </form>
                </v-stepper-window-item>
            </v-stepper-window>
        </v-stepper>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
            {{ errorMessage }}
        </v-alert>

        <v-alert
            v-if="step === 2 && successMessage"
            type="success"
            variant="tonal"
            class="mt-4"
        >
            {{ successMessage }}
        </v-alert>

        <div class="text-center mt-4">
            Remember your password?
            <router-link to="/login" class="text-blue text-decoration-none">
                Login here
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authApiService } from "@/utils/ApiService";

const router = useRouter();
const step = ref(0);
const email = ref("");
const otp = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const countdown = ref(0);
const resendMessage = ref("");

const formattedCountdown = computed(() => {
    if (countdown.value <= 0) return "";
    const minutes = Math.floor(countdown.value / 60);
    const seconds = countdown.value % 60;
    return `(${minutes}:${seconds.toString().padStart(2, "0")})`;
});

const startCountdown = () => {
    countdown.value = 3;
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
        }
    }, 1000);
};

const resendOTP = async () => {
    startCountdown();
    resendMessage.value = "OTP sent successfully!";
    setTimeout(() => {
        resendMessage.value = "";
    }, 3000);
    try {
        const response = await authApiService.verifyEmail({
            email: email.value,
        });
        if (response.success) {
            errorMessage.value = "";
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Failed to send verification code";
    }
};

const verifyEmail = async () => {
    try {
        isLoading.value = true;
        const response = await authApiService.verifyEmail({
            email: email.value,
        });
        if (response.success) {
            step.value = 1;
            errorMessage.value = "";
            resendMessage.value = "";
            //startCountdown();
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Failed to send verification code";
    } finally {
        isLoading.value = false;
    }
};

const verifyOTP = async () => {
    try {
        isLoading.value = true;
        const response = await authApiService.verifyOTP({
            email: email.value,
            otp: otp.value,
        });
        if (response.success) {
            step.value = 2;
            errorMessage.value = "";
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Invalid verification code";
    } finally {
        isLoading.value = false;
    }
};

const resetPassword = async () => {
    try {
        if (newPassword.value !== confirmPassword.value) {
            errorMessage.value = "Passwords do not match";
            return;
        }

        isLoading.value = true;
        const response = await authApiService.resetPassword({
            email: email.value,
            otp: otp.value,
            newPassword: newPassword.value,
        });

        if (response.success) {
            errorMessage.value = "";
            successMessage.value =
                "Password reset successful. Redirecting to login page...";
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        }
    } catch (error) {
        errorMessage.value =
            error.response?.data?.error || "Password reset failed";
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.reset-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
