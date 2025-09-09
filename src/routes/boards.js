const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { handleResponse } = require('../utils/output');
const { clerkClient, getMembership, isUserTeam, getById } = require('../utils/clerk');

/**
* Create a new board for the specified team and board ID.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID for the new board.
* @param {Object} req.body - The request body containing board details, which will be stringified.
* @returns {Promise<Object>} The result of the board creation operation.
*/
router.post('/:team_id/:id', async (req, res) => {
  // only member of team can do this
  const { userId } = req.auth;
  if (!(await isUserTeam(userId, teamId, 'org:member'))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team members can perform this action', resource: `organization@${teamId}` });
  }

  const result = controller.createBoard(req.params.team_id, req.params.id, JSON.stringify(req.body));
  handleResponse(res, result);
});

/**
* Return the board JSON for the specified team and board ID.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID for the new board.
* @param {Object} req.body - The request body containing board details, which will be stringified.
* @returns {Promise<Object>} The result of the board creation operation.
*/
router.get('/:team_id/:id', async (req, res) => {
  // only member of team can do this
  const { userId } = req.auth;
  if (!(await isUserTeam(userId, teamId, 'org:member'))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team members can perform this action', resource: `organization@${teamId}` });
  }
  
  const result = controller.getBoard(req.params.team_id, req.params.id);
  handleResponse(res, result);
});

/**
* Delete the specified board for the given team.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID of the board to delete.
* @returns {Promise<Object>} The result of the board deletion operation.
*/
router.delete('/:team_id/:id', async (req, res) => {
  // only admin of team can do this
  const { userId } = req.auth;
  if (!(await isUserTeam(userId, teamId))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team admins can perform this action', resource: `organization@${teamId}` });
  }

  const result = controller.deleteBoard(req.params.team_id, req.params.id);
  handleResponse(res, result);
});

/**
* Get all boards for a specific team.
*
* @param {string} req.params.team_id - The ID of the team for which to retrieve boards.
* @returns {Promise<Object>} The result containing the list of boards for the specified team.
*/
router.get('/:team_id', async (req, res) => {
  // only member of team can do this
  const { userId } = req.auth;
  if (!(await isUserTeam(userId, teamId, 'org:member'))) {
    return handleResponse(res, { status: 403, message: 'forbidden: only team members can perform this action', resource: `organization@${teamId}` });
  }
  
  const result = controller.getTeamBoards(req.params.team_id);
  handleResponse(res, result);
});

module.exports = router;
