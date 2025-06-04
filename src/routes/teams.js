const express = require('express');
const router = express.Router();
const controller = require('../controllers/teams');
const { handleResponse } = require('../utils/handleResponse');

// create a new team
router.post('/create/:user_id', (req, res) => {
  // verify if user_id is valid
  // create a team with owner_id as user_id
  const result = controller.createTeam(req.params.user_id, req.body);
  handleResponse(res, result);
});

// get members id of an existing team
router.get('/:team_id/', (req, res) => {
  // verify if team_id is valid
  // return a list of members id
  const result = controller.getMembers(req.params.team_id);
  handleResponse(res, result);
});

// add user by id to an existing team
router.post('/:team_id/add/:user_id', (req, res) => {
  // verify if user_id is valid
  // verify if team_id is valid
  // add user to team
  const result = controller.addUser(req.params.team_id, req.params.user_id);
  handleResponse(res, result);
});

// remove user by id of an existing team
router.post('/:team_id/remove/:user_id', (req, res) => {
  // verify if user_id is valid
  // verify if team_id is valid
  // remove user to team
  const result = controller.removeUser(req.params.team_id, req.params.user_id);
  handleResponse(res, result);
});

// delete a team
router.delete('/:team_id', (req, res) => {
  // verify if is a valid team_id
  // delete the team and all files in its dir
  const result = controller.deleteTeam(req.params.team_id);
  handleResponse(res, result);
});

module.exports = router;
