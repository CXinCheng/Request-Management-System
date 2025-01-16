import bcrypt from "bcrypt";
import { db } from "../../configs/db/db.js";

const register = async (req, res) => {
    try {
        const { name, email, password, matrix_id, role } = req.body;

        if (!name || !email || !password || !matrix_id || !role) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        const existingUser = await db.manyOrNone(
            "SELECT * FROM request_management.users WHERE email = $1 OR matrix_id = $2",
            [email, matrix_id]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                error: "User with this email or matrix ID already exists"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await db.one(
            `INSERT INTO request_management.users (name, email, password, matrix_id, role) 
             VALUES ($1, $2, $3, $4, $5::request_management.user_role) 
             RETURNING id, name, email, role, matrix_id`,
            [name, email, hashedPassword, matrix_id, role]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data : {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                matrix_id: newUser.matrix_id
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export { register };