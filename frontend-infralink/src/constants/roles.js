export const ROLES = {
  UNASSIGNED: 'unassigned',
  ADMIN: 'admin',
  CLIENT: 'client',
  WORKER: 'worker',
  NORMAL_USER: 'normal_user',
  BUILDER: 'builder',
  CONTRACTOR: 'contractor',
  ARCHITECT: 'architect',
  LABOUR: 'labour',
  SUPPLIER: 'supplier',
};

export const ALL_ROLES = Object.values(ROLES);

// Construction directory roles (shown as cards in the directory dashboard)
export const DIRECTORY_ROLES = ['builder', 'contractor', 'architect', 'labour', 'supplier'];

// Roles that POST jobs / hire others
export const HIRING_ROLES = [ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT, ROLES.ADMIN];

// Roles that look for work
export const WORKER_ROLES = [ROLES.WORKER, ROLES.CONTRACTOR, ROLES.ARCHITECT, ROLES.LABOUR];

// Label map for display
export const ROLE_LABELS = {
  [ROLES.UNASSIGNED]: 'Unassigned',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CLIENT]: 'Client',
  [ROLES.WORKER]: 'Worker',
  [ROLES.NORMAL_USER]: 'Homeowner',
  [ROLES.BUILDER]: 'Builder / Developer',
  [ROLES.CONTRACTOR]: 'Contractor',
  [ROLES.ARCHITECT]: 'Architect',
  [ROLES.LABOUR]: 'Skilled Labour',
  [ROLES.SUPPLIER]: 'Material Supplier',
};
