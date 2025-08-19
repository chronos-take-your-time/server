/**
 * @file Team Controller
 * @description Handles operations for team creation, deletion, and management.
 * @see {@link https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/} for details
 */

const fs = require("fs");
const path = require("path");

/**
 * Default directory where all teams data are stored
 * @constant {string}
 */
const baseDir = path.join(__dirname, "..", "teams");

// Create teams if it does not exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Helpers
function getTeamPath(teamId, altDir = baseDir) {
  return path.join(altDir, teamId);
}

/**
 * Creates a new team directory
 * @param {string} teamId - Unique team identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * createTeam('team123');
 * createTeam('team123', '/tmp/test-dir');
 */
function createTeam(teamId, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath, { recursive: true });
    return {
      status: "success",
      message: "created",
      resource: `team@${teamId}`,
    };
  }

  return {
    status: "error",
    message: "already exists",
    resource: `team@${teamId}`,
  };
}

/**
 * Recursively deletes a team directory with all its boards
 * @param {string} teamId - Team identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * deleteTeam('team123');
 * deleteTeam('team123', '/tmp/test-dir');
 */
function deleteTeam(teamId, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  // just delete a team that exists
  if (!fs.existsSync(teamPath)) {
    return { status: 'error', message: `does not exists`, resource: `team@${teamId}` };
  }

  fs.rmSync(teamPath, { recursive: true, force: true });
  return { status: 'success', message: `deleted`, resource: `team@${teamId}` };
}

module.exports = {
  createTeam,
  deleteTeam,
};
