const REQUEST_BASE_URL = "http://localhost:3002"; // Request service base URL
const USER_MODULE_BASE_URL = "http://localhost:3003"; // Base URL for User_Module API

/**
 * Fetch enrolled module data for a specific user.
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of modules the user is enrolled in
 */

const fetchUserModules = async (userId) => {
  const response = await fetch(`${USER_MODULE_BASE_URL}/api/userModules?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user modules");
  return await response.json();
};

/**
 * Fetch leave application data from the Request Service.
 * @returns {Promise<Array>} List of leave applications
 */
const fetchLeaveApplications = async () => {
  const response = await fetch(`${REQUEST_BASE_URL}/api/leaveApplications`);
  if (!response.ok) throw new Error("Failed to fetch leave applications");
  return await response.json();
};

/**
 * Aggregate data for the dashboard.
 * - Fetches enrolled modules and leave data for a specific user.
 * @param {number} userId - User ID
 * @returns {Promise<{ modules: Array, leaveData: Array }>} Aggregated data
 */
export const aggregateDashboardData = async (userId) => {
  try {
    // Fetch user-specific modules and leave applications in parallel
    const [modules, leaveApplications] = await Promise.all([
      fetchUserModules(userId),
      fetchLeaveApplications(),
    ]);

    // Transform leave applications to group by module_id
    const leaveDataByModule = leaveApplications.reduce((acc, leave) => {
      if (!acc[leave.Module_ID]) {
        acc[leave.Module_ID] = { approved: 0, rejected: 0, pending: 0 };
      }
      acc[leave.Module_ID][leave.Status.toLowerCase()] += 1;
      return acc;
    }, {});

    // Aggregate data by joining with modules
    const leaveData = modules.map((module) => ({
      module: module.module_name,
      approved: leaveDataByModule[module.module_id]?.approved || 0,
      rejected: leaveDataByModule[module.module_id]?.rejected || 0,
      pending: leaveDataByModule[module.module_id]?.pending || 0,
    }));

    return { modules, leaveData };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
};
