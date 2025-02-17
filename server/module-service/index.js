import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { initialize, close } from './src/configs/db.js';
import updateService from "./src/services/updateService.js";
import moduleRoute from "./src/routes/moduleRoute.js";

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Routes
app.use("/api/v1/module", moduleRoute);

// DB connection
await initialize();

// Update Module DB
updateService.updateModule();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Module service is running on port ${PORT}.`);
});

process.on('SIGTERM', () => {
    close();
});
