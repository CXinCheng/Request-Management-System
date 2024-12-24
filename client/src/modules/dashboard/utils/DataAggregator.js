const REQUEST_BASE_URL = "http://localhost:3002"; // Request service base URL
const MODULE_BASE_URL = "http://localhost:3003"; // Module service base URL (adjust if separate)

/**
 * Fetch module data from the Module Service.
 * @returns {Promise<Array>} List of modules
 */
const fetchModules = async () => {
  const response = await fetch(`${MODULE_BASE_URL}/api/modules`);
  if (!response.ok) throw new Error("Failed to fetch modules");
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
 * Aggregate leave data by joining modules and leave applications.
 * @returns {Promise<Array>} Aggregated leave data
 */
export const aggregateDashboardData = async () => {
  try {
    // Fetch data in parallel
    const [modules, leaveApplications] = await Promise.all([
      fetchModules(),
      fetchLeaveApplications(),
    ]);

    // Transform leaveApplications to group by module_id
    const leaveDataByModule = leaveApplications.reduce((acc, leave) => {
      if (!acc[leave.Module_Id]) {
        acc[leave.Module_Id] = { approved: 0, rejected: 0, pending: 0 };
      }
      acc[leave.Module_Id][leave.Status.toLowerCase()] += 1;
      return acc;
    }, {});

    // Aggregate data by joining with modules
    const aggregatedLeaveData = modules.map((module) => ({
      module: module.Name,
      approved: leaveDataByModule[module.ID]?.approved || 0,
      rejected: leaveDataByModule[module.ID]?.rejected || 0,
      pending: leaveDataByModule[module.ID]?.pending || 0,
    }));

    return { modules, aggregatedLeaveData };
  } catch (error) {
    console.error("Error aggregating dashboard data:", error);
    throw error;
  }
};
