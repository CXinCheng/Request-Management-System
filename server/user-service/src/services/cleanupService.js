import db from '../configs/db/db.js';

class CleanupService {
    constructor() {
        this.interval = null;
    }

    start(intervalMs = 60 * 60000) { // Default 1 hour
        this.interval = setInterval(async () => {
            try {   
                const now = new Date();
                const res = await db.manyOrNone(
                    "DELETE FROM request_management.otp_store WHERE expires_at < $1 OR is_used = true", [now]
                );                
            } catch (error) {
                console.error('OTP cleanup error:', error);
            }
        }, intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export const cleanupService = new CleanupService();