/**
 * @file Board Controller
 * @description Handles filesystem operations for board creation, deletion, and management.
 * @see {@link https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/} for details
 */

const fs = require('fs');
const path = require('path');

/**
 * Directory where all teams data are stored
 * @constant {string}
 */
const baseDir = path.join(__dirname, '..', 'teams');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

/**
 * Creates a new board JSON file inside a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {Object} [boardData={}] - Data object to be saved as JSON
 * @returns {Object} - Status and message of the operation
 * @example
 * createBoard('team123', 'board456', { name: 'jj' });
 */
function createBoard(teamId, boardId, boardData = {}) {
  const teamPath = path.join(baseDir, teamId);
  if (!fs.existsSync(teamPath)) {
    return { status: 'error', message: `does not exist`, resource: `team@${teamId}` };
  }
  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(boardPath, JSON.stringify(boardData, null, 2));
  return { status: 'success', message: `created at team@${teamId}`, resource: `board@${boardId}` };
}

/**
 * Return a board JSON file
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @returns {Object} - Status and data of the board or error message
 * @example
 * getBoard('team123', 'board456');
 */
function getBoard(teamId, boardId) {
  const boardPath = path.join(baseDir, teamId, `${boardId}.json`);
  try {
    const data = fs.readFileSync(boardPath, 'utf-8');
    return { status: 'success', data: JSON.parse(data), resource: `board@${boardId}` };
  } catch {
    return { status: 'error', message: `not found or invalid JSON`, resource: `board@${boardId}` };
  }
}

/**
 * Deletes a board JSON file from a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Board identifier
 * @returns {Object} - Status and message of the operation
 * @example
 * deleteBoard('team123', 'board456');
 */
function deleteBoard(teamId, boardId) {
  const boardPath = path.join(baseDir, teamId, `${boardId}.json`);
  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    return { status: 'success', message: `deleted at team@${teamId}`, resource: `board@${boardId}` };
  }
  return { status: 'error', message: `does not exists at team@${teamId}`, resource: `board@${boardId}` };
}

module.exports = {
  createBoard,
  getBoard,
  deleteBoard
};
