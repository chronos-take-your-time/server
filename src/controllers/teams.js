/**
 * @file Team Controller
 * @description Handles operations for team creation, deletion, and management.
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
 * Creates a new team directory
 * @param {string} teamId - Unique team identifier
 * @returns {Object} - Status and message of the operation
 * @example
 * createTeam('team123');
 */
function createTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);
  // just create the teamPath if it already doesnt exists
  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath, { recursive: true });
    return { status: 'success', message: `created`, resource: `team@${teamId}` };
  }
  return { status: 'error', message: `already exists`, resource: `team@${teamId}` };
}

/**
 * Recursively deletes a team directory with all its boards
 * @param {string} teamId - Team identifier
 * @returns {Object} - Status and message of the operation
 * @example
 * deleteTeam('team123');
 */
function deleteTeam(teamId) {
  const teamPath = path.join(baseDir, teamId);

  // just delete a team path if it exists
  if (!fs.existsSync(teamPath)) {
    return { status: 'error', message: `not found`, resource: `team@${teamId}` };
  }
  fs.rmSync(teamPath, { recursive: true, force: true });
  return { status: 'success', message: `deleted`, resource: `team@${teamId}` };
}

module.exports = {
  createTeam,
  deleteTeam,
};
