import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import axios from "axios";
import request from "supertest";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import bodyParser from "body-parser";
import {
  getAllModulesWithEducators,
  getModulesTakenByStudent,
  getModulesWithRequestsByProfessor,
  updateSemester,
} from "../../module/moduleController.js";
import {
  getAllStudentsByModule,
  getEnrolledStudentsByModule,
} from "../../user/userController.js";
import { verifyToken, authorizeRoles } from "../../middlewares/authMiddleware.js";

// Create test app that mimics the main application
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  
  // Mock the middleware for testing
  const mockVerifyToken = (req, res, next) => {
    req.user = { matrix_id: "A1234567B", role: "Student" };
    next();
  };
  
  const mockAuthorizeRoles = (roles) => {
    return (req, res, next) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: "Access denied. Insufficient permissions.",
        });
      }
    };
  };

  // Aggregate API routes
  app.get("/api/gateway/modules/all", mockVerifyToken, getAllModulesWithEducators);
  app.get(
    "/api/gateway/students/enrolled/:moduleCode",
    mockVerifyToken,
    mockAuthorizeRoles(["Professor"]),
    getEnrolledStudentsByModule
  );
  app.get("/api/gateway/students/:studentID/modules", mockVerifyToken, getModulesTakenByStudent);
  app.get("/api/gateway/students/:moduleCode", mockVerifyToken, getAllStudentsByModule);
  app.get("/api/gateway/modules/:profId", mockVerifyToken, getModulesWithRequestsByProfessor);
  app.post("/api/gateway/updateSemester", mockVerifyToken, mockAuthorizeRoles(["Admin"]), updateSemester);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      code: 404,
      status: "Error",
      message: "Route not found.",
      data: null,
    });
  });

  return app;
};

describe("API Gateway Routes", () => {
  let app;
  let axiosStub;

  beforeEach(() => {
    app = createTestApp();
    axiosStub = sinon.stub(axios, "get");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GET /api/gateway/modules/all", () => {
    it("should return modules with educators", async () => {
      const mockModuleResponse = {
        data: {
          success: true,
          data: [
            {
              code: "CS101",
              name: "Introduction to Programming",
              educator_id: "P001",
              students: "25",
            },
          ],
        },
      };

      const mockEducatorResponse = {
        data: {
          success: true,
          data: [
            {
              matrix_id: "P001",
              name: "Prof. Smith",
              email: "smith@university.edu",
              role: "Professor",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModuleResponse);
      axiosStub.onSecondCall().resolves(mockEducatorResponse);

      const response = await request(app).get("/api/gateway/modules/all");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(Array.isArray(response.body.data.modules), true);
      assert.strictEqual(Array.isArray(response.body.data.educators), true);
      assert.strictEqual(response.body.data.modules.length, 1);
      assert.strictEqual(response.body.data.educators.length, 1);
    });

    it("should handle service failure", async () => {
      axiosStub.onFirstCall().rejects(new Error("Module service unavailable"));

      const response = await request(app).get("/api/gateway/modules/all");

      assert.strictEqual(response.status, 500);
      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.error, "Error fetching all modules");
    });
  });

  describe("GET /api/gateway/students/enrolled/:moduleCode", () => {
    beforeEach(() => {
      // Override the test app to use Professor role for this route
      app = express();
      app.use(cors());
      app.use(bodyParser.json());
      
      const mockVerifyTokenProfessor = (req, res, next) => {
        req.user = { matrix_id: "P001", role: "Professor" };
        next();
      };
      
      const mockAuthorizeRoles = (roles) => {
        return (req, res, next) => {
          if (roles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({
              success: false,
              error: "Access denied. Insufficient permissions.",
            });
          }
        };
      };

      app.get(
        "/api/gateway/students/enrolled/:moduleCode",
        mockVerifyTokenProfessor,
        mockAuthorizeRoles(["Professor"]),
        getEnrolledStudentsByModule
      );
    });

    it("should return enrolled students for professor", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
          ],
        },
      };

      const mockStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              matrix_id: "A1234567B",
              name: "John Doe",
              email: "john.doe@university.edu",
              role: "Student",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockStudentsResponse);

      const response = await request(app).get("/api/gateway/students/enrolled/CS101");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(Array.isArray(response.body.data.students), true);
      assert.strictEqual(response.body.data.students.length, 1);
      assert.strictEqual(response.body.data.students[0].matrix_id, "A1234567B");
      assert.strictEqual(response.body.data.students[0].name, "John Doe");
    });
  });

  describe("GET /api/gateway/students/:studentID/modules", () => {
    it("should return modules taken by student", async () => {
      const mockModulesResponse = {
        data: {
          success: true,
          data: [
            {
              code: "CS101",
              name: "Programming",
              educator_id: "P001",
            },
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
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockModulesResponse);
      axiosStub.onSecondCall().resolves(mockProfessorsResponse);

      const response = await request(app).get("/api/gateway/students/A1234567B/modules");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(Array.isArray(response.body.data), true);
      assert.strictEqual(response.body.data.length, 1);
      assert.strictEqual(response.body.data[0].code, "CS101");
      assert.strictEqual(response.body.data[0].professor.name, "Prof. Smith");
    });

    it("should handle invalid student ID", async () => {
      axiosStub.onFirstCall().rejects(new Error("Student not found"));

      const response = await request(app).get("/api/gateway/students/INVALID/modules");

      assert.strictEqual(response.status, 500);
      assert.strictEqual(response.body.success, false);
    });
  });

  describe("GET /api/gateway/students/:moduleCode", () => {
    it("should return all students for a module", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
          ],
        },
      };

      const mockAllStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              matrix_id: "A1234567B",
              name: "John Doe",
              email: "john.doe@university.edu",
              role: "Student",
            },
            {
              matrix_id: "A2345678C",
              name: "Jane Smith",
              email: "jane.smith@university.edu",
              role: "Student",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockAllStudentsResponse);

      const response = await request(app).get("/api/gateway/students/CS101");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(Array.isArray(response.body.data.students), true);
      assert.strictEqual(response.body.data.students.length, 2);

      // Check enrolled student
      const enrolledStudent = response.body.data.students.find(
        (s) => s.matrix_id === "A1234567B"
      );
      assert.strictEqual(enrolledStudent.classes.length, 1);

      // Check non-enrolled student
      const nonEnrolledStudent = response.body.data.students.find(
        (s) => s.matrix_id === "A2345678C"
      );
      assert.strictEqual(nonEnrolledStudent.classes.length, 0);
    });
  });

  describe("GET /api/gateway/modules/:profId", () => {
    it("should return modules with request counts for professor", async () => {
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

      const response = await request(app).get("/api/gateway/modules/P001");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.data.modules.length, 2);

      const cs101Module = response.body.data.modules.find((m) => m.code === "CS101");
      const cs102Module = response.body.data.modules.find((m) => m.code === "CS102");

      assert.strictEqual(cs101Module.requests, 2);
      assert.strictEqual(cs102Module.requests, 1);
    });
  });

  describe("POST /api/gateway/updateSemester", () => {
    let axiosPostStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, "post");
      
      // Override the test app to use Admin role for this route
      app = express();
      app.use(cors());
      app.use(bodyParser.json());
      
      const mockVerifyTokenAdmin = (req, res, next) => {
        req.user = { matrix_id: "ADMIN001", role: "Admin" };
        next();
      };
      
      const mockAuthorizeRoles = (roles) => {
        return (req, res, next) => {
          if (roles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({
              success: false,
              error: "Access denied. Insufficient permissions.",
            });
          }
        };
      };

      app.post("/api/gateway/updateSemester", mockVerifyTokenAdmin, mockAuthorizeRoles(["Admin"]), updateSemester);
    });

    it("should successfully update semester for admin", async () => {
      const mockUpdateResponse = {
        data: { success: true, message: "Semester updated" },
      };

      const mockArchiveResponse = {
        data: { success: true, message: "Requests archived" },
      };

      axiosPostStub.onFirstCall().resolves(mockUpdateResponse);
      axiosPostStub.onSecondCall().resolves(mockArchiveResponse);

      const response = await request(app)
        .post("/api/gateway/updateSemester")
        .send({
          academicYear: "2024/2025",
          semester: 1,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.message, "Semester updated successfully");
    });

    it("should handle module service failure", async () => {
      axiosPostStub.onFirstCall().rejects(new Error("Module service unavailable"));

      const response = await request(app)
        .post("/api/gateway/updateSemester")
        .send({
          academicYear: "2024/2025",
          semester: 1,
        });

      assert.strictEqual(response.status, 500);
      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.message, "Failed to update semester");
    });
  });

  describe("Authorization Tests", () => {
    it("should deny access to enrolled students endpoint for non-professor", async () => {
      // Create app with Student role
      const studentApp = express();
      studentApp.use(cors());
      studentApp.use(bodyParser.json());
      
      const mockVerifyTokenStudent = (req, res, next) => {
        req.user = { matrix_id: "A1234567B", role: "Student" };
        next();
      };
      
      const mockAuthorizeRoles = (roles) => {
        return (req, res, next) => {
          if (roles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({
              success: false,
              error: "Access denied. Insufficient permissions.",
            });
          }
        };
      };

      studentApp.get(
        "/api/gateway/students/enrolled/:moduleCode",
        mockVerifyTokenStudent,
        mockAuthorizeRoles(["Professor"]),
        getEnrolledStudentsByModule
      );

      const response = await request(studentApp).get("/api/gateway/students/enrolled/CS101");

      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.error, "Access denied. Insufficient permissions.");
    });

    it("should deny access to update semester endpoint for non-admin", async () => {
      // Create app with Student role
      const studentApp = express();
      studentApp.use(cors());
      studentApp.use(bodyParser.json());
      
      const mockVerifyTokenStudent = (req, res, next) => {
        req.user = { matrix_id: "A1234567B", role: "Student" };
        next();
      };
      
      const mockAuthorizeRoles = (roles) => {
        return (req, res, next) => {
          if (roles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({
              success: false,
              error: "Access denied. Insufficient permissions.",
            });
          }
        };
      };

      studentApp.post("/api/gateway/updateSemester", mockVerifyTokenStudent, mockAuthorizeRoles(["Admin"]), updateSemester);

      const response = await request(studentApp)
        .post("/api/gateway/updateSemester")
        .send({
          academicYear: "2024/2025",
          semester: 1,
        });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.error, "Access denied. Insufficient permissions.");
    });
  });

  describe("404 Route Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/api/gateway/nonexistent");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.code, 404);
      assert.strictEqual(response.body.status, "Error");
      assert.strictEqual(response.body.message, "Route not found.");
      assert.strictEqual(response.body.data, null);
    });

    it("should return 404 for unknown POST routes", async () => {
      const response = await request(app).post("/api/gateway/unknown").send({});

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.code, 404);
      assert.strictEqual(response.body.status, "Error");
      assert.strictEqual(response.body.message, "Route not found.");
    });
  });

  describe("Route Parameter Validation", () => {
    it("should handle invalid module code parameters", async () => {
      axiosStub.onFirstCall().rejects(new Error("Module not found"));

      const response = await request(app).get("/api/gateway/students/INVALID_MODULE");

      assert.strictEqual(response.status, 500);
      assert.strictEqual(response.body.success, false);
    });

    it("should handle invalid professor ID parameters", async () => {
      axiosStub.onFirstCall().rejects(new Error("Professor not found"));

      const response = await request(app).get("/api/gateway/modules/INVALID_PROF");

      assert.strictEqual(response.status, 500);
      assert.strictEqual(response.body.success, false);
    });

    it("should handle special characters in parameters", async () => {
      const mockEnrolledStudentsResponse = {
        data: { success: true, data: [] },
      };
      const mockAllStudentsResponse = {
        data: { success: true, data: [] },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockAllStudentsResponse);

      const response = await request(app).get("/api/gateway/students/CS-101%20Special");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);
    });
  });
});