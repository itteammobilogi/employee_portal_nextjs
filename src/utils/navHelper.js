import { navConfig } from "./navConfig";

export const getFirstRouteByRole = (roleId, departmentId) => {
  const role = parseInt(roleId);
  const dept = parseInt(departmentId);

  const config = navConfig[role];
  if (!config) return "/dashboard";

  // Employee role (3) has a direct array
  if (Array.isArray(config)) {
    return config[0]?.path || "/dashboard";
  }

  // Role with 'any' section
  if (config.any?.length) {
    return config.any[0].path;
  }

  // Role with department-specific config (e.g., finance)
  if (config[dept]?.length) {
    return config[dept][0].path;
  }

  return "/dashboard";
};
