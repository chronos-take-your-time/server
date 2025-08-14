const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/handleResponse');
const clerkClient = require('../utils/clerk');
const { humanOutput } = require('../utils/output');

/**
* Check if an organization exists by its id.
* @param id - the organization id to check.
* @returns the organization object if it exists, or null if not.
*/
async function getOrganizationById(id) {
  try {
    const org = await clerkClient.organizations.getOrganization({ organizationId: id });
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
    const user = await clerkClient.users.getUser(id);
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
* @param teamId - the organization id.
* @param userId - the user id.
* @returns the membership object if it exists, or null if not.
*/
async function getMembership(teamId, userId) {
  let members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId : teamId });
  return members.data.find(m => m.publicUserData?.userId === userId) || null;
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
router.get('/:teamId/', async (req, res) => {
  const teamId = req.params.teamId;
  try {
    let members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId : teamId });

    // this will map members.data to only publicUserData.userId
    const result = {status: 'success', message: members.data.length ? 'members found' : 'no members found', resource: members.data.map(m => m.publicUserData?.userId)}
    handleResponse(res, result);
  } catch (err) {
    handleResponse(res, { status: 'error', message: `failed to get members (${err.message})`, resource: `team@${teamId}` });
  }
});

/**
 * Adds a user to an existing team by user id.
 * @route post /:team_id/:user_id
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @param {string} req.params.user_id - the unique identifier of the user.
 * @returns {object} result of the add operation.
 */
router.post('/:teamId/:userId', async (req, res) => {
  const { teamId, userId } = req.params;
  
  try {
    humanOutput('info', `Adding user@${userId} to team@${teamId}`);
    const [org, user] = await Promise.all([
      getOrganizationById(teamId),
      getUserById(userId)
    ]);
    humanOutput('info', `Found organization: [${org ? org.id : 'not found'}], user: [${user ? user.id : 'not found'}]`)
    if (!org) return handleResponse(res, { status: false, message: 'team not found' });
    if (!user) return handleResponse(res, { status: false, message: 'user not found' });

    const membership = await getMembership(org.id, user.id);
    if (membership) return handleResponse(res, { status: 'error', message: 'user already in team', resource: `team@${teamId}` });

    await clerkClient.organizations.createOrganizationMembership({
      organizationId: teamId,
      userId: userId,
      role: 'org:member'
    });

    handleResponse(res, { status: 'success', message: 'user added to team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 'error', message: err.message });
  }
});

/**
 * Removes a user from an existing team by user id.
 * @route delete /:team_id/:user_id
 * @param {string} req.params.team_id - the unique identifier of the team.
 * @param {string} req.params.user_id - the unique identifier of the user.
 * @returns {object} result of the remove operation.
 */
router.delete('/:teamId/:userId', async (req, res) => {
  const { teamId, userId } = req.params;
  try {
    const [org, user] = await Promise.all([
      getOrganizationById(teamId),
      getUserById(userId)
    ]);

    // verification before remove user from team
    if (!org) return handleResponse(res, { status: false, message: 'team not found' });
    if (!user) return handleResponse(res, { status: false, message: 'user not found' });

    const membership = await getMembership(teamId, userId);

    if (!membership) return handleResponse(res, { status: false, message: 'user is not a member of this team' });
    if (membership.role == 'org:owner') { return handleResponse(res, { status: 'error', message: 'cannot remove team owner', resource: `team@${teamId}` }) };
    humanOutput('info', `Removing user@${userId} from team@${teamId}`);
    // user is at team so we can delete him
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: teamId,
      userId: userId
    });
    handleResponse(res, { status: 'success', message: 'user removed from team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 'error', message: err.message });
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
    await clerkClient.organizations.deleteOrganization(teamId);
    const result = await controller.deleteTeam(teamId);
    handleResponse(res, { status: true, message: 'team deleted in clerk and app', ...result });
  } catch (err) {
    // this will occurs when team isnt properly found like mistyped id 
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return handleResponse(res, { status: 'success', message: 'team not found in clerk' });
    }
    handleResponse(res, { status: 'error', message: err.message });
  }
});

module.exports = router;
