// Define permission levels for different user roles
const PERMISSIONS = {
  SUPERADMIN: {
    dashboard: true,
    users: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage_permissions: true,
    },
    products: {
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
    categories: {
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
    orders: {
      view: true,
      update: true,
      cancel: true,
    },
    warehouse: {
      view: true,
      manage: true,
      transfer: true,
      audit: true,
    },
    stores: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manage: true,
    },
    reports: {
      view: true,
      export: true,
    },
    settings: true,
  },
  ADMIN: {
    dashboard: true,
    users: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      manage_permissions: false,
    },
    products: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
    categories: {
      view: true,
      create: true,
      edit: true,
      delete: false,
    },
    orders: {
      view: true,
      update: true,
      cancel: true,
    },
    warehouse: {
      view: true,
      manage: true,
      transfer: true,
      audit: false,
    },
    stores: {
      view: true,
      create: false,
      edit: true,
      delete: false,
      manage: true,
    },
    reports: {
      view: true,
      export: true,
    },
    settings: false,
  },
  WAREHOUSE: {
    dashboard: true,
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      manage_permissions: false,
    },
    products: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    categories: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    orders: {
      view: true,
      update: false,
      cancel: false,
    },
    warehouse: {
      view: true,
      manage: true,
      transfer: true,
      audit: false,
    },
    stores: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      manage: false,
    },
    reports: {
      view: true,
      export: false,
    },
    settings: false,
  },
  STORE: {
    dashboard: true,
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      manage_permissions: false,
    },
    products: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    categories: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    orders: {
      view: true,
      update: true,
      cancel: false,
    },
    warehouse: {
      view: false,
      manage: false,
      transfer: false,
      audit: false,
    },
    stores: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      manage: false,
    },
    reports: {
      view: true,
      export: false,
    },
    settings: false,
  },
};

// Check if a user has permission for a specific action
export const hasPermission = (userRole, permissionPath) => {
  if (!userRole || !permissionPath) return false;
  
  // Convert role to uppercase to match our permission object
  const role = userRole.toUpperCase();
  
  // If role doesn't exist in our permissions, deny access
  if (!PERMISSIONS[role]) return false;
  
  // Split the permission path (e.g., "users.create" becomes ["users", "create"])
  const pathParts = permissionPath.split('.');
  
  // Start at the role's permissions
  let currentPermission = PERMISSIONS[role];
  
  // Traverse the permission path
  for (const part of pathParts) {
    // If we've reached a boolean or undefined, return it
    if (typeof currentPermission !== 'object') {
      return !!currentPermission;
    }
    
    // Move to the next level in the permission object
    currentPermission = currentPermission[part];
    
    // If undefined, permission doesn't exist, so deny access
    if (currentPermission === undefined) {
      return false;
    }
  }
  
  // Return the final permission value, converting to boolean
  return !!currentPermission;
};

// Get all permissions for a role
export const getRolePermissions = (userRole) => {
  if (!userRole) return {};
  
  const role = userRole.toUpperCase();
  return PERMISSIONS[role] || {};
};

// Custom permissions can be added for specific users
export const createCustomPermissions = (baseRole, overrides) => {
  const basePermissions = getRolePermissions(baseRole);
  return { ...basePermissions, ...overrides };
};

export default {
  hasPermission,
  getRolePermissions,
  createCustomPermissions,
  PERMISSIONS,
};
