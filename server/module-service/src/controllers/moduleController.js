import updateService from "../services/updateService.js";
import { db } from "../configs/db.js";




// Fetch modules from user_module_mapping based on userId
export const getUserMappedModules = async (req, res) => {
  const { userId } = req.params; // Extract userId from URL
  console.log("DB Query Result:"); // Debugging
  try {
    const result = await db.any(
      "SELECT module_code, class_no FROM user_module_mapping WHERE user_matrix_id = $1;",
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
        "INSERT INTO user_module_mapping (user_matrix_id, module_code, class_no) VALUES ($1, $2, $3);",
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
                    error: "Matrix ID not found or User is not a Professor"
                });
            }
        }
        
        await db.none("UPDATE request_management.modules SET educator_id = $1 WHERE code = $2", [educator_id, module_code]);
        return res.status(200).json({
            success: true,
            data: "Educator updated successfully"
        });
    } catch (error) {
        console.error("Error updating educator:", error);
        return res.status(500).json({
            success: false,
            error: "Error updating educator",
        });
    }
};

export const getModuleTimetableByClassNo = async (req, res) => {
    const moduleCode = req.params.moduleCode;
    const classNo = req.params.classNo;
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
            "SELECT * FROM request_management.classes WHERE module_code = $1 AND class_no = $2",
            [moduleCode, classNo]
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
