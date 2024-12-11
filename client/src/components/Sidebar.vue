<template>
    <v-navigation-drawer permanent color="blue-darken-4">
        <v-list nav>
            <v-list-item title="Request Management System"></v-list-item>
            <v-divider class="border-opacity-25"></v-divider>
            <v-list-subheader class="text-caption ml-4" style="color: inherit"
                >ACADEMIC</v-list-subheader
            >
            <v-list-item
                v-for="item in items"
                active-class="SelectedTile-active"
                :key="item.title"
                link
                :to="item.href"
            >
                <template v-slot:prepend>
                    <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <template v-slot:append>
            <v-list nav>
                <v-list-subheader
                    class="text-caption ml-4"
                    style="color: inherit"
                    >SETTINGS</v-list-subheader
                >
                <v-list-item
                    title="Account Settings"
                    prepend-icon="mdi-cog-outline"
                    link
                ></v-list-item>
                <v-list-item
                    title="Notification Preferences"
                    prepend-icon="mdi-bell-outline"
                    link
                ></v-list-item>
            </v-list>
            <v-divider class="border-opacity-25"></v-divider>
            <div class="pa-2">
                <v-btn
                    variant="text"
                    prepend-icon="mdi-logout"
                    block
                    @click="handleLogout"
                >
                    Log Out
                </v-btn>
            </div>
            <div class="pa-5 mb-4"></div>
        </template>
    </v-navigation-drawer>
</template>

<script>
import { useRouter } from "vue-router";

export default {
    name: "Sidebar",
    setup() {
        const router = useRouter();

        const handleLogout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        };

        return { handleLogout };
    },
    data() {
        return {
            items: [
                {
                    title: "Dashboard",
                    icon: "mdi-view-dashboard-outline",
                    href: "/dashboard",
                },
                {
                    title: "Modules",
                    icon: "mdi-book-open-variant-outline",
                    href: "/modules",
                },
                {
                    title: "Leave Applications",
                    icon: "mdi-text-box-edit-outline",
                    href: "/leave",
                },
                {
                    title: "All Requests",
                    icon: "mdi-list-box-outline",
                    href: "/requests",
                },
            ],
        };
    },
};
</script>
