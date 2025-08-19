const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { handleResponse } = require('../utils/output');

// create/update a existing board
router.post('/:team_id/:id', (req, res) => {
  const result = controller.createBoard(req.params.team_id, req.params.id, JSON.stringify(req.body));
  handleResponse(res, result);
});

// get a board JSON
router.get('/:team_id/:id', (req, res) => {
  const result = controller.getBoard(req.params.team_id, req.params.id);
  handleResponse(res, result);
});

// delete a board
router.delete('/:team_id/:id', (req, res) => {
  const result = controller.deleteBoard(req.params.team_id, req.params.id);
  handleResponse(res, result);
});

// get all boards id from a team
router.get('/:team_id', (req, res) => {
  const result = controller.getTeamBoards(req.params.team_id);
  handleResponse(res, result);
});

module.exports = router;
