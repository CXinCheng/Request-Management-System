import { db } from "../configs/db/db.js";
import fs from "fs";

class UpdateService {

    academicYear = "2024-2025";

    async getModuleList() {
        try {
            // const response = await fetch(
            //     "https://api.nusmods.com/v2/2018-2019/moduleList.json"
            // );
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const data = await response.json();
            const data = JSON.parse(
                fs.readFileSync("./data/moduleList.json", "utf-8")
            );
            return data;
        } catch (error) {
            console.error("Error fetching module list:", error);
            throw error;
        }
    }

    async updateDB() {
        console.log("Updating module database...");

        const moduleList = await this.getModuleList();
        let insertCount = 0;

        for (let module of moduleList) {
            try {
                const existingModule = await db.oneOrNone(
                    "SELECT * FROM request_management.modules WHERE code = $1",
                    module.moduleCode
                );

                if (!existingModule) {
                    await db.one(
                        "INSERT INTO request_management.modules (code, name) VALUES ($1, $2) RETURNING id",
                        [module.moduleCode, module.title]
                    );
                    insertCount++;
                }
            } catch (error) {
                console.error(
                    "Error processing module:",
                    module.moduleCode,
                    error
                );
            }
        }
        console.log(`Inserted ${insertCount} new modules.`);
    }
}

export default new UpdateService();
