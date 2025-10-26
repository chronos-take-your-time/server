const path = require("path");
const { humanOutput } = require("../utils/output");
const baseDir = path.join(__dirname, "..", "teams");

function getTeamPath(teamId, altDir = baseDir) {
  if (!teamId) {
    return humanOutput(400, "getTeamPath called without teamId");
  }
  return path.join(altDir, teamId);
}

function getBoardPath(teamId, boardId, altDir = baseDir) {
  if (!teamId) return humanOutput(400, "getBoardPath called without teamId");
  if (!boardId) return humanOutput(400, "getBoardPath called without boardId");
  return path.join(altDir, teamId, `${boardId}.json`);
}

module.exports = {
  getTeamPath,
  getBoardPath,
  baseDir,
};
