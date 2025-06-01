/**
 * @file Team and Board Controller
 * @description Handles filesystem operations for team/board creation, deletion, and management.
 * @see {@link https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/} for details
 */

const fs = require('fs');
const path = require('path');
const { humanOutput } = require('../utils/output');

/**
 * Directory where all teams data are stored
 * @constant {string}
 */
const baseDir = path.join(__dirname, '..', 'teams');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

/**
 * Creates a new team directory
 * @param {string} teamId - Unique team identifier
 * @returns {void}
 * @example
 * createTeam('team123');
 */
function createTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);
  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath, { recursive: true });
    humanOutput('success', 'created', `team@${teamId}`);
    return;
  }
  humanOutput('error', 'already exists', `team@${teamId}`);
}

/**
 * Creates a new board JSON file inside a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {Object} [boardData={}] - Data object to be saved as JSON
 * @returns {void}
 * @example
 * createBoard('team123', 'board456', { name: 'Sprint Planning', tasks: [] });
 */
function createBoard(teamId, boardId, boardData = {}) {
  const teamPath = path.join(baseDir, teamId);
  if (!fs.existsSync(teamPath)) {
    humanOutput('error', `does not exists at team@${teamId}`, `team@${teamId}`);
    return;
  }
  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(boardPath, JSON.stringify(boardData, null, 2));
  humanOutput('success', `created at team@${teamId}`, `board@${boardId}`);
}

/**
 * Deletes a board JSON file from a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Board identifier
 * @returns {void}
 * @example
 * deleteBoard('team123', 'board456');
 */
function deleteBoard(teamId, boardId) {
  const boardPath = path.join(baseDir, teamId, `${boardId}.json`);
  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    humanOutput('success', `deleted at team@${teamId}`, `board@${boardId}`);
    return;
  }
  humanOutput('error', `does not exists at team@${teamId}`, `board@${boardId}`);
}

/**
 * Recursively deletes a team directory with all its boards
 * @param {string} teamId - Team identifier
 * @returns {void}
 * @example
 * deleteTeam('team123');
 */
function deleteTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);
  if (fs.existsSync(teamPath)) {
    fs.rmSync(teamPath, { recursive: true, force: true });
    humanOutput('success', 'deleted', `team@${teamId}`);
    return;
  }
  humanOutput('error', 'does not exists', `team@${teamId}`);
}

module.exports = {
  createTeam,
  createBoard,
  deleteBoard,
  deleteTeam
};
