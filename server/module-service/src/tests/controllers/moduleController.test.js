import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

// Import test helper function and the controllers to be tested
import { _setDbForTest } from "../../configs/db.js";
import {
    getUserMappedModules,
    addUserMappedModule,
    getAllModules,
    getAllModulesWithNumbersOfEnrolledStudents,
    updateEducator,
    getStudentsByModule,
    getClassesByModule,
    updateEnrollmentByModule,
    getModulesByProfessor,
    getAllFaculties,
    getModulesByStudent,
    updateSemester,
    bulkEnrollStudentsByModule,
    getSemesterStartDate
} from "../../controllers/moduleController.js";
import UpdateService from "../../services/updateService.js";

describe("Module Controller Unit Tests", () => {
    let req, res;

    // Fake database object
    const mockDb = {
        any: sinon.stub(),
        none: sinon.stub(),
        oneOrNone: sinon.stub(),
        manyOrNone: sinon.stub(),
        one: sinon.stub(),
    };

    beforeEach(() => {
        // Inject our fake database object into the db.js module.
        _setDbForTest(mockDb);

        // Reset the behavior and history of our mock stubs
        for (let key in mockDb) {
            mockDb[key].reset();
        }

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
        // Clean up after each test
        _setDbForTest(null);
        sinon.restore();
    });

    describe("getAllModules", () => {
        it("should return all modules successfully", async () => {
            const mockModules = [{ code: "CS1010", name: "Programming Methodology" }];
            mockDb.manyOrNone.resolves(mockModules);
            await getAllModules(req, res);
            assert(res.json.calledOnceWith({ success: true, data: mockModules }));
        });

        it("should return 500 on database error", async () => {
            mockDb.manyOrNone.rejects(new Error("DB Error"));
            await getAllModules(req, res);
            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({ success: false, error: "Error fetching all modules" }));
        });
    });

    describe("updateEducator", () => {
        it("should update an educator successfully", async () => {
            req.body = { educator_id: "P001", module_code: "CS1010" };
            mockDb.oneOrNone.resolves({ matrix_id: "P001" });
            mockDb.none.resolves();
            await updateEducator(req, res);
            assert(res.status.calledWith(200));
            assert(res.json.calledOnceWith({ success: true, data: "Educator updated successfully" }));
        });

        it("should return 404 if professor does not exist", async () => {
            req.body = { educator_id: "P001", module_code: "CS1010" };
            mockDb.oneOrNone.resolves(null);
            await updateEducator(req, res);
            assert(res.status.calledWith(404));
            assert(res.json.calledOnceWith({ success: false, error: "Matrix ID not found or User is not a Professor" }));
        });

        it("should successfully un-assign an educator when educator_id is null", async () => {
            req.body = { educator_id: null, module_code: "CS1010" };
            // Mock configuration for module check
            mockDb.oneOrNone
            .withArgs(sinon.match(/SELECT \* FROM request_management.modules/), ["CS1010"])
            .resolves({ code: "CS1010" }); // Simulate that the module was found.
            mockDb.none.resolves();
            await updateEducator(req, res);
            assert(res.status.calledWith(200), "Expected status 200");
            // Check that the professor check was skipped, but the module check was made.
            assert(mockDb.oneOrNone.callCount === 1, "Expected oneOrNone to be called only once for the module check");
            assert(mockDb.none.calledWith(sinon.match(/UPDATE/), [null, "CS1010"]));
        });

        it("should return 404 if module_code is invalid", async () => {
            req.body = { educator_id: "P001", module_code: "CS9999" };
            // Mock configuration for professor check
            mockDb.oneOrNone
                .withArgs(sinon.match(/FROM request_management.users/), ["P001"])
                .resolves({ matrix_id: "P001" }); // Simulate professor exists
            // Mock configuration for module check
            mockDb.oneOrNone
                .withArgs(sinon.match(/FROM request_management.modules/), ["CS9999"])
                .resolves(null); // Simulate module does NOT exist
            await updateEducator(req, res);
            assert(res.status.calledWith(404));
            assert(res.json.calledWith({
                success: false,
                error: "Module code not found" 
            }));
            //Ensure the final UPDATE query was never run
            assert(mockDb.none.notCalled, "db.none() should not have been called");
        });
    });

    describe("getClassesByModule", () => {
        it("should fetch and format class data correctly for a module that exists", async () => {
            req.params.moduleCode = "CS1010";
            const mockClassData = [{ class_type: "Lecture", class_no: "L01" }];
            const expectedFormattedData = [{ class_type: "Lecture", class_no: ["L01"] }];
            mockDb.oneOrNone.resolves({ code: "CS1010" });
            mockDb.manyOrNone.resolves(mockClassData);
            await getClassesByModule(req, res);
            assert.deepStrictEqual(res.json.firstCall.args[0], { success: true, data: expectedFormattedData });
        });

        it("should return a success response with empty data for a module with no classes", async () => {
            req.params.moduleCode = "CS1010";
            mockDb.oneOrNone.resolves({ code: "CS1010" });
            mockDb.manyOrNone.resolves([]); // No classes found
            await getClassesByModule(req, res);
            assert.deepStrictEqual(res.json.firstCall.args[0], { success: true, data: [] });
        });
    });

    describe("getUserMappedModules", () => {
        it("should return mapped modules for a user", async () => {
            req.params.userId = "A123";
            const mockData = [{ module_code: "CS1010", class_no: "T01" }];
            mockDb.any.resolves(mockData);

            await getUserMappedModules(req, res);

            assert(res.json.calledOnceWith(mockData));
        });
        it("should handle database errors", async () => {
            req.params.userId = "A123";
            mockDb.any.rejects(new Error("DB Error"));
            
            await getUserMappedModules(req, res);

            assert(res.status.calledWith(500));
            assert(res.json.calledOnceWith({ error: "Failed to fetch user module mapping" }));
        });
        it("should return 500 on database error", async () => {
            mockDb.manyOrNone.rejects(new Error("DB Error"));
            await getAllModules(req, res);
            assert(res.status.calledWith(500));
        });
    });
    
    describe("addUserMappedModule", () => {
        it("should successfully add a user to a module", async () => {
            req.body = { user_matrix_id: "A123", module_code: "CS1010", class_no: "T01" };
            mockDb.none.resolves();

            await addUserMappedModule(req, res);
            
            assert(res.status.calledWith(201));
            assert(res.json.calledOnceWith({ message: "User added to module successfully" }));
        });
        it("should return 500 on database error", async () => {
            req.body = { user_matrix_id: "A123", module_code: "CS1010", class_no: "T01" };
            mockDb.none.rejects(new Error('Constraint violation'));
            await addUserMappedModule(req, res);
            assert(res.status.calledWith(500));
            assert(res.json.calledWith({ error: "Failed to add user to module" }));
        });
    });

    describe("getAllModulesWithNumbersOfEnrolledStudents", () => {
        it("should return modules with student counts successfully", async () => {
            const mockData = [{ code: "CS1010", students: "50" }];
            mockDb.manyOrNone.resolves(mockData);
            await getAllModulesWithNumbersOfEnrolledStudents(req, res);
            assert(res.json.calledOnceWith({ success: true, data: mockData }));
        });
    });

    describe("getStudentsByModule", () => {
        beforeEach(() => { req.params.moduleCode = "CS1010"; });

        it("should return students for a valid module", async () => {
            mockDb.oneOrNone.resolves({ code: "CS1010" });
            mockDb.manyOrNone.resolves([{ user_matrix_id: "A123" }]);
            await getStudentsByModule(req, res);
            assert(res.json.calledWithMatch({ success: true }));
            assert.strictEqual(res.json.firstCall.args[0].data[0].user_matrix_id, "A123");
        });
        it("should return a success with an empty array if module has no students", async () => {
            mockDb.oneOrNone.resolves({ code: "CS1010" });
            mockDb.manyOrNone.resolves([]);
            await getStudentsByModule(req, res);
            assert(res.json.calledOnceWith({ success: true, data: [] }));
        });
        it("should return 404 if the module does not exist", async () => {
            mockDb.oneOrNone.resolves(null);
            await getStudentsByModule(req, res);
            assert(res.status.calledWith(404));
        });
        it("should return a success with an empty array if module has no students", async () => {
            const mockModule = { code: "CS1010", name: "Programming" };
            
            mockDb.oneOrNone.resolves(mockModule); // Module exists
            mockDb.manyOrNone.resolves([]);        // But returns zero students

            await getStudentsByModule(req, res);

            assert(res.json.calledOnceWith({ success: true, data: [] }));
        });
    });

    describe("updateEnrollmentByModule", () => {
        beforeEach(() => {
            req.params.moduleCode = "CS1010";
            mockDb.oneOrNone.resolves({ code: "CS1010" }); // Assume module exists for most tests
        });
    
        it("should return 404 if module does not exist", async () => {
            mockDb.oneOrNone.resolves(null);
            await updateEnrollmentByModule(req, res);
            assert(res.status.calledWith(404));
        });
    
        it("should handle an empty request body gracefully", async () => {
            req.body = {};
            await updateEnrollmentByModule(req, res);
            assert(res.status.calledWith(200));
            assert(mockDb.none.notCalled, "No database writes should occur for an empty body");
        });
    
        it("should correctly handle only added students", async () => {
            req.body = { addedStudents: [{ matrix_id: "A123", classes: [{ classType: "Lecture", classNo: "L01" }] }]};
            mockDb.none.resolves();
            await updateEnrollmentByModule(req, res);
            assert(mockDb.none.calledWith(sinon.match(/INSERT/)));
        });
    
        it("should correctly handle only deleted students", async () => {
            req.body = { deletedStudents: ["A123"] };
            mockDb.none.resolves();
            await updateEnrollmentByModule(req, res);
            assert(mockDb.none.calledWith(sinon.match(/DELETE/)));
        });
    });

    describe("getModulesByProfessor", () => {
        it("should return modules for a specific professor", async () => {
            req.params.professorId = "P001";
            const mockData = [{ code: "CS1010" }];
            mockDb.manyOrNone.resolves(mockData);
            await getModulesByProfessor(req, res);
            assert(res.json.calledOnceWith({ success: true, data: mockData }));
        });
    });

    describe("getAllFaculties", () => {
        it("should return all faculties", async () => {
            const mockFaculties = [{ name: "Computing" }];
            mockDb.manyOrNone.resolves(mockFaculties);
            await getAllFaculties(req, res);
            assert(res.json.calledWith({ success: true, data: mockFaculties }));
        });
    });

    describe("getModulesByStudent", () => {
        it("should return modules for a valid student ID", async () => {
            req.params.studentID = "A123";
            mockDb.manyOrNone.resolves([]);
            await getModulesByStudent(req, res);
            assert(res.json.calledWith({ success: true, data: [] }));
        });

        it("should return 400 for a null student ID", async () => {
            req.params.studentID = null;
            await getModulesByStudent(req, res);
            assert(res.status.calledWith(400));
        });
    });

    describe("updateSemester", () => {
        it("should call UpdateService and return 200 on success", async () => {
            req.body = { academicYear: "2024-2025", semester: "1" };
            const initializeStub = sinon.stub(UpdateService.prototype, 'initialize').resolves();
            await updateSemester(req, res);
            assert(initializeStub.calledOnce);
            assert(res.status.calledWith(200));
        });
         it("should return 400 for invalid academic year", async () => {
            req.body = { academicYear: "2024", semester: "1" };
            await updateSemester(req, res);
            assert(res.status.calledWith(400));
        });
        it("should return 500 if UpdateService fails to initialize", async () => {
            req.body = { academicYear: "2024-2025", semester: "1" };
            const initializeStub = sinon.stub(UpdateService.prototype, 'initialize').rejects(new Error('Init failed'));
            await updateSemester(req, res);
            assert(initializeStub.calledOnce);
            assert(res.status.calledWith(500));
        });
    });

    describe("bulkEnrollStudentsByModule", () => {
        beforeEach(() => {
            req.params.moduleCode = "CS1010";
        });
    
        it("should return 400 for an invalid request body", async () => {
            req.body = null;
            await bulkEnrollStudentsByModule(req, res);
            assert(res.status.calledWith(400));
        });
        it("should return 404 if the module does not exist", async () => {
            req.body = [{ matrix_id: 'A123' }];
            mockDb.oneOrNone.withArgs(sinon.match(/modules/), ["CS1010"]).resolves(null);
            await bulkEnrollStudentsByModule(req, res);
            assert(res.status.calledWith(404));
        });   
        it("should correctly categorize students into enrolled, already enrolled, and non-existent", async () => {
            req.body = [{ matrix_id: "A001" }, { matrix_id: "A002" }, { matrix_id: "A003" }];
    
            mockDb.oneOrNone.resolves({ code: "CS1010" });
            mockDb.any.withArgs(sinon.match(/SELECT matrix_id FROM request_management.users/), sinon.match.any).resolves([{ matrix_id: "A001" }, { matrix_id: "A002" }]);
            mockDb.any.withArgs(sinon.match(/SELECT DISTINCT user_matrix_id/), sinon.match.any).resolves([{ user_matrix_id: "A002" }]);
            
            await bulkEnrollStudentsByModule(req, res);
    
            const responseData = res.json.firstCall.args[0].data;
            assert.strictEqual(responseData.enrolled[0].matrix_id, "A001");
            assert.strictEqual(responseData.alreadyEnrolled[0].matrix_id, "A002");
            assert.strictEqual(responseData.nonExistent[0].matrix_id, "A003");
        });
    });

    describe("getSemesterStartDate", () => {
        it("should return the semester start date successfully", async () => {
            const mockDate = { value: '2024-08-12' };
            mockDb.one.resolves(mockDate);
            await getSemesterStartDate(req, res);
            assert(res.status.calledWith(200));
            assert(res.json.calledWith({
                success: true,
                message: "Successfully retrieved Semester Start Date",
                data: { startDate: mockDate }
            }));
        });
        it("should return 500 on database error", async () => {
            mockDb.one.rejects(new Error('DB connection lost'));
            await getSemesterStartDate(req, res);
            assert(res.status.calledWith(500));
            assert(res.json.calledWithMatch({ message: "Error retrieving semester start date" 
            }));
        });
    });
});