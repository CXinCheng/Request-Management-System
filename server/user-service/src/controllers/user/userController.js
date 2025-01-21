import bcrypt from "bcrypt";
import { db } from "../../configs/db.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await db.manyOrNone(
            "SELECT name, email, role, matrix_id FROM request_management.users"
        );
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, matrix_id, role } = req.body;

        if (!name || !email || !password || !matrix_id || !role) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        const existingUser = await db.oneOrNone(
            "SELECT * FROM request_management.users WHERE email = $1 OR matrix_id = $2",
            [email, matrix_id]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User with this email or matrix ID already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.one(
            `INSERT INTO request_management.users (name, email, password, matrix_id, role) 
             VALUES ($1, $2, $3, $4, $5::request_management.user_role) 
             RETURNING name, email, role, matrix_id`,
            [name, email, hashedPassword, matrix_id, role]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { matrix_id } = req.params;
        const { name, email, role, password } = req.body;

        let updateQuery = `
            UPDATE request_management.users 
            SET name = $1, 
                email = $2, 
                role = $3::request_management.user_role
        `;
        let queryParams = [name, email, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, password = $4`;
            queryParams.push(hashedPassword);
        }

        updateQuery += ` WHERE matrix_id = $${queryParams.length + 1} RETURNING name, email, role, matrix_id`;
        queryParams.push(matrix_id);

        const updatedUser = await db.oneOrNone(updateQuery, queryParams);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { matrix_id } = req.params;

        const result = await db.result(
            "DELETE FROM request_management.users WHERE matrix_id = $1",
            [matrix_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};