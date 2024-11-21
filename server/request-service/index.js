import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import formRoutes from "./src/routes/requestSubmissionForm.js";
import cors from 'cors';

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});