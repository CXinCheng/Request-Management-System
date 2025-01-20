const USER_MODULE_BASE_URL = "http://ec2-18-143-63-164.ap-southeast-1.compute.amazonaws.com:3003";
const REQUEST_BASE_URL = "http://ec2-18-143-63-164.ap-southeast-1.compute.amazonaws.com:3002";

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

const fetchLeaveApplications = async (userId) => {
  const response = await fetch(
    `${REQUEST_BASE_URL}/api/requests?userId=${userId}`
  );
  if (!response.ok) throw new Error("Failed to fetch leave applications");

  const data = await response.json();

  // Extract only the necessary fields
  return data.map(({ module_code, status }) => ({
    module_code,
    status,
  }));
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

    const leaveDataByModule = leaveApplications.reduce((acc, leave) => {
      if (!acc[leave.module_code]) {
        acc[leave.module_code] = { approved: 0, rejected: 0, pending: 0 };
      }
      acc[leave.module_code][leave.status.toLowerCase()] += 1;
      return acc;
    }, {});

    const leaveData = modules.map((module) => ({
      module: module.code, 
      approved: leaveDataByModule[module.code]?.approved || 0,
      rejected: leaveDataByModule[module.code]?.rejected || 0,
      pending: leaveDataByModule[module.code]?.pending || 0,
    }));

    return { modules, leaveData };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
};
