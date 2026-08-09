require('dotenv').config();
const { createClerkClient } = require('@clerk/backend');
const { handleResponse } = require('./output');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const ROLE_PRIORITY = { 'org:member': 1, 'org:admin': 2 };

async function getById(id, type) {
  try {
    return type === 'user'
      ? await clerkClient.users.getUser(id)
      : await clerkClient.organizations.getOrganization({ organizationId: id });
  } catch {
    throw new Error(type === 'user' ? 'user not found' : 'organization not found');
  }
}

async function getMembership(teamId, userId) {
  try {
    const members = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: teamId,
      userId,
      limit: 1
    });
    return members.data[0] || null;
  } catch {
    return null;
  }
}

async function isUserTeam(userId, teamId, roleRequired = 'org:admin') {
  const me = await getMembership(teamId, userId);
  if (!me) return false;

  return (ROLE_PRIORITY[me.role] || 0) >= (ROLE_PRIORITY[roleRequired] || Infinity);
}

async function requireTeamRole(userId, teamId, res, role, message) {
  if (!await isUserTeam(userId, teamId, role)) {
    return handleResponse(res, { status: 403, message, resource: `organization@${teamId}` });
  }
}

function adminOnly(userId, teamId, res) {
  return requireTeamRole(userId, teamId, res, 'org:admin', 'forbidden: only team admins can perform this action');
}

function memberOnly(userId, teamId, res) {
  return requireTeamRole(userId, teamId, res, 'org:member', 'forbidden: only team members can perform this action');
}

module.exports = { clerkClient, getMembership, isUserTeam, getById, adminOnly, memberOnly };
