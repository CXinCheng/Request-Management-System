import express from "express";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const services = [
    {
        route: "/api/auth",
        target: "http://localhost:3001/api/v1/auth",
    },
    {
        route: "/api/user",
        target: "http://localhost:3001/api/v1/user",
    },
    {
        route: "/api/request",
        target: "http://localhost:3002/api/v1/requests",
    },
    {
        route: "/api/module",
        target: "http://localhost:3003/api/v1/module",
    },
];

services.forEach(({ route, target }) => {
    const proxyOptions = {
        target,
        changeOrigin: true,
        // pathRewrite: {
        //     [`^${route}`]: "",
        // },
    };

    app.use(route, createProxyMiddleware(proxyOptions));
});

app.use((_req, res) => {
    res.status(404).json({
        code: 404,
        status: "Error",
        message: "Route not found.",
        data: null,
    });
});

// Must be put after the proxy middleware!!!
app.use(express.json());

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
