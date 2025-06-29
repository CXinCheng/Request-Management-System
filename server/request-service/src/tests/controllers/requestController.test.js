import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

import { _setDbForTest } from "../../configs/db.js";
import {
    getAllRequestsByStudent,
    getRequestDetails,
    updateRequestByStudent,
    deleteRequestByStudent,
    getAllRequestsByProfessor,
    updateRequestStatus,
    getAllRequestsByModule,
    archiveAllRequests,
    getAllRequestsDetailsByProfessor
} from "../../controllers/requestController.js";

describe("Request Controller Unit Tests", () => {
    let req, res;

    // Fake database object
    const mockDb = {
        any: sinon.stub(),
        oneOrNone: sinon.stub(),
        none: sinon.stub(),
        tx: sinon.stub(),
    };

    beforeEach(() => {
        _setDbForTest(mockDb);

        for (let key in mockDb) {
            mockDb[key].reset();
        }

        req = {
            params: {},
            body: {},
            query: {},
            headers: { authorization: "Bearer valid-token" },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        // Clean up after each test
        _setDbForTest(null);
        sinon.restore();
    });

    describe("getAllRequestsByStudent", () => {
        it("should return all requests for a student successfully", async () => {
            req.params.studentId = "A1234567B";
            const mockRequests = [
                {
                    id: 1,
                    created_at: "2024-01-01",
                    start_date_of_leave: "2024-01-15",
                    end_date_of_leave: "2024-01-16",
                    status: "Pending",
                    module_code: "CS1010",
                    user_name: "John Doe",
                    approver_name: "Dr. Smith"
                }
            ];
            mockDb.any.resolves(mockRequests);

            await getAllRequestsByStudent(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                data: mockRequests
            }));
        });

        it("should handle database errors", async () => {
            req.params.studentId = "A1234567B";
            mockDb.any.rejects(new Error("Database connection failed"));

            await getAllRequestsByStudent(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to fetch requests - Error: Database connection failed"
            }));
        });
    });

    describe("getRequestDetails", () => {
        it("should return request details successfully", async () => {
            req.params.requestId = "1";
            req.query.module_code = "CS1010";
            const mockRequest = {
                id: 1,
                user_name: "John Doe",
                approver_name: "Dr. Smith",
                status: "Pending",
                module_code: "CS1010",
                is_archived: false
            };
            mockDb.oneOrNone.resolves(mockRequest);

            await getRequestDetails(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                data: mockRequest
            }));
        });

        it("should return 404 when request not found", async () => {
            req.params.requestId = "999";
            req.query.module_code = "CS1010";
            mockDb.oneOrNone.resolves(null);

            await getRequestDetails(req, res);

            assert(res.status.calledWith(404));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Request not found"
            }));
        });

        it("should return 403 when request is archived", async () => {
            req.params.requestId = "1";
            req.query.module_code = "CS1010";
            const mockRequest = {
                id: 1,
                is_archived: true
            };
            mockDb.oneOrNone.resolves(mockRequest);

            await getRequestDetails(req, res);

            assert(res.status.calledWith(403));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Request is archived and cannot be accessed"
            }));
        });

        it("should handle database errors", async () => {
            req.params.requestId = "1";
            req.query.module_code = "CS1010";
            mockDb.oneOrNone.rejects(new Error("Database error"));

            await getRequestDetails(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to fetch request details - Error: Database error"
            }));
        });
    });

    describe("updateRequestByStudent", () => {
        it("should update request successfully", async () => {
            req.params.requestId = "1";
            req.body = {
                start_date: "2024-01-15",
                end_date: "2024-01-16",
                modules: [{ code: "CS1010" }]
            };

            const mockTransaction = {
                oneOrNone: sinon.stub().resolves({ id: 1 }),
                none: sinon.stub().resolves()
            };
            mockDb.tx.callsArgWith(0, mockTransaction);

            await updateRequestByStudent(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                message: "Request updated successfully"
            }));
            assert(mockTransaction.oneOrNone.calledOnce);
            assert(mockTransaction.none.calledOnce);
        });

        it("should handle database errors during update", async () => {
            req.params.requestId = "1";
            req.body = {
                start_date: "2024-01-15",
                end_date: "2024-01-16",
                modules: [{ code: "CS1010" }]
            };

            mockDb.tx.rejects(new Error("Update failed"));

            await updateRequestByStudent(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to update request - Error: Update failed"
            }));
        });
    });

    describe("deleteRequestByStudent", () => {
        it("should delete request successfully", async () => {
            req.params.requestId = "1";
            const mockExistingRequest = {
                id: 1,
                status: "Pending"
            };

            const mockTransaction = {
                none: sinon.stub().resolves()
            };

            mockDb.oneOrNone.resolves(mockExistingRequest);
            mockDb.tx.callsArgWith(0, mockTransaction);

            await deleteRequestByStudent(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                message: "Request deleted successfully"
            }));
            assert(mockTransaction.none.calledTwice);
        });

        it("should return 404 when request not found", async () => {
            req.params.requestId = "999";
            mockDb.oneOrNone.resolves(null);

            await deleteRequestByStudent(req, res);

            assert(res.status.calledWith(404));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Request not found"
            }));
        });

        it("should return 403 when request is not pending", async () => {
            req.params.requestId = "1";
            const mockExistingRequest = {
                id: 1,
                status: "Approved"
            };
            mockDb.oneOrNone.resolves(mockExistingRequest);

            await deleteRequestByStudent(req, res);

            assert(res.status.calledWith(403));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Cannot delete a request that has already been processed"
            }));
        });

        it("should handle database errors during deletion", async () => {
            req.params.requestId = "1";
            const mockExistingRequest = {
                id: 1,
                status: "Pending"
            };
            mockDb.oneOrNone.resolves(mockExistingRequest);
            mockDb.tx.rejects(new Error("Delete failed"));

            await deleteRequestByStudent(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to delete request - Error: Delete failed"
            }));
        });
    });

    describe("getAllRequestsByProfessor", () => {
        it("should return all requests for a professor successfully", async () => {
            req.params.profId = "P1234567X";
            const mockRequests = [
                {
                    id: 1,
                    created_at: "2024-01-01",
                    start_date_of_leave: "2024-01-15",
                    end_date_of_leave: "2024-01-16",
                    status: "Pending",
                    module_code: "CS1010",
                    user_name: "John Doe",
                    approver_name: "Dr. Smith"
                }
            ];
            mockDb.any.resolves(mockRequests);

            await getAllRequestsByProfessor(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                data: mockRequests
            }));
        });

        it("should handle database errors", async () => {
            req.params.profId = "P1234567X";
            mockDb.any.rejects(new Error("Database error"));

            await getAllRequestsByProfessor(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to fetch requests - Error: Database error"
            }));
        });
    });

    describe("updateRequestStatus", () => {
        it("should update request status successfully", async () => {
            req.params.profId = "P1234567X";
            req.params.requestId = "1";
            req.body = {
                status: "Approved",
                module_code: "CS1010"
            };
            const mockUpdatedRequest = {
                id: 1,
                status: "Approved",
                module_code: "CS1010"
            };
            mockDb.oneOrNone.resolves(mockUpdatedRequest);

            await updateRequestStatus(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith(mockUpdatedRequest));
        });

        it("should return 404 when request not found", async () => {
            req.params.profId = "P1234567X";
            req.params.requestId = "999";
            req.body = {
                status: "Approved",
                module_code: "CS1010"
            };
            mockDb.oneOrNone.resolves(null);

            await updateRequestStatus(req, res);

            assert(res.status.calledWith(404));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Request not found"
            }));
        });

        it("should handle database errors", async () => {
            req.params.profId = "P1234567X";
            req.params.requestId = "1";
            req.body = {
                status: "Approved",
                module_code: "CS1010"
            };
            mockDb.oneOrNone.rejects(new Error("Database error"));

            await updateRequestStatus(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to update request - Error: Database error"
            }));
        });
    });

    describe("getAllRequestsByModule", () => {
        it("should return all requests for a module successfully", async () => {
            req.params.moduleCode = "CS1010";
            const mockRequests = [
                {
                    id: 1,
                    created_at: "2024-01-01",
                    start_date_of_leave: "2024-01-15",
                    end_date_of_leave: "2024-01-16",
                    status: "Pending",
                    module_code: "CS1010",
                    user_id: "A1234567X"
                }
            ];
            mockDb.any.resolves(mockRequests);

            await getAllRequestsByModule(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                data: mockRequests
            }));
        });

        it("should handle database errors", async () => {
            req.params.moduleCode = "CS1010";
            mockDb.any.rejects(new Error("Database error"));

            await getAllRequestsByModule(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to fetch requests - Error: Database error"
            }));
        });
    });

    describe("archiveAllRequests", () => {
        it("should archive all requests successfully", async () => {
            mockDb.none.resolves();

            await archiveAllRequests(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                message: "All requests archived successfully."
            }));
        });

        it("should handle database errors", async () => {
            mockDb.none.rejects(new Error("Archive failed"));

            await archiveAllRequests(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                success: false,
                message: "Failed to archive requests - Error: Archive failed"
            }));
        });
    });

    describe("getAllRequestsDetailsByProfessor", () => {
        it("should return detailed requests for a professor successfully", async () => {
            req.params.profId = "P1234567X";
            const mockRequests = [
                {
                    id: 1,
                    request_date: "2024-01-01",
                    start_date: "2024-01-15",
                    end_date: "2024-01-16",
                    reason: "Medical leave",
                    attachment_url: "https://example.com/attachment.pdf",
                    status: "Pending",
                    module_code: "CS1010",
                    user_name: "John Doe",
                    email: "john.doe@example.com"
                }
            ];
            mockDb.any.resolves(mockRequests);

            await getAllRequestsDetailsByProfessor(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({
                success: true,
                data: mockRequests
            }));
        });

        it("should handle database errors", async () => {
            req.params.profId = "P1234567X";
            mockDb.any.rejects(new Error("Database error"));

            await getAllRequestsDetailsByProfessor(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({
                error: "Failed to fetch requests - Error: Database error"
            }));
        });
    });
}); 