import axios from "axios";

const API_GATEWAY_URL = `http://localhost:${process.env.PORT || 4000}`;

export const getAllModules = async (req, res) => {
    try {
        let moduleData = await axios.get(`${API_GATEWAY_URL}/api/module/all`);

        let educatorData = await axios.get(`${API_GATEWAY_URL}/api/user/all/professors`);

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
