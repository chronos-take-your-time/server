const fs = require("fs");
const { getTeamPath } = require("../controllers/helper");

function createTeam(teamId, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath, { recursive: true });
    return { status: 201, message: "created", resource: `team@${teamId}` };
  }

  return { status: 400, message: "already exists", resource: `team@${teamId}` };
}

function deleteTeam(teamId, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  if (!fs.existsSync(teamPath)) {
    return { status: 400, message: `does not exists`, resource: `team@${teamId}` };
  }

  fs.rmSync(teamPath, { recursive: true, force: true });
  return { status: 202, message: `deleted`, resource: `team@${teamId}` };
}

module.exports = { createTeam, deleteTeam };
