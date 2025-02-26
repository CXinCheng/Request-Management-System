import updateService from "../services/updateService.js";
import { db } from "../configs/db.js";

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
        console.error(
            "Error fetching all modules with enrolled students:",
            error
        );
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

// Return all students including non-enrolled students
export const getAllStudentsByModule = async (req, res) => {
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

        if (!module || !module.class_last_updated_at) {
            await updateService.addClass(moduleCode);
        } else if (
            module.class_last_updated_at <
            new Date(Date.now() - 24 * 60 * 60 * 1000)
        ) {
            await updateService.updateClass(moduleCode);
        }

        data = await db.manyOrNone(
            "SELECT * FROM request_management.classes WHERE module_code = $1",
            [moduleCode]
        );

        res.json({
            success: true,
            data: data,
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
            `SELECT code, name, COUNT(user_matrix_id) students FROM request_management.modules
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
