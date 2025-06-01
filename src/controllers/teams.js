const fs = require('fs');
const path = require('path');
const { humanOutput } = require('../utils/output');

// baseDir is our "/teams" where all boards lives, refer to (https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/)
const baseDir = path.join(__dirname, '..', 'teams');

// ensures that our baseDir exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

function createTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);
  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath);
    humanOutput('success', 'created', `team@${teamId}`);
    return;
  }
  humanOutput('error', 'already exists', `team@${teamId}`);
}

// Cria um novo quadro (arquivo .json dentro do time)
function createBoard(teamId, boardId, boardData) {
  const teamPath = path.join(baseDir, teamId);
  if (!fs.existsSync(teamPath)) {
    humanOutput('error', 'does not exists at team@${teamId}', `team@${teamId}`);
    return;
  }
  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(boardPath, JSON.stringify(boardData, null, 2));
  humanOutput('success', 'created at team@${teamId}', `board@${boardId}`);
}

// Deleta um quadro de um time
function deleteBoard(teamId, boardId) {
  const boardPath = path.join(baseDir, teamId, `${boardId}.json`);
  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    humanOutput('success', 'deleted at team@${teamId}', `board@${boardId}`);
  } else {
    humanOutput('error', 'does not exists at team@${teamId}', `board@${boardId}`);
  }
}

// Deleta um time (e seus quadros)
function deleteTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);
  if (fs.existsSync(teamPath)) {
    fs.rmSync(teamPath, { recursive: true, force: true });
    humanOutput('success', 'deleted', `team@${teamId}`);
  } else {
    humanOutput('success', 'does not exists', `team@${teamId}`);
  }
}

module.exports = {
  createTeam,
  createBoard,
  deleteBoard,
  deleteTeam,
};
