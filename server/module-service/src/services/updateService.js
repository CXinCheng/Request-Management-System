import { db, initialize, close } from "../configs/db.js";
import fs from "fs";
import pLimit from 'p-limit';


class UpdateService {
    // for this default value should we change it to 
    // retrieve from what is currently stored in the db?
    DEFATUL_ACADEMIC_YEAR = "2024-2025";
    DEFAULT_SEMESTER = 2;

    constructor(academicYear, semester) {
        this.academicYear = academicYear || this.DEFATUL_ACADEMIC_YEAR;
        this.semester = semester || this.DEFAULT_SEMESTER;
        this.startDate = this.getSemesterStartDate(this.academicYear, this.semester);
    }

    async initialize() {
        // initialize should only be called whenit is a new sem
        await this.updateSystemSetting();
        await this.loadSettings();
        await this.deleteModulesAndClasses();
        await this.populateModulesAndClasses();
        await this.updateFaculties();
    }

    async updateSystemSetting () {
        try{
            await db.none(
                "UPDATE request_management.system_settings SET value = $1 WHERE key = 'academic_year'",
                [this.academicYear.toString()]
            );

            await db.none(
                "UPDATE request_management.system_settings SET value = $1 WHERE key = 'semester_number'",
                [this.semester.toString()]
            );

            await db.none(
                "UPDATE request_management.system_settings SET value = $1 WHERE key = 'semester_start_date'",
                [this.startDate.toString()]
            );
        } catch (error) {
            console.error("Error updating system settings:", error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            const academicYearSetting = await db.oneOrNone(
                "SELECT value FROM request_management.system_settings WHERE key = 'academic_year'"
            );

            const semesterSetting = await db.oneOrNone(
                "SELECT value FROM request_management.system_settings WHERE key = 'semester_number'"
            );

            this.academicYear =
                academicYearSetting?.value || this.DEFATUL_ACADEMIC_YEAR;
            this.semester = semesterSetting?.value
                ? parseInt(semesterSetting.value)
                : this.DEFAULT_SEMESTER;

            // console.log(`Loaded settings: Academic Year: ${this.academicYear}, Semester: ${this.semester}`);
        } catch (error) {
            console.error("Error loading system settings:", error);
        }
    }

    async callNusModsModuleList() {
        // Production
        const response = await fetch(
            `https://api.nusmods.com/v2/${this.academicYear}/moduleList.json`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const latestModuleList = await response.json(); 
        
        // Filter modules based on semester
        const filteredModuleList = latestModuleList.filter((module) =>
            Array.from(module.semesters).includes(this.semester)
        );

        return filteredModuleList
    }
    
    async getModuleDetails(moduleCode) {
        try {
            const response = await fetch(
                `https://api.nusmods.com/v2/${this.academicYear}/modules/${moduleCode}.json`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let data = await response.json();

            const semesterData = data.semesterData.find(s => s.semester === this.semester);
            const examDate = semesterData?.examDate || null;

            // const timeTable = (semesterData?.timetable || []).map(timetable => ({
            //     classNo: timetable.classNo,
            //     lessonType: timetable.lessonType,
            //     day: timetable.day,
            //     startTime: timetable.startTime,
            //     endTime: timetable.endTime,
            //     weeks: JSON.stringify(timetable.weeks),
            //     venue: timetable.venue || "",
            // }));

            const timeTable = (semesterData?.timetable || []).flatMap(timetable => {
                const lessonType = String(timetable.lessonType).trim();
                const validLessonTypes = ["Lecture", "Tutorial", "Laboratory"];

                if (!validLessonTypes.includes(lessonType)) {
                    // console.warn(`Skipping invalid lessonType: "${lessonType}"`);
                    return []; 
                }

                return [{
                    classNo: timetable.classNo,
                    lessonType: lessonType,
                    day: timetable.day,
                    startTime: timetable.startTime,
                    endTime: timetable.endTime,
                    weeks: JSON.stringify(timetable.weeks),
                    venue: timetable.venue || "", // include venue if needed
                }];
            });


            return {
                moduleCode: data.moduleCode,
                examDate,
                timeTable,
            };

        } catch (error) {
            console.error("Error fetching module timetable:", error);
            return null
        }
    }

    async deleteModulesAndClasses() {
        console.log("Deleting all modules in module table...");
        try {
            await db.none(
                "TRUNCATE TABLE request_management.modules_copy CASCADE" 
            );

            console.log("Successfully removed all modules")
        } catch (error) {
            console.error(
                `Error removing all modules from request_management.modules_copy ${error}`,
            );
        }
    }

    async populateModulesAndClasses() {
        let currentSemList = []
        const limit = pLimit(10); // Limit to 10 concurrent requests

        try {
            console.log("Calling NUS Mods API")
            currentSemList = await this.callNusModsModuleList()
            this.populateModules(currentSemList)

            const limitedPromises = currentSemList.map(module =>
                limit(() => this.getModuleDetails(module.moduleCode))
            );
 
            const results = await Promise.all(limitedPromises);
            const validModules = results.filter(Boolean); // Remove failed fetches
            let lessonRows = []
            let examDateUpdates = []

            for (const module of validModules) {
                const { moduleCode, examDate, timeTable } = module;

                if (examDate) {
                    examDateUpdates.push({ moduleCode, examDate });
                }

                for (const lesson of timeTable) {
                    const validLessonTypes = ["Lecture", "Tutorial", "Laboratory"];
                    if (validLessonTypes.includes(lesson.lessonType)) {
                        lessonRows.push([
                            moduleCode,
                            lesson.classNo,
                            lesson.lessonType,
                            lesson.day,
                            lesson.startTime,
                            lesson.endTime,
                            lesson.weeks,
                            lesson.venue
                        ]);
                    }
                }
            }

            // Bulk insert into classes_copy
            if (lessonRows.length > 0) {
                console.log(`num of lessonRows to insert: ${lessonRows.length}`)
                const values = [];
                const placeholders = lessonRows.map((row, i) => {
                    const baseIndex = i * 8;
                    values.push(...row);
                    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7},  $${baseIndex + 8})`;
                });

                console.log("Forming classes insert query")
                const query = `
                    INSERT INTO request_management.classes_copy 
                    (module_code, class_no, class_type, day_of_week, starting_time, ending_time, weeks, venue)
                    VALUES ${placeholders.join(', ')}
                `;
                close()
                await initialize();
                try {
                    await db.none(query, values);
                    console.log(`Inserted ${lessonRows.length} class rows`);
                } catch (err) {
                    console.error('Bulk insert for request_management.classes_copy failed:', err);
                }
            }

            // Batch update exam dates
            try {
                close();
                await initialize();

                console.log("Updating exam date")
                const values = examDateUpdates
                    .map(({ moduleCode, examDate }) => `('${examDate}'::timestamp, '${moduleCode}')`)
                    .join(', ');

                await db.none(
                    `
                    UPDATE request_management.modules_copy AS m
                    SET
                        exam_date = v.exam_date,
                        class_last_updated_at = NOW()
                    FROM (
                        VALUES ${values}
                    ) AS v(exam_date, code)
                    WHERE m.code = v.code
                    `
                );

            } catch (err) {
                console.error("Failed to batch update exam dates:", err);
            }

            console.log(`Processed ${validModules.length} modules`);

        } catch (error) {
            console.error(
                `populateModAndClass error ${error}`
            );
        }
    }

    async populateModules(currentSemModules) {
        console.log("Forming bulk insert statement...")
        const values = [];
        const placeholders = [];

        currentSemModules.forEach((module, index) => {
            const baseIndex = index * 3;
            values.push(module.moduleCode, module.title, new Date()); 
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`); // generates ($1, $2, $3)
        });

        const query = `
            INSERT INTO request_management.modules_copy (code, name, class_last_updated_at)
            VALUES ${placeholders.join(', ')}
        `;

        console.log("Populating module database...")
        try {
            await db.none(query, values);
            console.log('Bulk insert successful.');
        } catch (error) {
            console.error('Bulk insert failed:', error);
        }
    }

    async updateFaculties(){
        const response = await fetch(
            `https://api.nusmods.com/v2/${this.academicYear}/facultyDepartments.json`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const facultiesJson = await response.json(); 
        let faculties = Object.values(facultiesJson).flat()
        faculties = [...new Set(faculties)];

        try {
            console.log("Deleting all old faculties...")
            await db.none("DELETE FROM request_management.faculties_copy");
            for (let faculty of faculties) {
                await db.none(
                    "INSERT INTO request_management.faculties_copy (name) VALUES ($1)",
                    [faculty]
                );
            }
            console.log("Faculties updated.");
        } catch (error) {
            console.error("Error updating faculties:", error);
            throw error;
        }
        
    }

    getSemesterStartDate(academicYear, semester) {
        const [yearStart, yearEnd] = academicYear.split("-").map(Number);

        // Determine calendar year based on semester logic
        const year = semester === 1 ? yearStart : yearEnd;

        let month;
        let weekOffset;

        switch (semester) {
            case 1:
                month = 7; // August
                weekOffset = 0; // 1st Monday
                break;
            case 2:
                month = 0; // January
                weekOffset = 1; // 2nd Monday
                break;
            case 3:
                month = 4; // May
                weekOffset = 1; // 2nd Monday
                break;
            case 4:
                month = 5; // June
                weekOffset = 3; // 4th Monday
                break;
            default:
                throw new Error("Invalid semester number. Must be 1–4.");
        }

        const date = new Date(year, month, 1);

        // Find the first Monday of the month
        const firstMondayOffset = (8 - date.getDay()) % 7;
        date.setDate(1 + firstMondayOffset + 7 * weekOffset);

        return date;
    }

}

export default UpdateService;
// export default new UpdateService();
