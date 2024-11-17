import bcrypt from "bcrypt";
import db from "../../configs/db/db.js";

const register = async (req, res) => {
    try {
        const { name, email, password, matrix_id, role } = req.body;

        // Input validation
        if (!name || !email || !password || !matrix_id || !role) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        // Check if email already exists
        const existingUser = await db.oneOrNone(
            "SELECT * FROM request_management.users WHERE email = $1 OR matrix_id = $2",
            [email, matrix_id]
        );

        if (existingUser) {
            return res.status(400).json({
                error: "User with this email or matrix ID already exists"
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const newUser = await db.one(
            `INSERT INTO request_management.users (name, email, password, matrix_id, role) 
             VALUES ($1, $2, $3, $4, $5::request_management.user_role) 
             RETURNING id, name, email, role, matrix_id`,
            [name, email, hashedPassword, matrix_id, role]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export { register };