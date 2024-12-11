<template>
    <v-app-bar :title="title"></v-app-bar>
</template>

<script setup>
defineProps({
    title: {
        type: String,
    }
});
</script>
