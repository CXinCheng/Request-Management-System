import { db } from "../configs/db/db.js";


// API to get all requests for a student
export const getAllRequestsByStudent = async (req, res) => {
    console.log('API hit for getAllRequests:');

    const { studentId } = req.params;

    try {
        const requests = await db.any(
        `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, u1.name AS user_name, u2.name AS approver_name
        FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2
        WHERE r.id = sr.main_request_id
        AND r.user_id = u1.matrix_id
        AND sr.approver_id = u2.matrix_id
        AND r.user_id = $1`, 
        [studentId]
        );
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: `Failed to fetch requests ${error}` });
    }
  
};


