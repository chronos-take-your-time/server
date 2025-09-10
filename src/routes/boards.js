const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { handleResponse } = require('../utils/output');
const { memberOnly } = require('../utils/clerk');

/**
* Helper with the base structure for these routes
*
* @param {string} req - Requisition object.
* @param {string} res - Response object.
* @param {Object} action - A function to be executed.
* @returns {Promise<Object>} The result of the operation.
*/
async function routeHelper(req, res, action, admin=false) {
  const { userId } = req.auth;
  memberOnly(userId, teamId, admin)
  const result = action;
  handleResponse(res, result);
}

/**
* Create a new board for the specified team and board ID.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID for the new board.
* @param {Object} req.body - The request body containing board details, which will be stringified.
* @returns {Promise<Object>} The result of the board creation operation.
*/
router.post('/:team_id/:id', async (req, res) => {
  const teamId = req.params.team_id;
  const boardId = req.params.id;
  const boardData = JSON.stringify(req.body);
  routeHelper(req, res, controller.createBoard(teamId, boardId, boardData));
});

/**
* Return the board JSON for the specified team and board ID.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID for the new board.
* @param {Object} req.body - The request body containing board details, which will be stringified.
* @returns {Promise<Object>} The result of the board return operation.
*/
router.get('/:team_id/:id', async (req, res) => {
  const teamId = req.params.team_id;
  const boardId = req.params.id;
  routeHelper(req, res, controller.getBoard(teamId, boardId));
});

/**
* Delete the specified board for the given team.
*
* @param {string} req.params.team_id - The ID of the team to which the board belongs.
* @param {string} req.params.id - The ID of the board to delete.
* @returns {Promise<Object>} The result of the board deletion operation.
*/
router.delete('/:team_id/:id', async (req, res) => {
  const teamId = req.params.team_id;
  const boardId = req.params.id;
  routeHelper(req, res, controller.createBoard(teamId, boardId), true);
});

/**
* Get all boards for a specific team.
*
* @param {string} req.params.team_id - The ID of the team for which to retrieve boards.
* @returns {Promise<Object>} The result containing the list of boards for the specified team.
*/
router.get('/:team_id', async (req, res) => {
  const teamId = req.params.team_id;
  routeHelper(req, res, controller.getTeamBoards(teamId));
});

module.exports = router;
