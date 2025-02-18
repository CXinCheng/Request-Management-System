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

// Get all professors
export const getAllProfessors = async (req, res) => {
    try {
        const users = await db.manyOrNone(
            "SELECT name, email, role, matrix_id FROM request_management.users WHERE role = 'Professor'"
        );
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error fetching professors:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const users = await db.manyOrNone(
            "SELECT name, email, role, matrix_id FROM request_management.users WHERE role = 'Student'"
        );
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

// Get user by matrix_id
export const getUser = async (req, res) => {
    try {
        const { matrix_id } = req.params;
        const user = await db.oneOrNone(
            "SELECT name, email, role, matrix_id, faculty, contact_number FROM request_management.users WHERE matrix_id = $1",
            [matrix_id]
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

// Update user
export const updateUser = async (req, res) => {
    try {
        const { matrix_id } = req.params;
        const user = await db.oneOrNone(
            "SELECT * FROM request_management.users WHERE matrix_id = $1",
            [matrix_id]
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const { name, email, role, password, faculty, contact, currentPassword } = req.body;

        const updates = { name, email, role };
        const queryParams = [];
        let paramCount = 1;

        const setStatements = Object.entries(updates)
            .map(([key, value]) => {
            queryParams.push(value);
            return `${key} = $${paramCount++}`;
            });
        
        if (currentPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid current password"
                });
            }
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            setStatements.push(`password = $${paramCount++}`);
            queryParams.push(hashedPassword);
        }

        if (faculty) {
            setStatements.push(`faculty = $${paramCount++}`);
            queryParams.push(faculty);
        }

        if (contact) {
            setStatements.push(`contact_number = $${paramCount++}`);
            queryParams.push(contact);
        }

        queryParams.push(matrix_id);
        const updateQuery = `
            UPDATE request_management.users 
            SET ${setStatements.join(', ')}
            WHERE matrix_id = $${paramCount}
            RETURNING matrix_id`;

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