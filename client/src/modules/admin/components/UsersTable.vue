<template>
    <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        :sort-by="[{ key: 'role', order: 'asc' }]"
    >
        <template v-slot:[`item.actions`]="{ item }">
            <slot name="actions" :item="item"></slot>
        </template>
    </v-data-table>
</template>

<script setup>
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
    actionHeader: {
        type: Array,
        default: [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    search: {
        type: String,
        default: "",
    },
});

const headers = [
    {
        title: "Name",
        key: "name",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Matrix ID",
        key: "matrix_id",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Email",
        key: "email",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "Role",
        key: "role",
        align: "start",
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
    {
        title: "",
        key: "actions",
        align: "end",
        sortable: false,
        headerProps: {
            style: "font-weight: 600; font-size:20px;",
        },
    },
];
</script>
