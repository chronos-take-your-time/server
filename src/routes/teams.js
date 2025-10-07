const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/output');
const { routeHelper } = require('../utils/routeHelper');
const { clerkClient, getMembership } = require('../utils/clerk');

/**
 * Creates application-level resources for a pre-existing Clerk team.
 *
 * @route POST /create/:id
 * @returns {object} {status, message, resource}
 */
router.post('/create/:id', async (req, res) => {
  routeHelper(req, res, async () => {
    try {
      const { id } = req.params;

      //-- usar essa verificação se for criar os times com a api do server --//
      //const org = await getById(teamId, 'team');
      //if (!org) return handleResponse(res, { status: 400, message: 'bad request: organization not found', resource: `organization@${teamId}` });
      
      const result = controller.createTeam(id);
      handleResponse(res, result);
    } catch (err) {
      handleResponse(res, { status: 500, message: 'internal server error', resource: err.message });
    }
  });
});

/**
 * Retrieves the member IDs of an existing team.
 *
 * @route GET /:teamId/
 * @returns {object} {status, message, resource}
 */
router.get('/:teamId/', async (req, res) => {
  const teamId = req.params.teamId;
  routeHelper(req, res, async () => {
    try {
      const { teamId } = req.params;

      // get members of an organizations and map then into an object, if there is no one return a proper message
      const members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: teamId });
      const ids = members.data.map(m => m.publicUserData?.userId);
      const message = members.data.length ? 'success: members found' : 'success: members not found';

      handleResponse(res, { status: 200, message: message, resource: ids, });

    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: failed to get members (${err.message})`, resource: `team@${teamId}` });
    }
  });


});

/**
 * Adds a user to an existing team by user ID.
 *
 * @route POST /:teamId/:userId
 * @returns {object} {status, message, resource}
 */
router.post('/:teamId/:userId', async (req, res) => {
  const { teamId, userId: userIdAdding } = req.params;

  routeHelper(req, res, async () => {
    try {
      const { teamId } = req.params
      // ensure user is not in the team, otherwise return
      const membership = await getMembership(teamId, userIdAdding);
      if (membership) return handleResponse(res, { status: 202, message: 'success: user already in team', resource: `team@${teamId}` });

      // add user to team
      await clerkClient.organizations.createOrganizationMembership({ organizationId: teamId, userId: userIdAdding, role: 'org:member' });
      handleResponse(res, { status: 202, message: 'success: user added to team', resource: `team@${teamId}` });
    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: ${err.message}`, resource: `team@${teamId}` });
    }
  }, true);
});

/**
 * Removes a user from an existing team by user ID.
 *
 * @route DELETE /:teamId/:userId
 * @returns {object} {status, message, resource}
 */
router.delete('/:teamId/:userId', async (req, res) => {
  const { teamId, userId: userIdRemoving } = req.params;
  routeHelper(req, res, async () => {
    try {
      // ensure user is in team, otherwise return
      const membership = await getMembership(teamId, userIdRemoving);
      if (!membership) return handleResponse(res, { status: 400, message: 'bad request: user is not a member of this team', resource: `team@${teamId}` });

      // cannot remove admin
      if (membership.role == 'org:admin') {
        return handleResponse(res, { status: 400, message: 'bad request: cannot remove team admin', resource: `team@${teamId}` });
      }

      // removing user
      await clerkClient.organizations.deleteOrganizationMembership({ organizationId: teamId, userId: userIdRemoving });
      handleResponse(res, { status: 202, message: 'success: user removed from team', resource: `team@${teamId}` });
    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: [${err.message}]` });
    }
  }, true);
});

/**
 * Deletes a team in both Clerk and your application.
 *
 * @route DELETE /:teamId
 * @returns {object} {status, message, resource}
 */
router.delete('/:teamId', async (req, res) => {
  routeHelper(req, res, async () => {
    const { teamId } = req.params
    try {
      await clerkClient.organizations.deleteOrganization(teamId);
      await controller.deleteTeam(teamId);
      handleResponse(res, { status: 202, message: 'success: team deleted in clerk and app' });
    } catch (err) {
      if (err?.errors?.[0]?.code === 'resource_not_found') {
        return handleResponse(res, { status: 400, message: 'bad request: team not found in clerk' });
      }
      handleResponse(res, { status: 400, message: `bad request: [${err.message}]` });
    }
  }, true);
});

module.exports = router;
