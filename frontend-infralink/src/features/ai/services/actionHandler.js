/**
 * Action Handler — Maps backend actions to frontend navigation/UI triggers
 */

const ACTION_ROUTES = {
    'open_ar': '/ar-view',
    'navigate_jobs': '/jobs',
    'navigate_profile': '/profile',
    'navigate_messages': '/messages',
    'navigate_dashboard': '/dashboard',
    'navigate_projects': '/projects',
    'navigate_directory': '/directory',
    'navigate_notifications': '/notifications',
    'navigate_payments': '/payments',
    'navigate_marketplace': '/marketplace',
    'navigate_settings': '/settings',
    'navigate_home': '/'
};

/**
 * Execute a frontend action from the assistant response.
 * Returns { handled, route } or null.
 */
export const executeAction = (action, data, navigate) => {
    if (!action) return null;

    // Navigation actions
    if (ACTION_ROUTES[action]) {
        const route = ACTION_ROUTES[action];

        if (action === 'open_ar' && data?._id) {
            navigate(`/ar-view/${data._id}`);
        } else {
            navigate(route);
        }

        return { handled: true, route };
    }

    // Display actions (handled by the chat UI itself)
    const displayActions = ['show_workers', 'show_projects', 'show_materials', 'show_jobs'];
    if (displayActions.includes(action)) {
        return { handled: false, display: action };
    }

    return null;
};

/**
 * Check if action requires navigation (vs inline display)
 */
export const isNavigationAction = (action) => {
    return !!ACTION_ROUTES[action];
};

/**
 * Get a human-readable label for an action
 */
export const getActionLabel = (action) => {
    const labels = {
        'show_workers': '👷 Workers Found',
        'show_projects': '🏗️ Projects Found',
        'show_materials': '📦 Materials Found',
        'show_jobs': '💼 Jobs Found',
        'open_ar': '🏗️ Open AR Viewer',
        'navigate_jobs': '💼 Go to Jobs',
        'navigate_profile': '👤 Go to Profile',
        'navigate_messages': '💬 Go to Messages',
        'navigate_dashboard': '📊 Go to Dashboard',
        'navigate_projects': '🏠 Go to Projects',
        'navigate_directory': '📋 Browse Directory',
        'navigate_notifications': '🔔 Notifications',
        'navigate_payments': '💳 Payments',
    };
    return labels[action] || action;
};
