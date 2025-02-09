import { db } from "../configs/db/db.js";


// API to get all requests for a student
export const getAllRequestsByStudent = async (req, res) => {
    console.log('API hit for getAllRequests:');

    const { studentId } = req.params;

    try {
        const requests = await db.any(
        `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, sr.module_code, u1.name AS user_name, u2.name AS approver_name
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
        res.status(500).json({ error: `Failed to fetch requests - ${error}` });
    }
  
};

// API to get all requests for a professor
export const getAllRequestsByProfessor = async (req, res) => {
    console.log('API hit for getAllRequestsByProfessor:');

    const { profId } = req.params;

    try {
        const requests = await db.any(
        `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, sr.module_code, u1.name AS user_name, u2.name AS approver_name
        FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2
        WHERE r.id = sr.main_request_id
        AND r.user_id = u1.matrix_id
        AND sr.approver_id = u2.matrix_id
        AND sr.approver_id = $1`, 
        [profId]
        );
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: `Failed to fetch requests - ${error}` });
    }
  
};


// API to get a request's details for a student
export const getRequestDetailsByStudent = async (req, res) => {
    console.log('API hit for getRequestDetailsByStudent:');

    const { studentId, requestId } = req.params;

    try {
        const request = await db.oneOrNone(
        `SELECT r.*, sr.*, u1.name AS user_name, u2.name AS approver_name
        FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2
        WHERE r.id = sr.main_request_id
        AND r.user_id = u1.matrix_id
        AND sr.approver_id = u2.matrix_id
        AND r.user_id = $1 
        AND r.id = $2`, 
        [studentId, requestId]
        );
        res.status(200).json(request);
    } catch (error) {
        console.error('Error fetching request details:', error);
        res.status(500).json({ error: `Failed to fetch request details - ${error}` });
    }
  
};

// API for student to update a request
export const updateRequestByStudent = async (req, res) => {
    console.log('API hit for updateRequest:');

    const { studentId, requestId } = req.params;
    const { start_date, end_date } = req.body;

    try {
        const updatedRequest = await db.oneOrNone(
        `UPDATE request_management.requests r
        SET r.start_date_of_leave = $1, r.end_date_of_leave = $2
        WHERE r.id = $3
        RETURNING *`, 
        [start_date, end_date, requestId]
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: `Failed to update request - ${error}` });
    }
  
};

// API to get a request's details for a student
export const updateRequestByProfessor = async (req, res) => {
    console.log('API hit for updateRequest:');

    const { studentId, requestId } = req.params;
    const { status } = req.body;

    try {
        const updatedRequest = await db.oneOrNone(
        `UPDATE request_management.sub_request sr
        SET sr.status = $1, sr.modified_at = NOW()
        WHERE r.id = $2
        RETURNING *`, 
        [status, requestId]
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: `Failed to update request - ${error}` });
    }
  
};