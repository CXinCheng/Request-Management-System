import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MODULE_SERVICE_URL = process.env.MODULE_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// Return only enrolled students in a module
export const getEnrolledStudentsByModule = async (req, res) => {
    try {
        let moduleCode = req.params.moduleCode;

        let enrolledStudentsData = await axios.get(
            `${MODULE_SERVICE_URL}/api/v1/module/students/${moduleCode}`,
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );
        const formatedEnrolledStudents = enrolledStudentsData.data.data.reduce(
            (acc, curr) => {
                const existing = acc.find(
                    (item) => item.user_matrix_id === curr.user_matrix_id
                );
                if (existing) {
                    existing.classes.push({
                        class_type: curr.class_type,
                        class_no: curr.class_no,
                    });
                } else {
                    acc.push({
                        user_matrix_id: curr.user_matrix_id,
                        classes: [
                            {
                                class_type: curr.class_type,
                                class_no: curr.class_no,
                            },
                        ],
                    });
                }
                return acc;
            },
            []
        );

        let studentData = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/all/students`,
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        res.json({
            success: true,
            data: {
                students: formatedEnrolledStudents.map((enrolledStudent) => {
                    let student = studentData.data.data.find(
                        (s) => s.matrix_id === enrolledStudent.user_matrix_id
                    );
                    return {
                        matrix_id: student.matrix_id,
                        name: student.name,
                        email: student.email,
                        classes: enrolledStudent.classes,
                    };
                }),
            },
        });
    } catch (error) {
        console.error("Error fetching all students by module:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all students by module",
        });
    }
};

// For admin module user enrollment page
// Return all students with their class_no in a module, containing students who are not enrolled
export const getAllStudentsByModule = async (req, res) => {
    try {
        let moduleCode = req.params.moduleCode;

        let enrolledStudentsData = await axios.get(
            `${MODULE_SERVICE_URL}/api/v1/module/students/${moduleCode}`,
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        let studentData = await axios.get(
            `${USER_SERVICE_URL}/api/v1/user/all/students`,
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );

        res.json({
            success: true,
            data: {
                students: studentData.data.data.map((student) => {
                    let enrolledStudent = enrolledStudentsData.data.data.filter(
                        (s) => s.user_matrix_id === student.matrix_id
                    );
                    return {
                        matrix_id: student.matrix_id,
                        name: student.name,
                        email: student.email,
                        classes:
                            enrolledStudent.length > 0
                                ? enrolledStudent.map((s) => ({
                                      class_type: s.class_type,
                                      class_no: s.class_no,
                                  }))
                                : [],
                    };
                }),
            },
        });
    } catch (error) {
        console.error("Error fetching all students by module:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all students by module",
        });
    }
};
