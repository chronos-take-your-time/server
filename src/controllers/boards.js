/**
 * @file Board Controller
 * @description Handles filesystem operations for board creation, deletion, and management.
 * @see {@link https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/} for details
 */

const fs = require("fs");
const path = require("path");
const { humanOutput } = require("../utils/output");

/**
 * Default directory where all teams data are stored
 * @constant {string}
 */
const baseDir = path.join(__dirname, "..", "teams");

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

/**
 * Creates a new board JSON file inside a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {Object} [boardData={}] - Data object to be saved as JSON
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * createBoard('team123', 'board456', { name: 'jj' });
 * createBoard('team123', 'board456', { name: 'jj' }, '/tmp/test-dir');
 */
function createBoard(teamId, boardId, boardData, customBaseDir) {
  const root = customBaseDir || baseDir;
  const teamPath = path.join(root, teamId);

  if (!fs.existsSync(teamPath)) {
    return {
      status: "error",
      message: "team path does not exist (consider create it)",
      resource: `team@${teamId}`,
    };
  }

  humanOutput("info", "creating board...", `team@${teamId} board@${boardId}`);

  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(
    boardPath,
    JSON.stringify(boardData === undefined ? {} : boardData, null, 2)
  );

  return {
    status: "success",
    message: `created at team@${teamId}`,
    resource: `board@${boardId}`,
  };
}

/**
 * Return a board JSON file
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and data of the board or error message
 * @example
 * getBoard('team123', 'board456');
 * getBoard('team123', 'board456', '/tmp/test-dir');
 */
function getBoard(teamId, boardId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const boardPath = path.join(root, teamId, `${boardId}.json`);

  try {
    const data = fs.readFileSync(boardPath, "utf-8");
    return {
      status: "success",
      data: JSON.parse(data),
      resource: `board@${boardId}`,
    };
  } catch {
    return {
      status: "error",
      message: "not found or invalid JSON",
      resource: `board@${boardId}`,
    };
  }
}

/**
 * Deletes a board JSON file from a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Board identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * deleteBoard('team123', 'board456');
 * deleteBoard('team123', 'board456', '/tmp/test-dir');
 */
function deleteBoard(teamId, boardId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const boardPath = path.join(root, teamId, `${boardId}.json`);

  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    return {
      status: "success",
      message: `deleted at team@${teamId}`,
      resource: `board@${boardId}`,
    };
  }

  return {
    status: "error",
    message: `does not exists at team@${teamId}`,
    resource: `board@${boardId}`,
  };
}

/**
 * Lists all boards in a team directory
 * @param {string} teamId - Team identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Array<Object>} - List of boards with their IDs
 */
function getTeamBoards(teamId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const teamPath = path.join(root, teamId);

  if (!fs.existsSync(teamPath)) {
    return { status: 'error', message: `does not exists`, resource: `team@${teamId}` };
  }

  const files = fs.readdirSync(teamPath);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => ({ boardId: path.basename(file, '.json') }));
}

module.exports = {
  createBoard,
  getBoard,
  deleteBoard,
  getTeamBoards
};
