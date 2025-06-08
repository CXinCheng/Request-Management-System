import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MODULE_SERVICE_URL =
  process.env.MODULE_SERVICE_URL || "http://localhost:3003";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3001";
const REQUEST_SERVICE_URL =
  process.env.REQUEST_SERVICE_URL || "http://localhost:3002";

export const getAllModulesWithEducators = async (req, res) => {
  try {
    let moduleData = await axios.get(
      `${MODULE_SERVICE_URL}/api/v1/module/all/enrolled`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    let educatorData = await axios.get(
      `${USER_SERVICE_URL}/api/v1/user/all/professors`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.json({
      success: true,
      data: {
        modules: moduleData.data.data,
        educators: educatorData.data.data,
      },
    });
  } catch (error) {
    console.error(
      "Error fetching all modules:",
      error.response ? error.response.data : error
    );
    return res.status(500).json({
      success: false,
      error: "Error fetching all modules",
    });
  }
};

export const getModulesWithRequestsByProfessor = async (req, res) => {
  try {
    let profId = req.params.profId;

    let moduleData = await axios.get(
      `${MODULE_SERVICE_URL}/api/v1/module/professor/modules/${profId}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    let requestServiceData = await axios.get(
      `${REQUEST_SERVICE_URL}/api/v1/requests/professor/${profId}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.json({
      success: true,
      data: {
        modules: moduleData.data.data.map((module) => ({
          ...module,
          requests: requestServiceData.data.data.filter(
            (request) => request.module_code === module.code
          ).length,
        })),
      },
    });
  } catch (error) {
    console.error(
      "Error fetching all modules with requests by professor:",
      error.response ? error.response.data : error
    );
    return res.status(500).json({
      success: false,
      error: "Error fetching all modules with requests by professor",
    });
  }
};

// For student view
// Returns module_code, name, educator_id, educator_name, educator_email
export const getModulesTakenByStudent = async (req, res) => {
  try {
    let studentID = req.params.studentID;

    let modulesTakenByStudent = await axios.get(
      `${MODULE_SERVICE_URL}/api/v1/module/students/${studentID}/modules`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    modulesTakenByStudent = modulesTakenByStudent.data;

    if (modulesTakenByStudent.success == false) {
      return res.status(500).json({
        success: false,
        error: "Error getting all modules taken by student",
      });
    }

    const educatorIds = modulesTakenByStudent.data
      .map((module) => module.educator_id)
      .filter((id) => id !== null)
      .join(",");

    let professorInfo = await axios.get(
      `${USER_SERVICE_URL}/api/v1/user/professors?ids=${educatorIds}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    if (professorInfo.success == false) {
      return res.json({
        success: true,
        data: modulesTakenByStudent.data,
      });
    }

    professorInfo = professorInfo.data;
    const professorMap = Object.fromEntries(
      professorInfo.data.map((prof) => [prof.matrix_id, prof])
    );

    const modulesWithProfessorInfo = modulesTakenByStudent.data.map(
      (module) => ({
        ...module,
        professor: professorMap[module.educator_id] || null,
      })
    );

    return res.json({
      success: true,
      data: modulesWithProfessorInfo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error fetching all students by module",
    });
  }
};

export const updateSemester = async (req, res) => {
  const { academicYear, semester } = req.body;

  try {
    let response = await axios.post(
      `${process.env.MODULE_SERVICE_URL}/api/v1/module/updateSemester`,
      { academicYear, semester },
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    response = await axios.post(
      `${process.env.REQUEST_SERVICE_URL}/api/v1/requests/archive`,
      null,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Semester updated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error updating semester:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update semester",
      error: error.message,
    });
  }
};

export const getSemesterStartDate = async (req, res) => {
  try {
    const response = await axios.get(
      `${MODULE_SERVICE_URL}/api/v1/module/getCurrentSemesterStartDate`,
    );

    res.status(200).json({
      success: true,
      message: "Succesfully retrieved current semester start date",
      data: response.data,
    });
  } catch (error) {
    console.error("Error retrieving current semester start date:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving current semester start date",
      error: error.message,
    });
  }
};