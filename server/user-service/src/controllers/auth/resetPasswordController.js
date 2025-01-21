import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { db } from "../../configs/db.js";
import nodemailer from "nodemailer";

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required",
            });
        }

        const user = await db.oneOrNone(
            "SELECT id, email FROM request_management.users WHERE email = $1",
            [email]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User with this email address does not exist",
            });
        }

        const otp = generateOTP();
        const expiryTime = new Date(Date.now() + 15 * 60000); // 15 minutes

        await db.none(
            `INSERT INTO request_management.otp_store 
            (user_email, otp_code, expires_at) 
            VALUES ($1, $2, $3)`,
            [email, otp, expiryTime]
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            // to: email,
            to: process.env.EMAIL, // For development
            subject: "Password Reset Request",
            html: `
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password.</p>
            <p>Your one-time password (OTP) is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 15 minutes.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Best regards,<br>Request Management System Team</p>
            `,
            text: `
            Password Reset Request
            
            Hello,
            
            We received a request to reset your password.
            Your one-time password (OTP) is: ${otp}
            
            This OTP will expire in 15 minutes.
            
            If you did not request a password reset, please ignore this email.
            
            Best regards,
            Request Management System Team
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email send error:", error);
                return res.status(500).json({

                    success: false,
                    error: "Internal server error",
                });
            }
        });

        // For development, return token in response
        res.json({
            success: true,
            message: "Password reset link sent",
            otp, // Remove in production
        });
    } catch (error) {
        console.error("Reset password request error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Email and OTP are required",
            });
        }

        const otpRecord = await db.oneOrNone(
            "SELECT * FROM request_management.otp_store " +
                "WHERE user_email = $1" +
                "ORDER BY created_at DESC LIMIT 1",
            [email]
        );

        if (
            !otpRecord ||
            otpRecord.otp_code !== otp ||
            otpRecord.expires_at < new Date() ||
            otpRecord.is_used
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired OTP",
            });
        }

        res.json({
            success: true,
            message: "OTP is verified successfully",
            data: {},
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Email, OTP and new password are required",
            });
        }

        const otpRecord = await db.oneOrNone(
            "SELECT * FROM request_management.otp_store " +
                "WHERE user_email = $1" +
                "ORDER BY created_at DESC LIMIT 1",
            [email]
        );

        if (
            !otpRecord ||
            otpRecord.otp_code !== otp ||
            otpRecord.expires_at < new Date() ||
            otpRecord.is_used
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const existingUser = await db.oneOrNone(
            "SELECT password FROM request_management.users WHERE email = $1",
            [email]
        );

        const isSamePassword = await bcrypt.compare(newPassword, existingUser.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: "New password must be different from current password"
            });
        }

        await db.none(
            "UPDATE request_management.otp_store SET is_used = true WHERE id = $1",
            [otpRecord.id]
        );

        await db.none(
            "UPDATE request_management.users SET password = $1 WHERE email = $2",
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: "Password is reset successfully",
            data: {},
        });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export { verifyEmail, verifyOTP, resetPassword };
