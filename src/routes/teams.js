const express = require('express');
const router = express.Router();

// create a new team
app.post('/create/:user_id', (req, res) => {
  // verify if user_id is valid
  // create a team with owner_id as user_id
});

// get members id of an existing team
app.get('/:team_id/', (req, res) => {
  // verify if team_id is valid
  // return a list of members id
});

// add user by id to an existing team
app.post('/:team_id/add/:user_id', (req, res) => {
  // verify if user_id is valid
  // verify if team_id is valid
  // add user to team
});

// remove user by id of an existing team
app.post('/:team_id/remove/:user_id', (req, res) => {
  // verify if user_id is valid
  // verify if team_id is valid
  // remove user to team
});

// delete a team
app.delete('/:team_id', (req, res) => {
  // verify if is a valid team_id
  // delete the team and all files in its dir
});

module.exports = router;
