import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import axios from "axios";
import {
  getAllModulesWithEducators,
  getModulesWithRequestsByProfessor,
  getModulesTakenByStudent,
  updateSemester,
  getSemesterStartDate,
} from "../../module/moduleController.js";

describe("Module Controller", () => {
  let axiosStub;
  let req, res;

  beforeEach(() => {
    // Create axios stub before each test
    axiosStub = sinon.stub(axios, "get");

    // Mock request and response objects
    req = {
      headers: {
        authorization: "Bearer valid-token",
      },
      params: {},
      body: {},
    };

    res = {
      statusCode: 200,
      body: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.body = data;
        return this;
      },
    };
  });

  afterEach(() => {
    // Restore axios after each test
    sinon.restore();
  });

  describe("getAllModulesWithEducators", () => {
    it("should successfully return modules with educators", async () => {
      // Mock responses
      const mockModuleResponse = {
        data: {
          success: true,
          data: [
            {
              code: "ABM5001",
              name: "Leadership in Biomedicine",
              educator_id: "P1000001A",
              students: "4",
            },
            {
              code: "ABM5002",
              name: "Advanced Biostatistics for Research",
              educator_id: "P0123456A",
              students: "6",
            },
          ],
        },
      };

      const mockEducatorResponse = {
        data: {
          success: true,
          data: [
            {
              name: "Prof One",
              email: "prof1@app.com",
              role: "Professor",
              matrix_id: "P1111111A",
            },
            {
              name: "Dr. Alvin Tan",
              email: "alvin.tan@app.com",
              role: "Professor",
              matrix_id: "P1000001A",
            },
          ],
        },
      };

      // Setup stubs
      axiosStub.onFirstCall().resolves(mockModuleResponse);
      axiosStub.onSecondCall().resolves(mockEducatorResponse);

      await getAllModulesWithEducators(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);

      assert.strictEqual(Array.isArray(res.body.data.modules), true);
      assert.strictEqual(Array.isArray(res.body.data.educators), true);
      assert.strictEqual(res.body.data.modules.length, 2);
      assert.strictEqual(res.body.data.educators.length, 2);
    });

    it("should handle error when module service fails", async () => {
      axiosStub.onFirstCall().rejects(new Error("Module service unavailable"));

      await getAllModulesWithEducators(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, "Error fetching all modules");
    });

    it("should handle error when educator service fails", async () => {
      const mockModuleResponse = {
        data: {
          success: true,
          data: [
            {
              code: "ABM5001",
              name: "Leadership in Biomedicine",
              educator_id: "P1000001A",
              students: "4",
            },
            {
              code: "ABM5002",
              name: "Advanced Biostatistics for Research",
              educator_id: "P0123456A",
              students: "6",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModuleResponse);


      
      axiosStub
        .onSecondCall()
        .rejects(new Error("Educator service unavailable"));

      await getAllModulesWithEducators(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, "Error fetching all modules");
    });
  });

  describe("getModulesWithRequestsByProfessor", () => {
    beforeEach(() => {
      req.params.profId = "P001";
    });

    it("should successfully return modules with request counts", async () => {
      const mockModuleResponse = {
        data: {
          success: true,
          data: [
            { code: "CS101", name: "Introduction to Programming" },
            { code: "CS102", name: "Data Structures" },
          ],
        },
      };

      const mockRequestResponse = {
        data: {
          success: true,
          data: [
            { id: 1, module_code: "CS101", status: "Pending" },
            { id: 2, module_code: "CS101", status: "Approved" },
            { id: 3, module_code: "CS102", status: "Pending" },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModuleResponse);
      axiosStub.onSecondCall().resolves(mockRequestResponse);

      await getModulesWithRequestsByProfessor(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.modules.length, 2);

      // Check that requests count is correctly calculated
      const cs101Module = res.body.data.modules.find((m) => m.code === "CS101");
      const cs102Module = res.body.data.modules.find((m) => m.code === "CS102");

      assert.strictEqual(cs101Module.requests, 2);
      assert.strictEqual(cs102Module.requests, 1);
    });

    it("should handle error when module service fails", async () => {
      axiosStub.onFirstCall().rejects(new Error("Module service unavailable"));

      await getModulesWithRequestsByProfessor(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all modules with requests by professor"
      );
    });

    it("should handle error when request service fails", async () => {
      const mockModuleResponse = {
        data: {
          success: true,
          data: [{ code: "CS101", name: "Introduction to Programming" }],
        },
      };

      axiosStub.onFirstCall().resolves(mockModuleResponse);
      axiosStub
        .onSecondCall()
        .rejects(new Error("Request service unavailable"));

      await getModulesWithRequestsByProfessor(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all modules with requests by professor"
      );
    });
  });

  describe("getModulesTakenByStudent", () => {
    beforeEach(() => {
      req.params.studentID = "A1234567B";
    });

    it("should successfully return student modules with professor info", async () => {
      const mockModulesResponse = {
        data: {
          success: true,
          data: [
            { code: "CS101", name: "Programming", educator_id: "P001" },
            { code: "CS102", name: "Data Structures", educator_id: "P002" },
          ],
        },
      };

      const mockProfessorsResponse = {
        data: {
          success: true,
          data: [
            {
              matrix_id: "P001",
              name: "Prof. Smith",
              email: "smith@university.edu",
            },
            {
              matrix_id: "P002",
              name: "Prof. Jones",
              email: "jones@university.edu",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModulesResponse);
      axiosStub.onSecondCall().resolves(mockProfessorsResponse);

      await getModulesTakenByStudent(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.length, 2);

      // Check that professor info is attached
      const cs101Module = res.body.data.find((m) => m.code === "CS101");
      assert.strictEqual(cs101Module.professor.name, "Prof. Smith");
      assert.strictEqual(cs101Module.professor.matrix_id, "P001");
    });

    it("should handle modules without educator_id", async () => {
      const mockModulesResponse = {
        data: {
          success: true,
          data: [
            { code: "CS101", name: "Programming", educator_id: null },
            { code: "CS102", name: "Data Structures", educator_id: "P002" },
          ],
        },
      };

      const mockProfessorsResponse = {
        data: {
          success: true,
          data: [
            {
              matrix_id: "P002",
              name: "Prof. Jones",
              email: "jones@university.edu",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModulesResponse);
      axiosStub.onSecondCall().resolves(mockProfessorsResponse);

      await getModulesTakenByStudent(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);

      const cs101Module = res.body.data.find((m) => m.code === "CS101");
      const cs102Module = res.body.data.find((m) => m.code === "CS102");

      assert.strictEqual(cs101Module.professor, null);
      assert.strictEqual(cs102Module.professor.name, "Prof. Jones");
    });

    it("should handle module service failure", async () => {
      axiosStub.onFirstCall().rejects(new Error("Module service unavailable"));

      await getModulesTakenByStudent(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all students by module"
      );
    });

    it("should return modules without professor info if professor service fails", async () => {
      const mockModulesResponse = {
        data: {
          success: false,
          data: [{ code: "CS101", name: "Programming", educator_id: "P001" }],
        },
      };

      axiosStub.onFirstCall().resolves(mockModulesResponse);

      await getModulesTakenByStudent(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error getting all modules taken by student"
      );
    });
  });

  describe("updateSemester", () => {
    let axiosPostStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, "post");
      req.body = {
        academicYear: "2024/2025",
        semester: 1,
      };
    });

    it("should successfully update semester and archive requests", async () => {
      const mockUpdateResponse = {
        data: { success: true, message: "Semester updated" },
      };

      const mockArchiveResponse = {
        data: { success: true, message: "Requests archived" },
      };

      axiosPostStub.onFirstCall().resolves(mockUpdateResponse);
      axiosPostStub.onSecondCall().resolves(mockArchiveResponse);

      await updateSemester(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, "Semester updated successfully");
    });

    it("should handle error when module service fails", async () => {
      axiosPostStub
        .onFirstCall()
        .rejects(new Error("Module service unavailable"));

      await updateSemester(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Failed to update semester");
    });

    it("should handle error when request service fails", async () => {
      const mockUpdateResponse = {
        data: { success: true, message: "Semester updated" },
      };

      axiosPostStub.onFirstCall().resolves(mockUpdateResponse);
      axiosPostStub
        .onSecondCall()
        .rejects(new Error("Request service unavailable"));

      await updateSemester(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Failed to update semester");
    });
  });

  describe("getSemesterStartDate", () => {
    it("should successfully return semester start date", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { startDate: "2024-08-01" },
        },
      };

      axiosStub.resolves(mockResponse);

      await getSemesterStartDate(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(
        res.body.message,
        "Succesfully retrieved current semester start date"
      );
      assert.deepStrictEqual(res.body.data, mockResponse.data);
    });

    it("should handle error when module service fails", async () => {
      axiosStub.rejects(new Error("Module service unavailable"));

      await getSemesterStartDate(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.message,
        "Error retrieving current semester start date"
      );
    });
  });
});
