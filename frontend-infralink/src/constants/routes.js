export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ROLE_SELECT: '/role-select',

  // Dashboard (role-aware)
  DASHBOARD: '/dashboard',
  FEED: '/feed',

  // Jobs
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  JOB_POST: '/jobs/post',
  MY_JOBS: '/my-jobs',
  MY_APPLICATIONS: '/my-applications',
  APPLICATION_DETAIL: '/applications/:id',

  // Workers & Directory
  WORKERS: '/workers',
  WORKER_PROFILE: '/workers/:id',
  DIRECTORY: '/directory',
  DIRECTORY_DETAIL: '/directory/:id',

  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_NEW: '/projects/new',

  // Builder Projects
  BUILDER_PROJECTS: '/builder-projects',
  POST_BUILDER_PROJECT: '/builder-projects/post',

  // Project Management Dashboard
  PROJECT_DASHBOARD: '/project/:id/dashboard',
  PROJECT_DASHBOARD_OVERVIEW: '/project/:id/dashboard',
  PROJECT_DASHBOARD_WORKFLOW: '/project/:id/dashboard/workflow',
  PROJECT_DASHBOARD_TASKS: '/project/:id/dashboard/tasks',
  PROJECT_DASHBOARD_TEAMS: '/project/:id/dashboard/teams',
  PROJECT_DASHBOARD_MATERIALS: '/project/:id/dashboard/materials',
  PROJECT_DASHBOARD_FINANCE: '/project/:id/dashboard/finance',
  PROJECT_DASHBOARD_ISSUES: '/project/:id/dashboard/issues',
  PROJECT_DASHBOARD_UPDATES: '/project/:id/dashboard/updates',
  PROJECT_DASHBOARD_DOCUMENTS: '/project/:id/dashboard/documents',

  // Marketplace
  MARKETPLACE: '/marketplace',
  MATERIAL_DETAIL: '/marketplace/:id',

  // Equipment
  EQUIPMENT: '/equipment',
  EQUIPMENT_DETAIL: '/equipment/:id',
  MY_EQUIPMENT: '/my-equipment',

  // Messaging
  MESSAGES: '/messages',
  MESSAGE_THREAD: '/messages/:id',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments/:id',

  // Reviews
  REVIEWS: '/reviews',

  // Profile
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  FAVORITES: '/favorites',

  // Search
  SEARCH: '/search',

  // AI Assistant
  AI_ASSISTANT: '/ai',

  // Matching
  MATCHING: '/matching',

  // Services
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_ESCALATIONS: '/admin/escalations',
  ADMIN_SETTINGS: '/admin/settings',
};
