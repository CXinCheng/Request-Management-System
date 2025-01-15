import { log } from "console";
import { db } from "../configs/db/db.js";
import fs from "fs";

export class UpdateService {
    academicYear;

    constructor(academicYear) {
        this.academicYear = academicYear;
    }

    async getModuleList() {
        try {
            const response = await fetch(
                `https://api.nusmods.com/v2/${this.academicYear}/moduleList.json`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const latestModuleList = await response.json();
            // const latestModuleList = await JSON.parse(
            //     fs.readFileSync('data/moduleListNew.json', "utf-8")
            // );
            const localModuleList = await JSON.parse(
                fs.readFileSync('data/moduleList.json', "utf-8")
            );
            
            const changes = this.compareChanges(localModuleList, latestModuleList);

            if (changes.added.length > 0 || changes.updated.length > 0 || changes.deleted.length > 0) {
                console.log("Changes detected in module list.");
                
                fs.writeFileSync('data/moduleList.json', JSON.stringify(latestModuleList, null, 2));
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
            }
            catch (error) {
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
