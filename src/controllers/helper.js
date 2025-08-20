const path = require("path");
const { humanOutput } = require("../utils/output");
const baseDir = path.join(__dirname, "..", "teams");

function getTeamPath(teamId, altDir = baseDir) {
  if (!teamId) {
    return humanOutput("error", "getTeamPath called without teamId");
  }
  return path.join(altDir, teamId);
}

module.exports = {
  getTeamPath,
  baseDir,
};
