const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/handleResponse');
const server = require('../server');

/**
* Check if an organization exists by its id.
* @param id - the organization id to check.
* @returns the organization object if it exists, or null if not.
*/
async function getOrganizationById(id) {
  try {
    const org = await server.clerkClient.organizations.getOrganization({ organizationId: id });
    return org;
  } catch (err) {
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return null;
    }
    throw err;
  }
}

/**
* Check if a user exists by its id.
* @param id - the user id to check.
* @returns the user object if it exists, or null if not.
*/
async function getUserById(id) {
  try {
    const user = await server.clerkClient.users.getUser(id);
    return user;
  } catch (err) {
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return null;
    }
    throw err;
  }
}

/**
* Get a user's membership in an organization.
* @param orgId - the organization id.
* @param userId - the user id.
* @returns the membership object if it exists, or null if not.
*/
async function getMembership(orgId, userId) {
  const memberships = await server.clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  });
  return memberships.find(m => m.publicUserData?.userId === userId) || null;
}

/**
* Creates a directory structure for a pre-existing team in clerk.
*
* @param {string} req.params.id - the unique identifier of the team in clerk.
* @param {object} req.body - the request body containing additional team data.
* @returns {promise<object>} the result of the directory creation process.
*/
router.post('/create/:id', (req, res) => {
  getOrganizationById(req.params.id)
    .then((org) => {
      if (!org) {
        return res.status(404).json({ status: 'error', message: 'organization not found', resource: `organization@${req.params.id}` });
      }
      const result = controller.createTeam(req.params.id, req.body);
      handleResponse(res, result);
    });
});

/**
 * Retrieves the member ids of an existing team.
 * @route get /:team_id/
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @returns {array<string>} list of member ids.
 */
router.get('/:team_id/', async (req, res) => {
  try {
    const memberships = await server.clerkClient.organizations.getOrganizationMembershipList({
      organizationId: req.params.team_id,
      limit: 100
    });
    const ids = memberships.map(member => member.publicUserData?.userId);
    handleResponse(res, ids);
  } catch (err) {
    handleResponse(res, { status: 'error', message: 'failed to get members', details: err.message }, 500);
  }
});

/**
 * Adds a user to an existing team by user id.
 * @route post /:team_id/:user_id
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @param {string} req.params.user_id - the unique identifier of the user.
 * @returns {object} result of the add operation.
 */
router.post('/:team_id/:user_id', async (req, res) => {
  const { team_id, user_id } = req.params;
  try {
    const [org, user] = await Promise.all([
      getOrganizationById(team_id),
      getUserById(user_id)
    ]);
    if (!org) return handleResponse(res, { success: false, message: 'team not found' }, 404);
    if (!user) return handleResponse(res, { success: false, message: 'user not found' }, 404);

    const membership = await getMembership(org.id, user.id);
    if (membership) return handleResponse(res, { success: false, message: 'user already in team' }, 409);

    await server.clerkClient.organizations.createOrganizationMembership({
      organizationId: org.id,
      userId: user.id,
      role: 'basic_member'
    });
    handleResponse(res, { success: true, message: 'user added to team' });
  } catch (err) {
    handleResponse(res, { success: false, message: err.message }, 500);
  }
});

/**
 * Removes a user from an existing team by user id.
 * @route post /:team_id/:user_id
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @param {string} req.params.user_id - the unique identifier of the user.
 * @returns {object} result of the remove operation.
 */
router.delete('/:team_id/:user_id', async (req, res) => {
  const { team_id, user_id } = req.params;
  try {
    const [org, user] = await Promise.all([
      getOrganizationById(team_id),
      getUserById(user_id)
    ]);
    if (!org) return handleResponse(res, { success: false, message: 'team not found' }, 404);
    if (!user) return handleResponse(res, { success: false, message: 'user not found' }, 404);

    const membership = await getMembership(org.id, user.id);
    if (!membership) return handleResponse(res, { success: false, message: 'user is not a member of this team' }, 409);

    await server.clerkClient.organizations.deleteOrganizationMembership(membership.id);
    handleResponse(res, { success: true, message: 'user removed from team' });
  } catch (err) {
    handleResponse(res, { success: false, message: err.message }, 500);
  }
});

/**
 * Deletes a team in both clerk and your application, and all files in its directory.
 * @route delete /:team_id
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @returns {object} result of the delete operation.
 */
router.delete('/:team_id', async (req, res) => {
  const teamId = req.params.team_id;
  try {
    await server.clerkClient.organizations.deleteOrganization(teamId);
    const result = await controller.deleteTeam(teamId);
    handleResponse(res, { success: true, message: 'team deleted in clerk and app', ...result });
  } catch (err) {
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return handleResponse(res, { success: false, message: 'team not found in clerk' }, 404);
    }
    handleResponse(res, { success: false, message: err.message }, 500);
  }
});

module.exports = router;