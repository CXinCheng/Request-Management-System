import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../configs/db/db.js';

// Request password reset
const requestReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await db.oneOrNone(
            'SELECT id, email FROM request_management.users WHERE email = $1',
            [email]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // TODO: Send reset email with token
        // For development, return token in response
        res.json({
            message: 'Password reset link sent',
            resetToken // Remove in production
        });

    } catch (error) {
        console.error('Reset password request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                error: 'Token and new password are required' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await db.none(
            'UPDATE request_management.users SET password = $1 WHERE id = $2',
            [hashedPassword, decoded.userId]
        );

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { requestReset, resetPassword };