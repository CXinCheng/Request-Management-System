import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from '../../configs/db.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "Email and password are required" 
            });
        }

        const user = await db.oneOrNone(
            "SELECT * FROM request_management.users WHERE email = $1",
            [email]
        );

        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: "Invalid email or password"
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    matrix_id: user.matrix_id
                }
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};
