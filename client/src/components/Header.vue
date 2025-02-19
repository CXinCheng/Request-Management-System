<template>
    <v-app-bar>
        <v-toolbar-title>
            <slot name="title">{{ title }}</slot>
        </v-toolbar-title>
    </v-app-bar>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: "",
    },
});
</script>