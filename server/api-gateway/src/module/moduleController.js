import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

const MODULE_SERVICE_URL = process.env.MODULE_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const REQUEST_SERVICE_URL = process.env.REQUEST_SERVICE_URL;

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

export const getModulesWithRequestsByProfessor = async (req, res) => {
    try {
        let profId = req.params.profId;

        let moduleData = await axios.get(`${MODULE_SERVICE_URL}/api/v1/module/professor/modules/${profId}`);

        let requestServiceData = await axios.get(`${REQUEST_SERVICE_URL}/api/v1/requests/professor/${profId}`);

        res.json({
            success: true,
            data: {
                modules: moduleData.data.data.map(
                    module => ({
                        ...module,
                        requests: requestServiceData.data.data.filter(
                            request => request.module_code === module.code
                        ).length,
                    })
                ),
            }
        });
    } catch (error) {
        console.error("Error fetching all modules with requests by professor:", error);
        return res.status(500).json({
            success: false,
            error: "Error fetching all modules with requests by professor",
        });
    }
}

