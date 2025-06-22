import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import axios from "axios";
import {
  getEnrolledStudentsByModule,
  getAllStudentsByModule,
} from "../../user/userController.js";

describe("User Controller", () => {
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

  describe("getEnrolledStudentsByModule", () => {
    beforeEach(() => {
      req.params.moduleCode = "CS101";
    });

    it("should successfully return enrolled students with their classes", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
            {
              user_matrix_id: "A1234567B",
              class_type: "Tutorial",
              class_no: "T01",
            },
            {
              user_matrix_id: "A2345678C",
              class_type: "Lecture",
              class_no: "L01",
            },
            {
              user_matrix_id: "A2345678C",
              class_type: "Lab",
              class_no: "B01",
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
            {
              matrix_id: "A2345678C",
              name: "Jane Smith",
              email: "jane.smith@university.edu",
              role: "Student",
            },
            {
              matrix_id: "A3456789D",
              name: "Bob Wilson",
              email: "bob.wilson@university.edu",
              role: "Student",
            },
          ],
        },
      };

      // Setup stubs
      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockStudentsResponse);

      await getEnrolledStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(Array.isArray(res.body.data.students), true);
      assert.strictEqual(res.body.data.students.length, 2);

      // Check first student with multiple classes
      const johnDoe = res.body.data.students.find(
        (s) => s.matrix_id === "A1234567B"
      );
      assert.strictEqual(johnDoe.name, "John Doe");
      assert.strictEqual(johnDoe.email, "john.doe@university.edu");
      assert.strictEqual(johnDoe.classes.length, 2);
      assert.deepStrictEqual(johnDoe.classes, [
        { class_type: "Lecture", class_no: "L01" },
        { class_type: "Tutorial", class_no: "T01" },
      ]);

      // Check second student with multiple classes
      const janeSmith = res.body.data.students.find(
        (s) => s.matrix_id === "A2345678C"
      );
      assert.strictEqual(janeSmith.name, "Jane Smith");
      assert.strictEqual(janeSmith.classes.length, 2);
      assert.deepStrictEqual(janeSmith.classes, [
        { class_type: "Lecture", class_no: "L01" },
        { class_type: "Lab", class_no: "B01" },
      ]);
    });

    it("should handle students with single class enrollment", async () => {
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

      await getEnrolledStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 1);

      const student = res.body.data.students[0];
      assert.strictEqual(student.matrix_id, "A1234567B");
      assert.strictEqual(student.classes.length, 1);
      assert.deepStrictEqual(student.classes[0], {
        class_type: "Lecture",
        class_no: "L01",
      });
    });

    it("should handle empty enrollment data", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [],
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

      await getEnrolledStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 0);
    });

    it("should handle error when module service fails", async () => {
      axiosStub
        .onFirstCall()
        .rejects(new Error("Module service unavailable"));

      await getEnrolledStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all students by module"
      );
    });

    it("should handle error when user service fails", async () => {
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

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().rejects(new Error("User service unavailable"));

      await getEnrolledStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all students by module"
      );
    });

    it("should verify correct API endpoints are called", async () => {
      const mockEnrolledStudentsResponse = {
        data: { success: true, data: [] },
      };
      const mockStudentsResponse = {
        data: { success: true, data: [] },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockStudentsResponse);

      await getEnrolledStudentsByModule(req, res);

      // Verify the correct endpoints were called
      assert(axiosStub.calledTwice);
      assert(
        axiosStub
          .getCall(0)
          .args[0].includes("/api/v1/module/students/CS101")
      );
      assert(
        axiosStub.getCall(1).args[0].includes("/api/v1/user/all/students")
      );

      // Verify authorization headers were passed
      assert.strictEqual(
        axiosStub.getCall(0).args[1].headers.Authorization,
        "Bearer valid-token"
      );
      assert.strictEqual(
        axiosStub.getCall(1).args[1].headers.Authorization,
        "Bearer valid-token"
      );
    });
  });

  describe("getAllStudentsByModule", () => {
    beforeEach(() => {
      req.params.moduleCode = "CS102";
    });

    it("should return all students with enrollment status", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
            {
              user_matrix_id: "A1234567B",
              class_type: "Tutorial",
              class_no: "T01",
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
            {
              matrix_id: "A3456789D",
              name: "Bob Wilson",
              email: "bob.wilson@university.edu",
              role: "Student",
            },
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockAllStudentsResponse);

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 3);

      // Check enrolled student
      const enrolledStudent = res.body.data.students.find(
        (s) => s.matrix_id === "A1234567B"
      );
      assert.strictEqual(enrolledStudent.name, "John Doe");
      assert.strictEqual(enrolledStudent.classes.length, 2);
      assert.deepStrictEqual(enrolledStudent.classes, [
        { class_type: "Lecture", class_no: "L01" },
        { class_type: "Tutorial", class_no: "T01" },
      ]);

      // Check non-enrolled students
      const nonEnrolledStudent1 = res.body.data.students.find(
        (s) => s.matrix_id === "A2345678C"
      );
      assert.strictEqual(nonEnrolledStudent1.name, "Jane Smith");
      assert.strictEqual(nonEnrolledStudent1.classes.length, 0);
      assert.deepStrictEqual(nonEnrolledStudent1.classes, []);

      const nonEnrolledStudent2 = res.body.data.students.find(
        (s) => s.matrix_id === "A3456789D"
      );
      assert.strictEqual(nonEnrolledStudent2.name, "Bob Wilson");
      assert.strictEqual(nonEnrolledStudent2.classes.length, 0);
      assert.deepStrictEqual(nonEnrolledStudent2.classes, []);
    });

    it("should handle all students being enrolled", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
            {
              user_matrix_id: "A2345678C",
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

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 2);

      // All students should have classes
      res.body.data.students.forEach((student) => {
        assert(student.classes.length > 0);
      });
    });

    it("should handle no students being enrolled", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [],
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

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 2);

      // All students should have empty classes array
      res.body.data.students.forEach((student) => {
        assert.strictEqual(student.classes.length, 0);
        assert.deepStrictEqual(student.classes, []);
      });
    });

    it("should handle students with multiple class types", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [
            {
              user_matrix_id: "A1234567B",
              class_type: "Lecture",
              class_no: "L01",
            },
            {
              user_matrix_id: "A1234567B",
              class_type: "Tutorial",
              class_no: "T01",
            },
            {
              user_matrix_id: "A1234567B",
              class_type: "Lab",
              class_no: "B01",
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
          ],
        },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockAllStudentsResponse);

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.students.length, 1);

      const student = res.body.data.students[0];
      assert.strictEqual(student.classes.length, 3);
      assert.deepStrictEqual(student.classes, [
        { class_type: "Lecture", class_no: "L01" },
        { class_type: "Tutorial", class_no: "T01" },
        { class_type: "Lab", class_no: "B01" },
      ]);
    });

    it("should handle error when module service fails", async () => {
      axiosStub
        .onFirstCall()
        .rejects(new Error("Module service unavailable"));

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all students by module"
      );
    });

    it("should handle error when user service fails", async () => {
      const mockEnrolledStudentsResponse = {
        data: {
          success: true,
          data: [],
        },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().rejects(new Error("User service unavailable"));

      await getAllStudentsByModule(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.error,
        "Error fetching all students by module"
      );
    });

    it("should verify correct API endpoints are called with module code", async () => {
      const mockEnrolledStudentsResponse = {
        data: { success: true, data: [] },
      };
      const mockAllStudentsResponse = {
        data: { success: true, data: [] },
      };

      axiosStub.onFirstCall().resolves(mockEnrolledStudentsResponse);
      axiosStub.onSecondCall().resolves(mockAllStudentsResponse);

      await getAllStudentsByModule(req, res);

      // Verify the correct endpoints were called with the right module code
      assert(axiosStub.calledTwice);
      assert(
        axiosStub
          .getCall(0)
          .args[0].includes("/api/v1/module/students/CS102")
      );
      assert(
        axiosStub.getCall(1).args[0].includes("/api/v1/user/all/students")
      );

      // Verify authorization headers were passed
      assert.strictEqual(
        axiosStub.getCall(0).args[1].headers.Authorization,
        "Bearer valid-token"
      );
      assert.strictEqual(
        axiosStub.getCall(1).args[1].headers.Authorization,
        "Bearer valid-token"
      );
    });
  });
});