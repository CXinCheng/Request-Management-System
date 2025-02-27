import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

const MODULE_SERVICE_URL = process.env.MODULE_SERVICE_URL || "http://localhost:3003";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001" ;

export const getAllModulesWithEducators = async (req, res) => {
    try {
        let moduleData = await axios.get(`${MODULE_SERVICE_URL}/api/v1/module/all/enrolled`);
        
        let educatorData = await axios.get(`${USER_SERVICE_URL}/api/v1/user/all/professors`);

        res.json({
            success: true,
            data: {
                modules: moduleData.data.data,
                educators: educatorData.data.data,
            }
        });
    } catch (error) {
        console.error("Error fetching all modules:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all modules",
        });
    }
}

// Return only enrolled students in a module
export const getEnrolledStudentsByModule = async (req, res) => {
    try {
        let moduleCode = req.params.moduleCode;

        let enrolledStudentsData = await axios.get(`${MODULE_SERVICE_URL}/api/v1/module/students/${moduleCode}`);

        let studentData = await axios.get(`${USER_SERVICE_URL}/api/v1/user/all/students`);

        res.json({
            success: true,
            data: {
                students: enrolledStudentsData.data.data.map(enrolledStudent => {
                    let student = studentData.data.data.find(s => s.matrix_id === enrolledStudent.user_matrix_id);
                    return {
                        matrix_id: student.matrix_id,
                        name: student.name,
                        email: student.email,
                        class_no: enrolledStudent.class_no,
                    };
                }),
            }
        });
    } catch (error) {
        console.error("Error fetching all students by module:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all students by module",
        });
    }
}

// For admin module user enrollment page
// Return all students with their class_no in a module, containing students who are not enrolled
export const getAllStudentsByModule = async (req, res) => {
    try {
        let moduleCode = req.params.moduleCode;

        let enrolledStudentsData = await axios.get(`${MODULE_SERVICE_URL}/api/v1/module/students/${moduleCode}`);

        let studentData = await axios.get(`${USER_SERVICE_URL}/api/v1/user/all/students`);

        res.json({
            success: true,
            data: {
                students: studentData.data.data.map(student => {
                    let enrolledStudent = enrolledStudentsData.data.data.find(s => s.user_matrix_id === student.matrix_id);
                    return {
                        matrix_id: student.matrix_id,
                        name: student.name,
                        email: student.email,
                        class_no: enrolledStudent ? enrolledStudent.class_no : null,
                    };
                }),
            }
        });
    } catch (error) {
        console.error("Error fetching all students by module:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all students by module",
        });
    }
}


// For student view 
// Returns module_code, name, educator_id, educator_name, educator_email
export const getModulesTakenByStudent = async (req, res) => {
    try {
        let studentID = req.params.studentID;

        let modulesTakenByStudent = await axios.get(`${MODULE_SERVICE_URL}/api/v1/module/students/${studentID}/modules`);
        modulesTakenByStudent = modulesTakenByStudent.data
        
        if (modulesTakenByStudent.success == false) {
            return res.status(500).json({
                success: false,
                error: "Error getting all modules taken by student",
            });
        }

        const educatorIds = modulesTakenByStudent.data
        .map(module => module.educator_id)
        .filter(id => id !== null) 
        .join(','); 
        
        let professorInfo = await axios.get(`${USER_SERVICE_URL}/api/v1/user/professors?ids=${educatorIds}`);
        if (professorInfo.success == false){
            return res.json({
                success: true,
                data: modulesTakenByStudent.data,
            });
        }

        professorInfo = professorInfo.data
        const professorMap = Object.fromEntries(
            professorInfo.data.map(prof => [prof.matrix_id, prof])
        );
        
        const modulesWithProfessorInfo = modulesTakenByStudent.data.map(module => ({
            ...module,
            professor: professorMap[module.educator_id] || null
        }));

        return res.json({
            success: true,
            data: modulesWithProfessorInfo,
        });

    }

    catch (error){
        return res.status(500).json({
            success: false,
            error: "Error fetching all students by module",
        });
    }
}
