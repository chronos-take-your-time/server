const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/handleResponse');
import { clerkClient } from 'clerk/backend';

/**
* Check if an organization exists by its ID.
* @param id - The organization ID to check.
* @returns The organization object if it exists, or null if not.
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
* Creates a directory structure for a pre-existing team in Clerk.
*
* @param {string} req.params.id - The unique identifier of the team in Clerk.
* @param {Object} req.body - The request body containing additional team data.
* @returns {Promise<Object>} The result of the directory creation process.
*/
router.post('/create/:id', (req, res) => {
  getOrganizationById(req.params.id)
    .then((org) => {
      if (!org) {
        return res.status(404).json({ status: 'error', message: 'Organization not found', resource: `organization@${req.params.id}` });
      }

      const result = controller.createTeam(req.params.id, req.body);
      handleResponse(res, result);
    })
});

/**
 * Retrieves the member IDs of an existing team.
 * @route GET /:team_id/
 * @param {string} req.params.team_id - The unique identifier of the team.
 * @returns {Array<string>} List of member IDs.
 */
router.get('/:team_id/', async (req) => {
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: req.params.team_id, limit: 100 });

    return memberships.map(member => member.publicUserData.userId);
  }
);
/**
 * Adds a user to an existing team by user ID.
 * @route POST /:team_id/add/:user_id
 * @param {string} req.params.team_id - The unique identifier of the team.
 * @param {string} req.params.user_id - The unique identifier of the user.
 * @returns {Object} Result of the add operation.
 */
router.post('/:team_id/add/:user_id', (req, res) => {
  const result = controller.addUser(req.params.team_id, req.params.user_id);
  handleResponse(res, result);
});

/**
 * Removes a user from an existing team by user ID.
 * @route POST /:team_id/remove/:user_id
 * @param {string} req.params.team_id - The unique identifier of the team.
 * @param {string} req.params.user_id - The unique identifier of the user.
 * @returns {Object} Result of the remove operation.
 */
router.post('/:team_id/remove/:user_id', (req, res) => {
  const result = controller.removeUser(req.params.team_id, req.params.user_id);
  handleResponse(res, result);
});

/**
 * Deletes a team and all files in its directory.
 * @route DELETE /:team_id
 * @param {string} req.params.team_id - The unique identifier of the team.
 * @returns {Object} Result of the delete operation.
 */
router.delete('/:team_id', (req, res) => {
  const result = controller.deleteTeam(req.params.team_id);
  handleResponse(res, result);
});

module.exports = router;
