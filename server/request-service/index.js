import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import formRoutes from "./src/routes/requestSubmissionForm.js";
import cors from 'cors';
import { initialize, close } from './src/configs/db.js';

const app = express();

// Middleware
app.use(bodyParser.json());


// Allow all origins (for development purposes)
app.use(cors());

// Or allow specific origin (recommended for production)
app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
  })
);

// Access .env file
dotenv.config();

// Routes
app.use("/api/v1/requests", formRoutes);

// DB connection
await initialize();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Request service is running on port ${PORT}.`);
});

process.on('SIGTERM', () => {
    close();
});
