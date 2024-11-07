<template>
    <div class="auth-container">
        <div class="auth-box">
            <component :is="currentComponent" />
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Login from "../components/Login.vue";
//import Register from "./Register.vue";
//import ResetPassword from "./ResetPassword.vue";

const route = useRoute();

const currentComponent = computed(() => {
    switch (route.name) {
        case "register":
            return Register;
        case "reset-password":
            return ResetPassword;
        default:
            return Login;
    }
});
</script>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
}

.auth-box {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
}
</style>
