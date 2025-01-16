import updateService from "../services/updateService.js";
import { db } from "../configs/db/db.js";

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
