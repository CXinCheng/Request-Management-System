import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import formRoutes from "./src/routes/requestSubmissionForm.js";

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Routes
app.use("/api/v1/requests", formRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});