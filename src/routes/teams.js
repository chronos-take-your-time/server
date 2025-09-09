const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const clerkClient = require('../utils/clerk');
const { handleResponse } = require('../utils/output');
const { isUserTeam } = require('../utils/teamAuth');

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

/**
 * Creates application-level resources for a pre-existing Clerk team.
 *
 * @route POST /create/:id
 * @returns {object} {status, message, resource}
 */
router.post('/create/:id', async (req, res) => {
  const { userId } = req.auth;
  const teamId = req.params.id;

  try {
    const org = await getById(teamId, 'team');
    if (!org) {
      return handleResponse(res, { status: 400, message: 'bad request: organization not found', resource: `organization@${teamId}` });
    }

    if (!(await isUserTeam(userId, teamId))) {
      return handleResponse(res, { status: 403, message: 'forbidden: only team admins can perform this action', resource: `organization@${teamId}` });
    }

    const result = await controller.createTeam(teamId, req.body);
    handleResponse(res, result);
  } catch (err) {
    handleResponse(res, { status: 500, message: 'internal server error', resource: err.message });
  }
});

/**
 * Retrieves the member IDs of an existing team.
 *
 * @route GET /:teamId/
 * @returns {object} {status, message, resource}
 */
router.get('/:teamId/', async (req, res) => {
  const teamId = req.params.teamId;
  const { userId } = req.auth;

  try {
    if (!(await isUserTeam(userId, teamId, 'org:member'))) {
      return handleResponse(res, { status: 403, message: 'forbidden: only team members can perform this action', resource: `organization@${teamId}` });
    }

    const members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: teamId });
    const ids = members.data.map(m => m.publicUserData?.userId);

    handleResponse(res, {
      status: 200,
      message: members.data.length ? 'success: members found' : 'success: no members found',
      resource: ids,
    });
  } catch (err) {
    handleResponse(res, { status: 400, message: `bad request: failed to get members (${err.message})`, resource: `team@${teamId}` });
  }
});

/**
 * Adds a user to an existing team by user ID.
 *
 * @route POST /:teamId/:userId
 * @returns {object} {status, message, resource}
 */
router.post('/:teamId/:userId', async (req, res) => {
  const { teamId, userId: userIdAdding } = req.params;
  const { userId } = req.auth;

  if (!(await isUserTeam(userId, teamId, 'org:admin'))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team admins can perform this action', resource: `organization@${teamId}` });
  }
  
  try {
    const membership = await getMembership(teamId, userIdAdding);
    if (membership) {
      return handleResponse(res, { status: 202, message: 'success: user already in team', resource: `team@${teamId}` });
    }

    await clerkClient.organizations.createOrganizationMembership({ organizationId: teamId, userId: userIdAdding, role: 'org:member' });

    handleResponse(res, { status: 202, message: 'success: user added to team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 400, message: `bad request: ${err.message}`, resource: `team@${teamId}` });
  }
});

/**
 * Removes a user from an existing team by user ID.
 *
 * @route DELETE /:teamId/:userId
 * @returns {object} {status, message, resource}
 */
router.delete('/:teamId/:userId', async (req, res) => {
  const { userId } = req.auth;
  const { teamId, userId: userIdRemoving } = req.params;

  try {
    const membership = await getMembership(teamId, userIdRemoving);
    if (!membership) {
      return handleResponse(res, { status: 400, message: 'bad request: user is not a member of this team', resource: `team@${teamId}` });
    }

    if (!(await isUserTeam(userId, teamId, 'org:admin'))) {
      return handleResponse(res, { status: 403, message: 'forbidden: only team admins can perform this action', resource: `organization@${teamId}` });
    }

    if (membership.role === 'org:owner') {
      return handleResponse(res, { status: 400, message: 'bad request: cannot remove team owner', resource: `team@${teamId}` });
    }

    await clerkClient.organizations.deleteOrganizationMembership({ organizationId: teamId, userId: userIdRemoving });

    handleResponse(res, { status: 202, message: 'success: user removed from team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 400, message: `bad request: ${err.message}` });
  }
});

/**
 * Deletes a team in both Clerk and your application.
 *
 * @route DELETE /:team_id
 * @returns {object} {status, message, resource}
 */
router.delete('/:team_id', async (req, res) => {
  const teamId = req.params.team_id;
  const { userId } = req.auth;

  if (!(await isUserTeam(userId, teamId, 'org:admin'))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team admins can perform this action', resource: `organization@${teamId}` });
  }

  try {
    await clerkClient.organizations.deleteOrganization(teamId);
    await controller.deleteTeam(teamId);
    handleResponse(res, { status: 202, message: 'success: team deleted in clerk and app' });
  } catch (err) {
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return handleResponse(res, { status: 400, message: 'bad request: team not found in clerk' });
    }
    handleResponse(res, { status: 400, message: `bad request: ${err.message}` });
  }
});

module.exports = router;
