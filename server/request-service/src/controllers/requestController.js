import db from "../configs/db/db.js";


// API to get all requests for a student
export const getAllRequests = async (req, res) => {
    console.log('API hit for getAllRequests:');

    const { studentId } = req.params;

    try {
        const requests = await db.any(
        `SELECT id, created_at, date_of_request, reason_of_leave, user_id
        FROM request_management.requests
        WHERE user_id = $1`, 
        [studentId]
        );
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: `Failed to fetch requests ${error}` });
    }
  
};


