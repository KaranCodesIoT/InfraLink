export const ROLES = {
    // Platform admin
    ADMIN: 'admin',

    // Original platform roles
    CLIENT: 'client',
    WORKER: 'worker',

    // Extended construction industry roles
    NORMAL_USER: 'normal_user',   // homeowner / individual
    BUILDER: 'builder',           // construction company / developer
    CONTRACTOR: 'contractor',     // sub-contractor
    ARCHITECT: 'architect',       // design professional
    LABOUR: 'labour',             // individual skilled/unskilled labour
    SUPPLIER: 'supplier',         // material/equipment supplier
};

export const ALL_ROLES = Object.values(ROLES);

/**
 * HIRING_RULES — defines which roles a requester can hire.
 * Key   = requester role
 * Value = array of allowed provider roles
 *
 * Rules:
 *  1. Builder      → can hire Contractors AND Architects
 *  2. Contractor   → can hire Labour
 *  3. Normal User  → can hire Contractors
 *  4. Client       → can hire Contractors and Workers (legacy support)
 *  5. Architect, Labour, Supplier → cannot hire anyone
 */
export const HIRING_RULES = {
    [ROLES.BUILDER]: [ROLES.CONTRACTOR, ROLES.ARCHITECT],
    [ROLES.CONTRACTOR]: [ROLES.LABOUR],
    [ROLES.NORMAL_USER]: [ROLES.CONTRACTOR],
    [ROLES.CLIENT]: [ROLES.CONTRACTOR, ROLES.WORKER],   // legacy
    [ROLES.ADMIN]: Object.values(ROLES),                // admin can do anything
};

/**
 * Check if a requester role is allowed to hire a provider role.
 * @param {string} requesterRole
 * @param {string} providerRole
 * @returns {boolean}
 */
export const canHire = (requesterRole, providerRole) => {
    const allowed = HIRING_RULES[requesterRole];
    return Array.isArray(allowed) && allowed.includes(providerRole);
};

/**
 * Get all roles a given role is allowed to hire.
 * @param {string} role
 * @returns {string[]}
 */
export const getAllowedProviderRoles = (role) => HIRING_RULES[role] || [];
