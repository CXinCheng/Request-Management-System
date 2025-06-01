import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { initialize, close } from "./src/configs/db.js";
import UpdateService from "./src/services/updateService.js";
import moduleRoute from "./src/routes/moduleRoute.js";
import cors from 'cors';

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

app.use("/api/v1/module", moduleRoute);
app.use(cors());

// DB connection
await initialize();

await new UpdateService().initialize();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Module service is running on port ${PORT}.`);
});

process.on("SIGTERM", () => {
    close();
});
