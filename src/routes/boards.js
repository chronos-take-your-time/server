const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const handleResponse = require('../utils/handleResponse');

// update a existing board
router.post('/:team_id/:id', (req, res) => {
  const result = controller.createBoard(req.params.team_id, req.params.id, req.body);
  handleResponse(res, result);
});

// get a board JSON
router.get('/:team_id/:id', (req, res) => {
  // TODO: implement a way to retrieve a board
  res.status(501).json({ message: 'todo' });
});

// delete a board
router.delete('/:team_id/:id', (req, res) => {
  const result = controller.deleteBoard(req.params.team_id, req.params.id);
  handleResponse(res, result);
});

module.exports = router;
