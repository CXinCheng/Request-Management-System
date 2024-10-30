const express = require("express");
const pgp = require("pg-promise")();
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// Access .env file
dotenv.config();

const databaseConfig = {
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
};

const db = pgp(databaseConfig);

// Login endpoint
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email and password are required" 
            });
        }

        // Query user from database
        const user = await db.oneOrNone(
            "SELECT * FROM request_management.users WHERE email = $1",
            [email]
        );

        // Check if user exists
        if (!user) {
            return res.status(401).json({ 
                error: "Invalid email or password" 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: "Invalid email or password" 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return success response
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                matrix_id: user.matrix_id
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            error: "Internal server error" 
        });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
