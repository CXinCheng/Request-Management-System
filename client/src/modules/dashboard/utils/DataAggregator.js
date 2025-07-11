import { gatewayApiService, requestApiService } from "@/utils/ApiService";
import dayjs from "dayjs";
/**
 * Fetch modules for a specific user from the user_module_mapping table.
 * @param {string} userId - User ID from local storage
 * @returns {Promise<Array>} List of modules the user is enrolled in
 */
const fetchUserMappedModules = async (userId) => {
  try {
    const response = await gatewayApiService.getModulesTakenByStudent(userId);
    console.log("API Response:", response.data);
    if (!response || response.length === 0) {
      console.warn(`No mapped modules found for user ${userId}`);
      return [];
    }

    return response.data.map(({ module_code, name, professor }) => ({
      module_code,
      name,         
      educator_name: professor?.name || "N/A", // ✅ Extract only the professor's name  
    })).filter(
      (value, index, self) =>
        index === self.findIndex((m) => m.module_code === value.module_code)
    );
  } catch (error) {
    console.error("Error fetching user-mapped modules:", error);
    return [];
  }
};


const fetchLeaveApplications = async (userId) => {
  try {
    const response = await requestApiService.getAllRequestsByStudent(userId);

    console.log("API Response:", response.data);

    if (!response.data || response.datalength === 0) {
      console.warn(`No leave applications found for user ${userId}`);
      return [];
    }

    return response.data.map(({ id, start_date_of_leave, end_date_of_leave, created_at, status, module_code, approver_name }) => ({
      id,
      start_date: dayjs(start_date_of_leave).format("DD-MM-YYYY HH:mm:ss"),
      end_date: dayjs(end_date_of_leave).format("DD-MM-YYYY HH:mm:ss"),
      created_at,
      status,
      module_code,
      approver_name,
    }));
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    return [];
  }
};





/**
 * Aggregate data for the dashboard.
 * - Fetches enrolled modules and leave data for a specific user.
 * @param {number} userId - User ID
 * @returns {Promise<{ modules: Array, leaveData: Array }>} Aggregated data
 */
export const aggregateDashboardData = async (userId) => {
  try {
    const [modules, leaveApplications] = await Promise.all([
      fetchUserMappedModules(userId), // Calls the correct modules for the user
      fetchLeaveApplications(userId), // Fetches leave applications
    ]);
    console.log("Leave Applications Response:", leaveApplications);
    return { modules, leaveData: leaveApplications || []}; // Return data in correct format
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
};

