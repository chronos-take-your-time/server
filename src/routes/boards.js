const express = require('express');
const controller = require('../controllers/boards');
const { humanOutput } = require('../utils/output');
const router = express.Router();

function handleResult(res, result) {
  humanOutput(result.status, result.message, result.resource);
  if (result.status != 'success') {
    return res.status(400).json({ error: result.message, resource: result.resource });
  }
  return res.json({ message: result.message, resource: result.resource });
}

// update a existing board
router.post('/:team_id/:id', (req, res) => {
  const result = controller.createBoard(req.params.team_id, req.params.id, req.body);
  handleResult(res, result);
});

// get a board JSON
router.get('/:team_id/:id', (req, res) => {
  // TODO: implement a way to retrieve a board
  res.status(501).json({ message: 'todo' });
});

// delete a board
router.delete('/:team_id/:id', (req, res) => {
  const result = controller.deleteBoard(req.params.team_id, req.params.id);
  handleResult(res, result);
});

module.exports = router;
