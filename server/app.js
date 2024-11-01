const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authController = require("./auth/authController");
const db = require("./db/db");

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

// Login endpoint
app.post("/api/login", authController.login);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});