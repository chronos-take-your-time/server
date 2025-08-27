const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const clerkClient = require('../utils/clerk');
const handleResponse = require('../utils/output');

/**
* Check if a user or team exists by its id.
* @param id - the entity id to check.
* @param type - the entity type in clerk ('user' or 'team').
* @returns the entity id if it exists, or error if not.
*/
async function getById(id, type) {
  try {
    const ent = (type == 'user') ? await clerkClient.users.getUser(id) : await clerkClient.organizations.getOrganization({ organizationId: id });
    return ent;
  } catch (err) {
    const message = (type == 'user') ? 'user not found' : 'organization not found';
    return handleResponse(res, { status: 400, message });
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
  getById(req.params.id, 'team')
    .then((org) => {
      if (!org) {
        return handleResponse(res, { status: 400, message: 'organization not found', resource: `organization@${req.params.id}` });
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
    const result = {status: 200, message: members.data.length ? 'members found' : 'no members found', resource: members.data.map(m => m.publicUserData?.userId)}
    handleResponse(res, result);
  } catch (err) {
    handleResponse(res, { status: 400, message: `failed to get members (${err.message})`, resource: `team@${teamId}` });
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
    // check if user is already in team
    const membership = await getMembership(teamId, userId);
    if (membership) return handleResponse(res, { status: 202, message: 'user already in team', resource: `team@${teamId}` });

    await clerkClient.organizations.createOrganizationMembership({
      organizationId: teamId,
      userId: userId,
      role: 'org:member'
    });

    handleResponse(res, { status: 202, message: 'user added to team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 400, message: err.message, resource: `team@${teamId}` });
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
    // check if user is in team
    const membership = await getMembership(teamId, userId);
    if (!membership) return handleResponse(res, { status: 400, message: 'user is not a member of this team' });

    // prevent removing owner from team
    if (membership.role == 'org:owner') { return handleResponse(res, { status: 400, message: 'cannot remove team owner', resource: `team@${teamId}` }) };

    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: teamId,
      userId: userId
    });
    handleResponse(res, { status: 202, message: 'user removed from team', resource: `team@${teamId}` });
  } catch (err) {
    handleResponse(res, { status: 400, message: err.message });
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
    await controller.deleteTeam(teamId);
    handleResponse(res, { status: 202, message: 'team deleted in clerk and app' });
  } catch (err) {
    // this will occurs when team isnt properly found like mistyped id 
    if (err?.errors?.[0]?.code === 'resource_not_found') {
      return handleResponse(res, { status: 400, message: 'team not found in clerk' });
    }
    handleResponse(res, { status: 400, message: err.message });
  }
});

module.exports = router;
