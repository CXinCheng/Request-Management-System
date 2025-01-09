import { validationResult } from "express-validator";
import multer from "multer";
import { db } from "../../configs/db/db.js";

export const upload = multer({
    dest: "../../uploads", // Directory to store uploaded files
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Only PDF, JPEG, or PNG files are allowed"));
        }
        cb(null, true);
    },
});

// https://www.digitalocean.com/community/tutorials/how-to-handle-form-inputs-efficiently-with-express-validator-in-express-js
export const submitForm = async (req, res) => {
    try {
        // Validate incoming data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { student, reasonOfLeave, startDateOfLeave, endDateOfLeave, modules, approvers } = req.body;

        // Handle file upload
        // const uploadedFile = req.file;
        // if (!uploadedFile) {
        //     return res.status(400).json({ message: "File is required" });
        // }

        // Check if modules and approvers have the same length
        if (modules.length !== approvers.length) {
            return res.status(400).json({ message: "Modules and approvers length mismatch" });
        }

        // We use transaction here to ensure if subrequest fails to add, main request should not be added as well
        // If any part fails, the transaction will automatically rollback 
        await db.tx(async (t) => {
            // Create the main request
            const request = await t.one(
                `
                INSERT INTO request_management.requests (
                    created_at, date_of_request, reason_of_leave, user_id
                ) VALUES (CURRENT_TIMESTAMP, $1, $2, $3)
                RETURNING id
                `,
                [startDateOfLeave, reasonOfLeave, student]
            );

            // Create the sub requests
            const subRequestsPromises = modules.map((module, index) => {
                return t.one(
                    `
                    INSERT INTO request_management.sub_request (
                        status, modified_at, module_id, approver_id, consolidated_id
                    ) VALUES ('Pending', CURRENT_TIMESTAMP, $1, $2, $3)
                    RETURNING id
                    `,
                    [module, approvers[index], request.id]
                );
            });

            // Wait for all sub requests to be created
            const subRequests = await Promise.all(subRequestsPromises);

        });

        res.status(200).json({ message: "Form submitted successfully", data: "Completed"});

    } catch (err) {
        res.status(500).json({ message: "Error submitting form", error: err.message });
    }
};
