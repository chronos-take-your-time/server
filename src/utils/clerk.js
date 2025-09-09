const { createClerkClient } = require('@clerk/backend');
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
console.log(process.env.CLERK_SECRET_KEY)

/**
 * Retrieves a user or organization from Clerk by its ID.
 *
 * @async
 * @param {string} id - Unique identifier of the entity.
 * @param {'user'|'team'} type - Entity type: 'user' or 'team'.
 * @returns {Promise<object>} Entity object if found.
 * @throws {Error} If the entity does not exist.
 */
async function getById(id, type) {
    try {
        const ent = type === 'user'
        ? await clerkClient.users.getUser(id)
        : await clerkClient.organizations.getOrganization({ organizationId: id });
        return ent;
    } catch (err) {
        throw new Error(type === 'user' ? 'user not found' : 'organization not found');
    }
}

/**
 * Checks whether a user has sufficient permissions within a team/organization.
 *
 * @async
 * @param {string} userId - User ID to check.
 * @param {string} teamId - Team/organization ID.
 * @param {'org:member'|'org:admin'} [roleRequired='org:admin'] - Minimum required role.
 * @returns {Promise<boolean>} True if the user has required role, false otherwise.
 */
async function isUserTeam(userId, teamId, roleRequired = 'org:admin') {
    const ROLE_PRIORITY = {
        'org:member': 1,
        'org:admin': 2,
    };

    const me = await getMembership(teamId, userId);
    if (!me) return false;

    const userLevel = ROLE_PRIORITY[me.role] || 0;
    const requiredLevel = ROLE_PRIORITY[roleRequired] || Infinity;

    return userLevel >= requiredLevel;
}

/**
 * Retrieves a user's membership object in an organization.
 *
 * @async
 * @param {string} teamId - Organization ID.
 * @param {string} userId - User ID.
 * @returns {Promise<object|null>} Membership object if found, otherwise null.
 */
async function getMembership(teamId, userId) {
    let members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: teamId });
    return members.data.find(m => m.publicUserData?.userId === userId) || null;
}

module.exports = {
    clerkClient,
    getMembership,
    isUserTeam,
    getById
};
