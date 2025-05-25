import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: "Access denied. No token provided.",
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Access denied. Invalid token format.",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: "Invalid or expired token.",
        });
    }
};

export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                error: "Access denied. Role verification failed.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: "Access denied. Insufficient permissions.",
            });
        }
        next();
    };
};

export const checkResourceOwnership = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({
            success: false,
            error: "Access denied. Role verification failed.",
        });
    }

    if (req.user.role === "Admin" || req.user.id === req.params.matrix_id) {
        next();
    } else {        
        return res.status(403).json({
            success: false,
            error: "Access denied. Insufficient permissions.",
        });
    }
};
