<template>
    <v-container>
        <v-card class="mx-auto" max-width="800">
            <v-card-title class="text-h5 mb-4"> Profile Settings </v-card-title>
            <v-card-subtitle class="mb-4">
                {{ profile.role }}
            </v-card-subtitle>

            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="profile.name"
                                label="Name"
                                readonly
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="profile.matrix_id"
                                label="Matrix ID"
                                readonly
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="profile.email"
                                label="Email"
                                :rules="emailRules"
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="profile.contact"
                                label="Contact Number"
                                :rules="contactRules"
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="profile.faculty"
                                :items="faculties"
                                label="Faculty"
                                density="comfortable"
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <v-row>
                        <v-col cols="12">
                            <v-expansion-panels>
                                <v-expansion-panel>
                                    <v-expansion-panel-title>
                                        Change Password
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        <v-row>
                                            <v-col cols="12" md="6">
                                                <v-text-field
                                                    v-model="
                                                        passwordForm.current
                                                    "
                                                    label="Current Password"
                                                    type="password"
                                                    density="comfortable"
                                                />
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field
                                                    v-model="passwordForm.new"
                                                    label="New Password"
                                                    type="password"
                                                    :rules="passwordRules"
                                                    density="comfortable"
                                                />
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                offset-lg="6"
                                            >
                                                <v-text-field
                                                    v-model="
                                                        passwordForm.confirm
                                                    "
                                                    label="Confirm New Password"
                                                    type="password"
                                                    :rules="
                                                        confirmPasswordRules
                                                    "
                                                    density="comfortable"
                                                />
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="saveProfile"
                    :loading="loading"
                    :disabled="!valid"
                >
                    Save Changes
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNotificationStore } from "@/utils/NotificationStore";
import { userApiService } from "@/utils/ApiService";

const notificationStore = useNotificationStore();

const valid = ref(false);
const loading = ref(false);
const form = ref(null);
const profile = ref({
    name: "",
    matrix_id: "",
    email: "",
    contact: "",
    faculty: "",
    role: "",
});
const passwordForm = ref({
    current: "",
    new: "",
    confirm: "",
});

const faculties = [
    "Faculty of Arts & Social Sciences",
    "School of Business",
    "School of Computing",
    "School of Continuing & Lifelong Education",
    "Faculty of Dentistry",
    "College of Design and Engineering",
    "Duke-NUS Medical School",
    "College of Humanities and Sciences",
    "NUS College",
    "NUS Graduate School",
    "Faculty of Law",
    "Yong Loo Lin School of Medicine (including Nursing)",
    "Yong Siew Toh Conservatory of Music",
    "Saw Swee Hock School of Public Health",
    "Lee Kuan Yew School of Public Policy",
    "Faculty of Science",
    "Yale-NUS College",
    "Institute of Systems Science",
];

const emailRules = [
    (v) => !!v || "Email is required",
    (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const contactRules = [
    (v) => {
        if (!v) return true;
        const trimmed = v.trim();
        const pattern = /^$|^\+?\d+(?:[ -]?\d+)*$/;
        return pattern.test(trimmed) || "Contact number must be valid";
    },
];

const passwordRules = [
    (v) => !v || v.length >= 8 || "Password must be at least 8 characters",
    (v) => {
        if (v && !passwordForm.value.confirm) {
            return "Please confirm your password";
        }
        return true;
    },
];

const confirmPasswordRules = [
    (v) => {
        if (passwordForm.value.new && !v) {
            return "Confirm password is required";
        }
        return true;
    },
    (v) => !v || v === passwordForm.value.new || "Passwords must match",
];

onMounted(() => {
    try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            profile.value = {
                name: userData.name,
                matrix_id: userData.matrix_id,
                role: userData.role,
                email: userData.email,
                contact: userData.contact,
                faculty: userData.faculty,
            };
        }
    } catch (error) {
        notificationStore.showNotification({
            message: "Failed to load profile data",
            color: "error",
        });
    }
});

async function saveProfile() {
    if (!form.value.validate()) return;
    if (passwordForm.value.new && !passwordForm.value.current) {
        notificationStore.showNotification({
            message: "Current password is required to change password",
            color: "error",
        });
        return;
    }
    if (profile.value.contact) {
        profile.value.contact = profile.value.contact.replace(/\s+/g, "");
    }

    try {
        loading.value = true;
        const userData = {
            ...profile.value,
            ...(passwordForm.value.current && {
                currentPassword: passwordForm.value.current,
                password: passwordForm.value.new,
            }),
        };

        const response = await userApiService.updateUser(userData);

        if (response.success) {
            notificationStore.showNotification({
                message: "Profile updated successfully",
                color: "success",
            });
            passwordForm.value = { current: "", new: "" };
            localStorage.setItem("user", JSON.stringify(profile.value));
        }
    } catch (error) {
        if (error.status === 401) {
            notificationStore.showNotification({
                message: "Incorrect current password",
                color: "error",
            });
        } else {
            notificationStore.showNotification({
                message: "Failed to update profile",
                color: "error",
            });
        }
    } finally {
        loading.value = false;
    }
}
</script>
