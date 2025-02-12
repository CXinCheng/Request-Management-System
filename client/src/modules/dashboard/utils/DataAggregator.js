import { moduleApiService, requestApiService } from "@/utils/ApiService";


const fetchUserModules = async (userId) => {
  try {
    const response = await moduleApiService.getUserModules(userId); // Calls the correct API Gateway service

    if (!response || response.length === 0) {
      console.warn(`No modules found for user ${userId}`);
      return [];
    }

    return response.map(({ module_code, class_no }) => ({
      module_code,
      class_no,
    }));
  } catch (error) {
    console.error("Error fetching user modules:", error);
    return [];
  }
};

const fetchLeaveApplications = async (userId) => {
  try {
    const response = await requestApiService.getUserRequests(userId);

    if (!response || response.length === 0) {
      console.warn(`No leave applications found for user ${userId}`);
      return [];
    }

    return response.map(({ status, module_code }) => ({
      status,
      module_code,
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
      fetchUserModules(userId),
      fetchLeaveApplications(userId),
    ]);

    // Group leave applications by module_code
    const leaveDataByModule = leaveApplications.reduce((acc, leave) => {
      if (!acc[leave.module_code]) {
        acc[leave.module_code] = { approved: 0, rejected: 0, pending: 0 };
      }
      acc[leave.module_code][leave.status.toLowerCase()] += 1;
      return acc;
    }, {});

    // Join leave application data with enrolled modules
    const leaveData = modules.map((module) => ({
      module: module.module_code, 
      approved: leaveDataByModule[module.module_code]?.approved || 0,
      rejected: leaveDataByModule[module.module_code]?.rejected || 0,
      pending: leaveDataByModule[module.module_code]?.pending || 0,
    }));

    return { modules, leaveData };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
};

