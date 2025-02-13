<template>
    <v-data-table
        :headers="combinedHeaders"
        :items="users"
        :search="search"
        :loading="loading"
        :sort-by="sortBy"
        @update:sort-by="(value) => (sortBy = value)"
    >
        <template
            v-for="header in additionalHeaders"
            :key="header.key"
            v-slot:[`item.${header.key}`]="{ item }"
        >
            <slot :name="header.key" :item="item">
                {{ item[header.key] }}
            </slot>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
            <slot name="actions" :item="item"></slot>
        </template>
    </v-data-table>
</template>

<script setup>
import { ref, computed } from "vue";
const props = defineProps({
    users: {
        type: Array,
        default: () => [
            {
                name: "",
                matrix_id: "",
                email: "",
                role: "",
            },
        ],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    search: {
        type: String,
        default: "",
    },
    additionalHeaders: {
        type: Array,
        default: () => [],
    },
    initialSort: {
        type: Array,
        default: () => [{ key: "name", order: "asc" }],
    },
});

const defaultHedaers = [
    {
        title: "Matrix ID",
        key: "matrix_id",
        align: "start",
        headerProps: { style: "font-weight: 600; font-size:20px;" },
    },
    {
        title: "Name",
        key: "name",
        align: "start",
        headerProps: { style: "font-weight: 600; font-size:20px;" },
    },
    {
        title: "Email",
        key: "email",
        align: "start",
        headerProps: { style: "font-weight: 600; font-size:20px;" },
    },
];
const actionHeaders = [
    {
        title: "",
        key: "actions",
        align: "end",
    },
];
const sortBy = ref(props.initialSort);
const combinedHeaders = computed(() => {
    return [...defaultHedaers, ...props.additionalHeaders, ...actionHeaders];
});
</script>
