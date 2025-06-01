import { log } from "console";
import { db } from "../configs/db.js";
import fs from "fs";
import { stringify } from "querystring";

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
        await this.updateSystemSetting();
        await this.loadSettings();
        await this.updateFaculties();
        await this.updateModule();
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

    async getModuleList() {
        try {
            // Production
            // const response = await fetch(
            //     `https://api.nusmods.com/v2/${this.academicYear}/moduleList.json`
            // );
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const latestModuleList = await response.json();

            // Dev
            const latestModuleList = await JSON.parse(
                fs.readFileSync("data/moduleList_latest.json", "utf-8")
            );

            // Filter modules based on semester
            const filteredModuleList = latestModuleList.filter((module) =>
                Array.from(module.semesters).includes(this.semester)
            );

            const localModuleList = await JSON.parse(
                fs.readFileSync("data/moduleList.json", "utf-8")
            );

            const changes = this.compareChanges(
                localModuleList,
                filteredModuleList
            );

            // fs.writeFileSync(
            //     "data/moduleList1.json",
            //     JSON.stringify(filteredModuleList, null, 2)
            // );
            // console.log("Filtered module list saved to file.");

            if (
                changes.added.length > 0 ||
                changes.updated.length > 0 ||
                changes.deleted.length > 0
            ) {
                console.log("Changes detected in module list.");

                fs.writeFileSync(
                    "data/moduleList.json",
                    JSON.stringify(latestModuleList, null, 2)
                );
                console.log("Local module list updated.");
            }
            return changes;
        } catch (error) {
            console.error("Error fetching module list:", error);
            throw error;
        }
    }

    async updateModule() {
        const moduleListChanges = await this.getModuleList();
        if (
            moduleListChanges.added.length > 0 ||
            moduleListChanges.updated.length > 0 ||
            moduleListChanges.deleted.length > 0
        ) {
            let insertCount = 0;
            let updateCount = 0;
            let deleteCount = 0;

            console.log("Updating module database...");
            for (let module of moduleListChanges.added) {
                try {
                    await db.one(
                        "INSERT INTO request_management.modules (code, name) VALUES ($1, $2) RETURNING code",
                        [module.moduleCode, module.title]
                    );
                    insertCount++;
                } catch (error) {
                    console.error(
                        "Error processing module:",
                        module.moduleCode,
                        error
                    );
                }
            }
            for (let module of moduleListChanges.updated) {
                try {
                    await db.none(
                        "UPDATE request_management.modules SET name = $2 WHERE code = $1",
                        [module.moduleCode, module.title]
                    );
                    updateCount++;
                } catch (error) {
                    console.error(
                        "Error processing module:",
                        module.moduleCode,
                        error
                    );
                }
            }
            for (let module of moduleListChanges.deleted) {
                try {
                    await db.none(
                        "DELETE FROM request_management.modules WHERE code = $1",
                        [module.moduleCode]
                    );
                    deleteCount++;
                } catch (error) {
                    console.error(
                        "Error processing module:",
                        module.moduleCode,
                        error
                    );
                }
            }
            if (insertCount > 0)
                console.log(`Inserted ${insertCount} new modules.`);
            if (updateCount > 0)
                console.log(`Updated ${updateCount} existing modules.`);
            if (deleteCount > 0) console.log(`Deleted ${deleteCount} modules.`);
            console.log("Module database updated.");
        }
    }

    async getModuleDetails(moduleCode) {
        try {
            const response = await fetch(
                `https://api.nusmods.com/v2/${this.academicYear}/modules/${moduleCode}.json`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let responseJson = await response.json();
            const data = {
                moduleCode: responseJson.moduleCode,
                examDate:
                    responseJson.semesterData.filter(
                        (semester) => semester.semester === this.semester
                    )[0]?.examDate || null,
                timeTable: responseJson.semesterData
                    .filter(
                        (semester) => semester.semester === this.semester
                    )[0]
                    ?.timetable.map((timetable) => {
                        return {
                            classNo: timetable.classNo,
                            lessonType: timetable.lessonType,
                            day: timetable.day,
                            startTime: timetable.startTime,
                            endTime: timetable.endTime,
                            weeks: JSON.stringify(timetable.weeks),
                        };
                    }),
            };
            return data;
        } catch (error) {
            console.error("Error fetching module timetable:", error);
            throw error;
        }
    }

    async addClass(moduleCode) {
        const moduleDetails = await this.getModuleDetails(moduleCode);
        try {
            if (moduleDetails.timeTable) {
                for (let lesson of moduleDetails.timeTable) {
                    const validLessonTypes = [
                        "Lecture",
                        "Tutorial",
                        "Laboratory",
                    ];
                    if (validLessonTypes.includes(lesson.lessonType)) {
                        await db.none(
                            "INSERT INTO request_management.classes (module_code, class_no, class_type, day_of_week, starting_time, ending_time, weeks) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                            [
                                moduleCode,
                                lesson.classNo,
                                lesson.lessonType,
                                lesson.day,
                                lesson.startTime,
                                lesson.endTime,
                                lesson.weeks,
                            ]
                        );
                    }
                }
            }
            await db.none(
                "UPDATE request_management.modules SET exam_date = $1, class_last_updated_at = NOW() WHERE code = $2",
                [moduleDetails.examDate, moduleCode]
            );
        } catch (error) {
            console.error("Error adding module classes:", error);
            throw error;
        }
    }

    async updateClass(moduleCode) {
        try {
            await db.none(
                "DELETE FROM request_management.classes WHERE module_code = $1",
                [moduleCode]
            );
            await this.addClass(moduleCode);
        } catch (error) {
            console.error("Error updating module classes:", error);
            throw error;
        }
    }

    async updateFaculties() {
        // Production
        // const response = await fetch(
        //     `https://api.nusmods.com/v2/${this.academicYear}/facultyDepartments.json`
        // );
        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const faculties = await response.json();

        // Dev
        const latestFacultyList = await JSON.parse(
            fs.readFileSync("data/facultyList_latest.json", "utf-8")
        );

        const localFacultyList = await JSON.parse(
            fs.readFileSync("data/facultyList.json", "utf-8")
        );

        const latestJSON = JSON.stringify(latestFacultyList);
        const localJSON = JSON.stringify(localFacultyList);

        if (latestJSON !== localJSON) {
            const facultySet = new Set();
            Object.values(latestFacultyList).forEach((faculty) => {
                faculty.forEach((f) => facultySet.add(f));
            });
            const facultyList = Array.from(facultySet);
            // console.log(facultyList);

            try {
                await db.none("DELETE FROM request_management.faculties");
                for (let faculty of facultyList) {
                    await db.none(
                        "INSERT INTO request_management.faculties (name) VALUES ($1)",
                        [faculty]
                    );
                }
                console.log("Faculties updated.");
                fs.writeFileSync(
                    "data/facultyList.json",
                    JSON.stringify(latestFacultyList, null, 2)
                );
            } catch (error) {
                console.error("Error updating faculties:", error);
                throw error;
            }
        }
    }

    compareChanges(localModuleList, latestModuleList) {
        const changes = {
            added: [],
            updated: [],
            deleted: [],
        };
        for (const module of latestModuleList) {
            const existingRecord = localModuleList.find(
                (m) => m.moduleCode === module.moduleCode
            );
            if (!existingRecord) {
                changes.added.push(module);
            } else if (existingRecord.title !== module.title) {
                changes.updated.push(module);
            }
        }
        for (const module of localModuleList) {
            const stillExists = latestModuleList.find(
                (m) => m.moduleCode === module.moduleCode
            );
            if (!stillExists) {
                changes.deleted.push(module);
            }
        }
        return changes;
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
