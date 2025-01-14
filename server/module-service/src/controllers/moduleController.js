export const getModuleTimetable = async (req, res) => {
    const academicYear = "2024-2025";
    const moduleCode = req.params.moduleCode;
    let data = null;
    try {
        const response = await fetch(
            `https://api.nusmods.com/v2/${academicYear}/modules/${moduleCode}.json`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseJson = await response.json();
        data = {
            moduleCode: responseJson.moduleCode,
            semesterData: responseJson.semesterData.map((semester) => {
                return {
                    semester: semester.semester,
                    timetable: semester.timetable.map((lesson) => {
                        return {
                            classNo: lesson.classNo,
                            lessonType: lesson.lessonType,
                            day: lesson.day,
                            startTime: lesson.startTime,
                            endTime: lesson.endTime,
                        };
                    }),
                    examDate: semester.examDate,
                };
            }),
        };
    } catch (error) {
        console.error("Error fetching module timetable:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching module timetable",
        });
    }
    res.json({
        success: true,
        data: data,
    });
};

export const getModuleList = async (req, res) => {
    const moduleList = await moduleService.getModuleList();
    res.json(moduleList);
};

export const updateModuleDB = async (req, res) => {
    await moduleService.updateDB();
    res.json({ success: true });
};

export const getModule = async (req, res) => {
    const moduleCode = req.params.moduleCode;
    const module = await moduleService.getModule(moduleCode);
    res.json(module);
};

export const getModuleByCode = async (req, res) => {
    const moduleCode = req.params.moduleCode;
    const module = await moduleService.getModuleByCode(moduleCode);
    res.json(module);
};
export const getModuleById = async (req, res) => {
    const moduleId = req.params.moduleId;
    const module = await moduleService.getModuleById(moduleId);
    res.json(module);
};
