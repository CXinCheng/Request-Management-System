import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { initialize, close } from './src/configs/db/db.js';

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Routes
// app.use("/api/v1/auth", authRoutes);

// DB connection
await initialize();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}.`);
});

process.on('SIGTERM', () => {
    close();
});
