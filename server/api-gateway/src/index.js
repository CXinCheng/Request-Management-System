import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";
import {
    getAllModulesWithEducators,
    getAllStudentsByModule,
    getEnrolledStudentsByModule,
    getModulesTakenByStudent
} from "./module/moduleController.js";

// Access .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const USER_SERVICE_URL = process.env.MODULE_SERVICE_URL || "http://localhost:3001";
const REQUEST_SERVICE_URL = process.env.REQUEST_SERVICE_URL || "http://localhost:3002";
const MODULE_SERVICE_URL = process.env.MODULE_SERVICE_URL || "http://localhost:3003"; 

const services = [
    {
        route: "/api/auth",
        target: `${USER_SERVICE_URL}/api/v1/auth`,
    },
    {
        route: "/api/user",
        target: `${USER_SERVICE_URL}/api/v1/user`,
    },
    {
        route: "/api/request",
        target: `${REQUEST_SERVICE_URL}/api/v1/request`,
    },
    {
        route: "/api/module",
        target: `${MODULE_SERVICE_URL}/api/v1/module`,
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

// Aggreate API call
app.use("/api/gateway/modules", getAllModulesWithEducators);
app.use(
    "/api/gateway/students/enrolled/:moduleCode",
    getEnrolledStudentsByModule
);
app.use("/api/gateway/students/:studentID/modules", getModulesTakenByStudent);
// app.use("/api/gateway/students/:moduleCode", getAllStudentsByModule);


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
