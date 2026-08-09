const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/output');
const { routeHelper } = require('../utils/routeHelper');
const { clerkClient, getMembership } = require('../utils/clerk');

router.post('/create/:id', async (req, res) => {
  const { id } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.createTeam(id)));
});

router.get('/:teamId/', async (req, res) => {
  const { teamId } = req.params;
  routeHelper(req, res, async () => {
    try {
      const members = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: teamId });
      const ids = members.data.map(m => m.publicUserData?.userId);
      const message = members.data.length ? 'success: members found' : 'success: members not found';
      handleResponse(res, { status: 200, message, resource: ids });
    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: failed to get members (${err.message})`, resource: `team@${teamId}` });
    }
  });
});

router.post('/:teamId/:userId', async (req, res) => {
  const { teamId, userId: userIdAdding } = req.params;
  routeHelper(req, res, async () => {
    try {
      const membership = await getMembership(teamId, userIdAdding);
      if (membership) return handleResponse(res, { status: 202, message: 'success: user already in team', resource: `team@${teamId}` });

      await clerkClient.organizations.createOrganizationMembership({ organizationId: teamId, userId: userIdAdding, role: 'org:member' });
      handleResponse(res, { status: 202, message: 'success: user added to team', resource: `team@${teamId}` });
    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: ${err.message}`, resource: `team@${teamId}` });
    }
  }, true);
});

router.delete('/:teamId/:userId', async (req, res) => {
  const { teamId, userId: userIdRemoving } = req.params;
  routeHelper(req, res, async () => {
    try {
      const membership = await getMembership(teamId, userIdRemoving);
      if (!membership) return handleResponse(res, { status: 400, message: 'bad request: user is not a member of this team', resource: `team@${teamId}` });

      if (membership.role == 'org:admin') {
        return handleResponse(res, { status: 400, message: 'bad request: cannot remove team admin', resource: `team@${teamId}` });
      }

      await clerkClient.organizations.deleteOrganizationMembership({ organizationId: teamId, userId: userIdRemoving });
      handleResponse(res, { status: 202, message: 'success: user removed from team', resource: `team@${teamId}` });
    } catch (err) {
      handleResponse(res, { status: 400, message: `bad request: [${err.message}]` });
    }
  }, true);
});

router.delete('/:teamId', async (req, res) => {
  const { teamId } = req.params;
  routeHelper(req, res, async () => {
    try {
      await clerkClient.organizations.deleteOrganization(teamId);
      controller.deleteTeam(teamId);
      handleResponse(res, { status: 202, message: 'success: team deleted in clerk and app' });
    } catch (err) {
      if (err?.errors?.[0]?.code === 'resource_not_found') {
        handleResponse(res, { status: 400, message: 'bad request: team not found in clerk' });
      }
      handleResponse(res, { status: 400, message: `bad request: [${err.message}]` });
    }
  }, true);
});

module.exports = router;
