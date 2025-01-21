import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        port: 3000,
        proxy: {
            "/api/v1/auth": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
            "/api/v1/user": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
            "/api/v1/requests": {
                target: "http://localhost:3002",
                changeOrigin: true,
            },
        },
    },
});
