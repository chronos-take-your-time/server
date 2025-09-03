const path = require("path");
const { humanOutput } = require("../utils/output");
const baseDir = path.join(__dirname, "..", "teams");

function getTeamPath(teamId, altDir = baseDir) {
  if (!teamId) {
    return humanOutput(400, 'getTeamPath called without teamId');
  }
  return path.join(altDir, teamId);
}

module.exports = {
  getTeamPath,
  baseDir,
};
