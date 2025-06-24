// server/module-service/src/tests/controllers/moduleController.test.js

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

// Import test helper function from db.js.
import { _setDbForTest } from "../../configs/db.js";

// Import controller functions for testing
import {
    getAllModules,
    updateEducator,
    getClassesByModule,
} from "../../controllers/moduleController.js";

describe("Module Controller Unit Tests", () => {
    let req, res;

    // Fake database object
    const mockDb = {
        manyOrNone: sinon.stub(),
        oneOrNone: sinon.stub(),
        none: sinon.stub(),
    };

    beforeEach(() => {
        // Before each test, inject fake database object into the db.js module.
        // Any code in the controller that uses the `db` export will now use `mockDb`.
        _setDbForTest(mockDb);

        // Reset the behavior and history of mock stubs
        mockDb.manyOrNone.reset();
        mockDb.oneOrNone.reset();
        mockDb.none.reset();

        // Re-create fresh mock request/response objects for each test
        req = {
            params: {},
            body: {},
            headers: { authorization: "Bearer valid-token" },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        // Restore the `db` variable to null and Sinon stubs
        _setDbForTest(null);
        sinon.restore();
    });

    describe("getAllModules", () => {
        it("should return all modules successfully", async () => {
            const mockModules = [{ code: "CS1010", name: "Programming Methodology" }];
            mockDb.manyOrNone.resolves(mockModules); // Configure the mock

            await getAllModules(req, res);

            assert(res.json.calledOnceWith({ success: true, data: mockModules }));
            assert(mockDb.manyOrNone.calledOnce);
        });

        it("should return 500 on database error", async () => {
            const dbError = new Error("Database connection failed");
            mockDb.manyOrNone.rejects(dbError);

            await getAllModules(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({ success: false, error: "Error fetching all modules" }));
        });
    });

    describe("updateEducator", () => {
        beforeEach(() => {
            req.body = { educator_id: "P001", module_code: "CS1010" };
        });

        it("should update an educator successfully", async () => {
            mockDb.oneOrNone.withArgs(sinon.match.any, ["P001"]).resolves({ matrix_id: "P001" });
            mockDb.none.resolves();

            await updateEducator(req, res);

            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({ success: true, data: "Educator updated successfully" }));
        });

        it("should return 404 if professor does not exist", async () => {
            mockDb.oneOrNone.withArgs(sinon.match.any, ["P001"]).resolves(null);

            await updateEducator(req, res);

            assert(res.status.calledWith(404));
            assert(res.json.calledOnceWith({ success: false, error: "Matrix ID not found or User is not a Professor" }));
        });
    });

    describe("getClassesByModule", () => {
        beforeEach(() => {
            req.params.moduleCode = "CS1010";
        });

        it("should fetch and format class data correctly", async () => {
            const mockClassData = [
                { module_code: "CS1010", class_type: "Lecture", class_no: "L01" },
                { module_code: "CS1010", class_type: "Lecture", class_no: "L02" },
                { module_code: "CS1010", class_type: "Tutorial", class_no: "T01" },
            ];
            const expectedFormattedData = [
                { class_type: "Lecture", class_no: ["L01", "L02"] },
                { class_type: "Tutorial", class_no: ["T01"] },
            ];

            mockDb.oneOrNone.resolves({ code: "CS1010" }); // Mock module existence check
            mockDb.manyOrNone.resolves(mockClassData);    // Mock class data fetch

            await getClassesByModule(req, res);

            assert(res.json.calledOnce);
            assert.deepStrictEqual(res.json.firstCall.args[0], {
                success: true,
                data: expectedFormattedData,
            });
        });
    });
});