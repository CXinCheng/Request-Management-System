import bcrypt from "bcrypt";
import { db } from "../../configs/db.js";
import Redis from 'ioredis';

// Publish to Queue when there's an update in email intervals
const redisPublisher = new Redis();

async function notifyIntervalChange(prof) {
  const message = JSON.stringify({ prof });
  await redisPublisher.publish('user:interval:update', message);
  console.log('Published interval update:', message);
}

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

        const { name, email, role, email_interval, password, faculty, contact, currentPassword } = req.body;


        const updates = { name, email, role };
        const queryParams = [];
        let paramCount = 1;

        const setStatements = Object.entries(updates)
            .map(([key, value]) => {
            queryParams.push(value);
            return `${key} = $${paramCount++}`;
            });
        
        if (email_interval) {
            setStatements.push(`email_interval = $${paramCount++}`);
            queryParams.push(email_interval);
        }

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
            RETURNING *`;

        // const updateQuery = `
        //     UPDATE request_management.users 
        //     SET ${setStatements.join(', ')}
        //     WHERE matrix_id = $${paramCount}
        //     RETURNING matrix_id`;

        const updatedUser = await db.oneOrNone(updateQuery, queryParams);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        
        notifyIntervalChange(updatedUser)
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

export const getProfessors = async (req, res) => {
    try {
        const ids = req.query.ids?.split(',');
        console.log("ids received:", ids)
        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: "No professor Matrix IDs provided" });
        }

        const professors = await db.manyOrNone(
            `SELECT name, matrix_id, email, faculty, contact_number 
            FROM request_management.users 
            WHERE role = 'Professor'
            AND matrix_id = ANY($1)`,
            [ids]
        );

        if (professors.length == 0) {
            return res.status(404).json({
                success: false,
                error: "No Professor Information Found"
            });
        }

        res.json({
            success: true,
            data: professors
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
