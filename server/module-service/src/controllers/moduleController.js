import UpdateService from "../services/updateService.js";
import { db } from "../configs/db.js";

// Fetch modules from user_module_mapping based on userId
export const getUserMappedModules = async (req, res) => {
  const { userId } = req.params; // Extract userId from URL
  console.log("DB Query Result:"); // Debugging
  try {
    const result = await db.any(
      "SELECT module_code, class_no FROM request_management.user_module_mapping WHERE user_matrix_id = $1;",
      [userId]
    );

    console.log("DB Query Result:", result); // Debugging
    res.json(result);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch user module mapping" });
  }
};
// Add a user to "user_module_mapping" table
export const addUserMappedModule = async (req, res) => {
  const { user_matrix_id, module_code, class_no } = req.body;

  try {
    await db.none(
      "INSERT INTO request_management.user_module_mapping (user_matrix_id, module_code, class_no) VALUES ($1, $2, $3);",
      [user_matrix_id, module_code, class_no]
    );

    res.status(201).json({ message: "User added to module successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to add user to module" });
  }
};

export const getAllModules = async (req, res) => {
  let data = null;
  try {
    data = await db.manyOrNone(
      "SELECT code, name, educator_id FROM request_management.modules"
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching all modules:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching all modules",
    });
  }
};

export const getAllModulesWithNumbersOfEnrolledStudents = async (req, res) => {
  let data = null;
  try {
    data = await db.manyOrNone(
      `SELECT code, name, educator_id, COUNT(DISTINCT user_matrix_id) students FROM request_management.modules
            LEFT JOIN request_management.user_module_mapping
            ON request_management.modules.code = request_management.user_module_mapping.module_code
            GROUP BY request_management.modules.code
            ORDER BY request_management.modules.code`
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching all modules with enrolled students:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching all modules with enrolled students",
    });
  }
};

export const updateEducator = async (req, res) => {
  const { educator_id, module_code } = req.body;

  try {
    if (educator_id) {
      const existingProfessor = await db.oneOrNone(
        "SELECT * FROM request_management.users WHERE matrix_id = $1 AND role = 'Professor'",
        [educator_id]
      );
      if (!existingProfessor) {
        return res.status(404).json({
          success: false,
          error: "Matrix ID not found or User is not a Professor",
        });
      }
    }

    if (module_code) {
      const existingModule = await db.oneOrNone(
        "SELECT * FROM request_management.modules WHERE code = $1",
        [module_code]
      );
      if (!existingModule) {
        return res.status(404).json({
          success: false,
          error: "Module code not found",
        });
      }
    }

    await db.none(
      "UPDATE request_management.modules SET educator_id = $1 WHERE code = $2",
      [educator_id, module_code]
    );
    return res.status(200).json({
      success: true,
      data: "Educator updated successfully",
    });
  } catch (error) {
    console.error("Error updating educator:", error);
    return res.status(500).json({
      success: false,
      error: "Error updating educator",
    });
  }
};

export const getStudentsByModule = async (req, res) => {
  const moduleCode = req.params.moduleCode;
  let data = null;

  try {
    // Check if module exists
    const module = await db.oneOrNone(
      "SELECT * FROM request_management.modules WHERE code = $1",
      [moduleCode]
    );
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    data = await db.manyOrNone(
      "SELECT user_matrix_id, class_type, class_no FROM request_management.user_module_mapping WHERE module_code = $1",
      [moduleCode]
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching all students by module:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching all students by module",
    });
  }
};

export const getClassesByModule = async (req, res) => {
  const moduleCode = req.params.moduleCode;
  let data = null;

  try {
    // Check if module classes records are already in database
    const module = await db.oneOrNone(
      "SELECT * FROM request_management.modules WHERE code = $1",
      [moduleCode]
    );

    // const currentSem = new UpdateService();
    // if (!module || !module.class_last_updated_at) {
    //   await currentSem.addClass(moduleCode);
    // } else if (
    //   module.class_last_updated_at < new Date(Date.now() - 24 * 60 * 60 * 1000)
    // ) {
    //   await currentSem.updateClass(moduleCode);
    // }

    data = await db.manyOrNone(
      "SELECT * FROM request_management.classes WHERE module_code = $1",
      [moduleCode]
    );

    // Format the data to return only class type and class number
    const formattedData = data.reduce((acc, curr) => {
      const existingType = acc.find(
        (item) => item.class_type === curr.class_type
      );

      if (existingType) {
        if (!existingType.class_no.includes(curr.class_no)) {
          existingType.class_no.push(curr.class_no);
        }
      } else {
        acc.push({
          class_type: curr.class_type,
          class_no: [curr.class_no],
        });
      }

      return acc;
    }, []);

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching module timetable:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching module timetable",
    });
  }
};

export const updateEnrollmentByModule = async (req, res) => {
  const moduleCode = req.params.moduleCode;
  const { addedStudents, deletedStudents, updatedStudents } = req.body;

  try {
    // Check if module exists
    const module = await db.oneOrNone(
      "SELECT * FROM request_management.modules WHERE code = $1",
      [moduleCode]
    );
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }

    // Add students
    if (addedStudents && addedStudents.length > 0) {
      for (let student of addedStudents) {
        for (let classItem of student.classes) {
          if (classItem.classNo !== null) {
            await db.none(
              "INSERT INTO request_management.user_module_mapping (user_matrix_id, module_code, class_no, class_type) VALUES ($1, $2, $3, $4)",
              [
                student.matrix_id,
                moduleCode,
                classItem.classNo,
                classItem.classType,
              ]
            );
          }
        }
      }
    }

    // Delete students
    if (deletedStudents && deletedStudents.length > 0) {
      for (let student of deletedStudents) {
        await db.none(
          "DELETE FROM request_management.user_module_mapping WHERE user_matrix_id = $1 AND module_code = $2",
          [student, moduleCode]
        );
      }
    }

    // Update students
    if (updatedStudents && updatedStudents.length > 0) {
      for (let student of updatedStudents) {
        for (let classItem of student.classes) {
          const existingClass = await db.oneOrNone(
            "SELECT * FROM request_management.user_module_mapping WHERE user_matrix_id = $1 AND module_code = $2 AND class_type = $3",
            [student.matrix_id, moduleCode, classItem.classType]
          );
          if (existingClass) {
            await db.none(
              "UPDATE request_management.user_module_mapping SET class_no = $1 WHERE user_matrix_id = $2 AND module_code = $3 AND class_type = $4",
              [
                classItem.classNo,
                student.matrix_id,
                moduleCode,
                classItem.classType,
              ]
            );
          } else if (classItem.classNo !== null) {
            await db.none(
              "INSERT INTO request_management.user_module_mapping (user_matrix_id, module_code, class_no, class_type) VALUES ($1, $2, $3, $4)",
              [
                student.matrix_id,
                moduleCode,
                classItem.classNo,
                classItem.classType,
              ]
            );
          } else {
            await db.none(
              "DELETE FROM request_management.user_module_mapping WHERE user_matrix_id = $1 AND module_code = $2 AND class_type = $3",
              [student.matrix_id, moduleCode, classItem.classType]
            );
          }
        }
      }
    }
    return res.status(200).json({
      success: true,
      data: "Enrollment updated successfully",
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return res.status(500).json({
      success: false,
      error: "Error updating enrollment",
    });
  }
};

export const getModulesByProfessor = async (req, res) => {
  const professorId = req.params.professorId;
  let data = null;

  try {
    data = await db.manyOrNone(
      `SELECT code, name, COUNT(distinct(user_matrix_id)) students FROM request_management.modules
            LEFT JOIN request_management.user_module_mapping
            ON request_management.modules.code = request_management.user_module_mapping.module_code
            WHERE educator_id = $1
            GROUP BY request_management.modules.code
            ORDER BY request_management.modules.code`,
      [professorId]
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching modules by professor:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching modules by professor",
    });
  }
};

export const getAllFaculties = async (req, res) => {
  let data = null;
  try {
    data = await db.manyOrNone("SELECT * FROM request_management.faculties");
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching all faculties:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching all faculties",
    });
  }
};

export const getModulesByStudent = async (req, res) => {
  const studentID = req.params.studentID;
  console.log("received request to getModules for student:", studentID);
  let data = null;
  if (studentID == null) {
    return res.status(400).json({
      success: false,
      error: "Bad Request. Please provide student ID.",
    });
  }

  try {
    data = await db.manyOrNone(
      `SELECT um.*, c.day_of_week, c.starting_time, c.ending_time, c.weeks
            FROM ( SELECT um.module_code, um.class_no, um.class_type, m.educator_id, m.name
            FROM request_management.user_module_mapping AS um
            LEFT JOIN request_management.modules AS m
            ON um.module_code = m.code
            WHERE um.user_matrix_id = $1) AS um
            LEFT JOIN request_management.classes c
            ON um.module_code = c.module_code
            AND um.class_no = c.class_no
            AND um.class_type = c.class_type`,
      [studentID]
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching modules by student:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching modules by student",
    });
  }
};

export const updateSemester = async (req, res) => {
  const { academicYear, semester } = req.body;
  if (!academicYear || !semester) {
    return res
      .status(400)
      .json({ message: "Academic year and semester are required." });
  }

  // academicYear must be of format YYYY-YYYY e.g. 2024-2025 (required by nusmods)
  const isValidAcademicYear = (year) => {
    const regex = /^\d{4}-\d{4}$/;
    if (!regex.test(year)) return false;
    const [start, end] = year.split("-").map(Number);
    return end === start + 1;
  };

  if (!isValidAcademicYear(academicYear)) {
    return res.status(400).json({
      message:
        "Invalid academic year format. Use 'YYYY-YYYY' (e.g., '2024-2025').",
    });
  }

  const newSemester = new UpdateService(academicYear, parseInt(semester));

  try {
    const result = await newSemester.initialize();
    res.status(200).json({
      success: true,
      message: "Updated System to new semester",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update system to new semester",
      error: error.message,
    });
  }
};

export const bulkEnrollStudentsByModule = async (req, res) => {
  const moduleCode = req.params.moduleCode;
  const students = req.body;


  if (!moduleCode || !students || !Array.isArray(students)) {
    return res.status(400).json({
      success: false,
      error:
        "Invalid request data. Please provide module code and an array of students.",
    });
  }

  try {
    // Check if module exists
    const module = await db.oneOrNone(
      "SELECT * FROM request_management.modules WHERE code = $1",
      [moduleCode]
    );
    if (!module) {
      return res.status(404).json({
        success: false,
        error: "Module not found",
      });
    }
    // Check if students exist
    const studentIds = students.map((student) => student.matrix_id);
    const existingStudents = await db.any(
      "SELECT matrix_id FROM request_management.users WHERE matrix_id = ANY($1::text[]) AND role = 'Student'",
      [studentIds]
    );
    const existingStudentIds = existingStudents.map(
      (student) => student.matrix_id
    );
    const nonExistentStudents = studentIds.filter(
      (id) => !existingStudentIds.includes(id)
    );

    // Check which students are already enrolled in the module
    const alreadyEnrolled = await db.any(
      "SELECT DISTINCT user_matrix_id FROM request_management.user_module_mapping WHERE user_matrix_id = ANY($1::text[]) AND module_code = $2",
      [studentIds, moduleCode]
    );

    const alreadyEnrolledIds = alreadyEnrolled.map(
      (entry) => entry.user_matrix_id
    );

    // Filter out the students that can be enrolled (exist in users table and not already enrolled)
    const studentsToEnroll = students.filter(
      (student) =>
        existingStudentIds.includes(student.matrix_id) &&
        !alreadyEnrolledIds.includes(student.matrix_id)
    );

    // Perform bulk enrollment for valid students
    if (studentsToEnroll.length > 0) {
      const enrollmentQueries = [];

      for (const student of studentsToEnroll) {
        // Process class assignments if provided
        if (student.classes && Array.isArray(student.classes) && student.classes.length > 0) {
          console.log("valid class info provided, adding student-module mapping")
          for (const classInfo of student.classes) {
            enrollmentQueries.push(
              db.none(
                "INSERT INTO request_management.user_module_mapping (user_matrix_id, module_code, class_type, class_no) VALUES ($1, $2, $3, $4)",
                [
                  student.matrix_id,
                  moduleCode,
                  classInfo.class_type,
                  classInfo.class_no,
                ]
              )
            );
          }
        } else {
          // If no class information provided, just add the student-module mapping
          console.log("no class info provided, adding student-module mapping with default class type (No Class) and class no (0)")
          enrollmentQueries.push(
            db.none(
              "INSERT INTO request_management.user_module_mapping (user_matrix_id, module_code, class_type, class_no) VALUES ($1, $2, $3, $4)",
              [student.matrix_id, moduleCode, "No Class", "0"]
            )
          );
        }
      }

      await Promise.all(enrollmentQueries);
    }

    // Prepare response with details about the operation
    return res.status(200).json({
      success: true,
      message: `Processed ${students.length} students: ${studentsToEnroll.length} enrolled successfully`,
      data: {
        enrolled: studentsToEnroll,
        alreadyEnrolled: students.filter((student) =>
          alreadyEnrolledIds.includes(student.matrix_id)
        ),
        nonExistent: students.filter((student) =>
          nonExistentStudents.includes(student.matrix_id)
        ),
      },
    });
  } catch (error) {
    console.error("Error bulk enrolling students:", error);
    return res.status(500).json({
      success: false,
      message: "Error bulk enrolling students",
      error: error.message,
    });
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    const systemSettings = await db.manyOrNone(
      "SELECT * FROM request_management.system_settings"
    );

    return res.status(200).json({
      success: true,
      message: `Successfully retrieved Semester Settings`,
      data: {
        systemSettings: systemSettings,
      },
    });
  } catch (error) {
    console.error("Error retrieving Semester Settings:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving Semester Settings",
      error: error.message,
    });
  }
};

