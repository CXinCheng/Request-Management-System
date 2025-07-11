import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./src/routes/authRoute.js";
import userRoutes from "./src/routes/userRoute.js";
import { cleanupService } from './src/services/cleanupService.js';
import { initialize, close } from './src/configs/db.js';

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// DB connection
await initialize();

cleanupService.start();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}.`);
});

process.on('SIGTERM', () => {
    close();
});
