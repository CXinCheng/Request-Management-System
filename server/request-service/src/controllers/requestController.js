import { db } from "../configs/db.js";

// API to get all requests for a student
export const getAllRequestsByStudent = async (req, res) => {
  console.log("API hit for getAllRequests:");

  const { studentId } = req.params;

  try {
    const requests = await db.any(
      `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, sr.module_code, u1.name AS user_name, u2.name AS approver_name, sr.class_type
        FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2
        WHERE r.id = sr.main_request_id
        AND r.user_id = u1.matrix_id
        AND sr.approver_id = u2.matrix_id
        AND r.is_archived = FALSE
        AND r.user_id = $1`, 
        [studentId]
        );
        console.log("requests:", requests)
        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: `Failed to fetch requests - ${error}` });
    }
  
};

// API to get a request's details for a student
export const getRequestDetails = async (req, res) => {
  console.log("API hit for getRequestDetails:", req.query);

  const { requestId } = req.params;
  const { module_code, class_type } = req.query;

    try {
        const request = await db.oneOrNone(
            `SELECT r.*, sr.*, u1.name AS user_name, u2.name AS approver_name, mod.name AS module_name
            FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2, request_management.modules mod
            WHERE r.id = sr.main_request_id
            AND r.user_id = u1.matrix_id
            AND sr.approver_id = u2.matrix_id
            AND sr.module_code = mod.code
            AND r.id = $1
            AND sr.module_code = $2
            AND sr.class_type = $3`,
            [requestId, module_code, class_type]
        );
      
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        console.log("getRequestDetails:", request)
        if (request.is_archived) {
            return res.status(403).json({ success: false, message: 'Request is archived and cannot be accessed' });
        }

        res.status(200).json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error('Error fetching request details:', error);
        res.status(500).json({ success: false, message: `Failed to fetch request details - ${error}` });
    }
};

// API for student to update a request
export const updateRequestByStudent = async (req, res) => {
  console.log("API hit for updateRequest:");

  const { requestId } = req.params;
  const { start_date, end_date, modules } = req.body;

  try {
    await db.tx(async (t) => {
      // Update requests table
      await t.oneOrNone(
        `UPDATE request_management.requests
            SET start_date_of_leave = $1, end_date_of_leave = $2
            WHERE id = $3
            RETURNING *`,
        [start_date, end_date, requestId]
      );

      // Update sub_request table
      await t.none(
        `UPDATE request_management.sub_request
            SET module_code = $1
            WHERE main_request_id = $2`,
        [modules[0].code, requestId]
      );
    });

        res.status(200).json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: `Failed to update request - ${error}` });
    }
  
};

// API for student to delete a request
export const deleteRequestByStudent = async (req, res) => {
  console.log("API hit for deleteRequestByStudent for class type:", req.query);
  const { requestId } = req.params;
  const { class_type } = req.query;

    try {
        // Ensure the request exists before deleting
        const existing = await db.any(
            `SELECT id, status
            FROM request_management.requests r, request_management.sub_request sr
            WHERE r.id = sr.main_request_id
            AND r.id = $1
            AND sr.class_type = $2`, 
            [requestId, class_type]
        );
        
        if (existing.length === 0) return res.status(404).json({ 
            success: false, 
            message: 'Request not found' 
        });

        console.log("existing:", existing)
        
        if (existing[0].status != 'Pending') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete a request that has already been processed'
            });
        }

    await db.tx(async (t) => {
      // Update sub_request table
      await t.none(
        `DELETE FROM request_management.sub_request sr 
                WHERE sr.main_request_id = $1
                AND sr.class_type = $2`,
        [requestId, class_type]
      );
      // Check if any sub_requests remain for this main_request_id
      const remainingSubRequests = await t.oneOrNone(
        `SELECT 1 FROM request_management.sub_request WHERE main_request_id = $1 LIMIT 1`,
        [requestId]
      );
      // Only delete the main request if no sub_requests remain
      if (!remainingSubRequests) {
        // delete only when sub_request is 0 
        // Update requests table
        await t.none(
          `DELETE FROM request_management.requests r 
                  WHERE r.id = $1`,
          [requestId]
        );
      }
    });

        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ success: false, message: `Failed to delete request - ${error}` });
    }
  
};

// API to get all requests for a professor
export const getAllRequestsByProfessor = async (req, res) => {
  console.log("API hit for getAllRequestsByProfessor:");

  const { profId } = req.params;

  try {
    const requests = await db.any(
      `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, sr.module_code, u1.name AS user_name, u2.name AS approver_name, sr.class_type
        FROM request_management.requests r, request_management.sub_request sr, request_management.users u1, request_management.users u2
        WHERE r.id = sr.main_request_id
        AND r.user_id = u1.matrix_id
        AND sr.approver_id = u2.matrix_id
        AND r.is_archived = FALSE
        AND sr.approver_id = $1`, 
        [profId]
        );
        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: `Failed to fetch requests - ${error}` });
    }
  
};

// API to get a request's details for a professor
export const updateRequestStatus = async (req, res) => {
  console.log("API hit for updateRequestStatus:");

  const { profId, requestId } = req.params;
  const { status, module_code, class_type } = req.body;

  try {
    const updatedRequest = await db.oneOrNone(
      `UPDATE request_management.sub_request
        SET status = $1, modified_at = NOW()
        WHERE main_request_id = $2
        AND approver_id = $3
        AND module_code = $4
        AND class_type = $5
        RETURNING *`,
      [status, requestId, profId, module_code, class_type]
    );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ success: false, message: `Failed to update request - ${error}` });
    }
  
};

export const getAllRequestsByModule = async (req, res) => {
  const { moduleCode } = req.params;
  try {
    const requests = await db.any(
      `SELECT r.id AS id, r.created_at, r.start_date_of_leave, r.end_date_of_leave, sr.status, sr.module_code, r.user_id 
            FROM request_management.requests r, request_management.sub_request sr
            WHERE r.id = sr.main_request_id 
            AND r.is_archived = FALSE
            AND sr.module_code = $1`,
            [moduleCode]
        );
        res.status(200).json({
            success: true,
            data: requests,
        });
    }
    catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: `Failed to fetch requests - ${error}` });
    }
}

export const archiveAllRequests = async (req, res) => {
  console.log("API hit for archiveAllRequests:");

  try {
    await db.none(
      `UPDATE request_management.requests
            SET is_archived = TRUE
            WHERE is_archived = FALSE`
        );
        res.status(200).json({
            success: true,
            message: 'All requests archived successfully.',
        });
    }
    catch (error) {
        console.error('Error archiving requests:', error);
        res.status(500).json({ 
            success: false,
            message: `Failed to archive requests - ${error}` 
        });
    }
};

export const getAllRequestsDetailsByProfessor = async (req, res) => {
  const { profId } = req.params;

  try {
    const requests = await db.any(
      `SELECT r.id AS id, r.created_at AS request_date, r.start_date_of_leave AS start_date, r.end_date_of_leave AS end_date, r.reason_of_leave AS reason, 
            r.blob_url AS attachment_url, sr.status, sr.module_code, u.name AS user_name, u.matrix_id, u.email
            FROM request_management.requests r, request_management.sub_request sr, request_management.users u
            WHERE r.id = sr.main_request_id
            AND r.user_id = u.matrix_id
            AND r.is_archived = FALSE
            AND sr.approver_id = $1`,
      [profId]
    );
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: `Failed to fetch requests - ${error}` });
  }
};
