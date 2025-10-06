const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { routeHelper } = require('../utils/routeHelper');
const { handleResponse } = require('../utils/output');

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
  
  routeHelper(req, res, ()=>{
    const result = controller.createBoard(teamId, boardId, boardData);
    const response = handleResponse(result);

    res.status(response.status).json(response.payload);
  });
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

  routeHelper(req, res, ()=>{ 
    const result = controller.getBoard(teamId, boardId);
    const response = handleResponse(result);

    res.status(response.status).json(response.payload);
  });
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

  routeHelper(req, res, ()=>{ 
    const result = controller.deleteBoard(teamId, boardId);
    const response = handleResponse(result);

    res.status(response.status).json(response.payload);
  }, true);
});

/**
* Get all boards for a specific team.
*
* @param {string} req.params.team_id - The ID of the team for which to retrieve boards.
* @returns {Promise<Object>} The result containing the list of boards for the specified team.
*/
router.get('/:teamId', async (req, res) => {
  routeHelper(req, res, ()=>{
    const {teamId} = {...req.params}
    const result = controller.getTeamBoards(teamId);
    const response = handleResponse(result);

    res.status(response.status).json(response.payload);
  });
});

module.exports = router;
