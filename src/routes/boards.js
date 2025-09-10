const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { handleResponse } = require('../utils/output');
const { memberOnly } = require('../utils/clerk');

/**
* Create a new board for the specified team and board ID.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID for the new board.
* @param {Object} req.body - The request body containing board details, which will be stringified.
* @returns {Promise<Object>} The result of the board creation operation.
*/
router.post('/:team_id/:id', async (req, res) => {
  const { userId } = req.auth;
  memberOnly(userId, teamId)
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
  const { userId } = req.auth;
  memberOnly(userId, teamId)
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
  const { userId } = req.auth;
  memberOnly(userId, teamId, true);
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
  const { userId } = req.auth;
  memberOnly(userId, teamId);
  const result = controller.getTeamBoards(req.params.team_id);
  handleResponse(res, result);
});

module.exports = router;
