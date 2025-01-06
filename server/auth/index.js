import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./src/routes/authRoute.js";

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Routes
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}.`);
});