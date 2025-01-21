import { db } from "../configs/db.js";
import fs from "fs";

class UpdateService {
    academicYear = "2024-2025";
    semester = 1;

    async getModuleList() {
        try {
            // const response = await fetch(
            //     `https://api.nusmods.com/v2/${this.academicYear}/moduleList.json`
            // );
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const latestModuleList = await response.json();
            const latestModuleList = await JSON.parse(
                fs.readFileSync('data/moduleList copy.json', "utf-8")
            );
            const localModuleList = await JSON.parse(
                fs.readFileSync("data/moduleList.json", "utf-8")
            );

            const changes = this.compareChanges(localModuleList, latestModuleList);

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
                console.log('Local module list updated.');
            }
            return changes;
        } catch (error) {
            console.error("Error fetching module list:", error);
            throw error;
        }
    }

    async updateModule() {
        const moduleListChanges = await this.getModuleList();

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
        console.log(`Inserted ${insertCount} new modules.`);
        console.log(`Updated ${updateCount} existing modules.`);
        console.log(`Deleted ${deleteCount} modules.`);
        console.log("Module database updated.");
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
                examDate: responseJson.semesterData.filter(
                    (semester) => semester.semester === this.semester
                )[0].examDate,
                timeTable: responseJson.semesterData
                    .filter((semester) => semester.semester === this.semester)[0].timetable
                    .map((timetable) => {
                        return {
                            classNo: timetable.classNo,
                            lessonType: timetable.lessonType,
                            day: timetable.day,
                            startTime: timetable.startTime,
                            endTime: timetable.endTime,
                        };
                    }),
            };
            return data
        } catch (error) {
            console.error("Error fetching module timetable:", error);
            throw error;
        }
    }

    async addClass(moduleCode) {
        const moduleDetails = await this.getModuleDetails(moduleCode);
        console.log(moduleDetails);
        try {
            for (let lesson of moduleDetails.timeTable) {
                await db.none(
                    "INSERT INTO request_management.classes (module_code, class_no, class_type, day_of_week, starting_time, ending_time) VALUES ($1, $2, $3, $4, $5, $6)",
                    [
                        moduleCode,
                        lesson.classNo,
                        lesson.lessonType,
                        lesson.day,
                        lesson.startTime,
                        lesson.endTime,
                    ]
                );
            }
            await db.none(
                'UPDATE request_management.modules SET exam_date = $1, class_last_updated_at = NOW() WHERE code = $2',
                [moduleDetails.examDate, moduleCode]
            );
        } catch (error) {
            console.error("Error adding module classes:", error);
            throw error;
        }
    }

    async updateClass(moduleCode) {
        const moduleDetails = await this.getModuleDetails(moduleCode);

        try {
            for (let lesson of moduleDetails.timeTable) {
                await db.none(
                    'UPDATE request_management.classes SET class_type = $3, day_of_week = $4, starting_time = $5, ending_time = $6 WHERE module_code = $1 AND class_no = $2',
                    [
                        moduleCode,
                        lesson.classNo,
                        lesson.lessonType,
                        lesson.day,
                        lesson.startTime,
                        lesson.endTime,
                    ]
                );
            }
            await db.none(
                "UPDATE request_management.modules SET class_last_updated_at = $2 WHERE code = $1",
                [moduleCode, new Date()]
            );
        } catch (error) {
            console.error("Error updating module classes:", error);
            throw error;
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
}

export default new UpdateService();
