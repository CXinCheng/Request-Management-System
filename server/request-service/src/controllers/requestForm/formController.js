import { validationResult } from "express-validator";
import multer from "multer";
import { db } from "../../configs/db.js";
import { v1 } from "uuid";
import { ContainerClient } from '@azure/storage-blob';


const containerClient = new ContainerClient(process.env.AZURE_CONTAINER_SAS_URL);

// Function to upload file to Azure Blob Storage
const uploadToAzureBlob = async (file) => {
    try{ 
        const containerClient = new ContainerClient(process.env.AZURE_CONTAINER_SAS_URL);

        // Generate a unique blob name
        const blobName = `${Date.now()}-${file.originalname}-${v1()}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        // Upload the file to Azure
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
        });

        return blockBlobClient.url; // Return the blob URL
    } catch (error) {
        throw new Error("File upload failed");
    }

};

export const upload = multer({
    storage: multer.memoryStorage(),
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

        console.log("received request body:", req.body)
        // Validate incoming data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { student, reasonOfLeave, startDateOfLeave, endDateOfLeave, modules, approvers, classTypes } = req.body;
        let parsedClassTypes = classTypes;
        if (typeof classTypes === 'string') {
            try {
                parsedClassTypes = JSON.parse(classTypes);
            } catch (e) {
                return res.status(400).json({ message: "classTypes could not be parsed as array" });
            }
        }
        if (!Array.isArray(parsedClassTypes)) {
            return res.status(400).json({ message: "classTypes must be an array" });
        }
        console.log("classTypes:", parsedClassTypes)
        // Handle file upload
        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.status(400).json({ message: "File is required" });
        }

        console.log("uploadedFile:", uploadedFile)

        const blobUrl = await uploadToAzureBlob(uploadedFile)

        // Check if modules and approvers have the same length
        const moduleArr = modules.split(",")
        const approverArr = approvers.split(",")

        if (moduleArr.length !== approverArr.length) {
            return res.status(400).json({ message: "Modules and approvers length mismatch" });
        }

        // We use transaction here to ensure if subrequest fails to add, main request should not be added as well
        // If any part fails, the transaction will automatically rollback 
        await db.tx(async (t) => {
            // Create the main request
            console.log("creating main request...")
            const request = await t.one(
                `
                INSERT INTO request_management.requests (
                    created_at, start_date_of_leave, end_date_of_leave, reason_of_leave, user_id, blob_url
                ) VALUES (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5)
                RETURNING id
                `,
                [startDateOfLeave, endDateOfLeave, reasonOfLeave, student, blobUrl]
            );

            // Create the sub requests
            const subRequestsPromises = moduleArr.map((module, index) => {
                console.log("creating subrequests for class types:", parsedClassTypes[index])
                return t.one(
                    `
                    INSERT INTO request_management.sub_request (
                        status, modified_at, module_code, approver_id, main_request_id, class_type
                    ) VALUES ('Pending', CURRENT_TIMESTAMP, $1, $2, $3, $4)
                    RETURNING main_request_id
                    `,
                    [module, approverArr[index], request.id, parsedClassTypes[index]]
                );
            });

            // Wait for all sub requests to be created
            const subRequests = await Promise.all(subRequestsPromises);

        });
        console.log("subrequests created")

        res.status(200).json({ message: "Form submitted successfully", data: "Completed"});

    } catch (err) {
        res.status(500).json({ message: "Error submitting form", error: err.message });
    }
};
