const request = require('supertest');
const express = require('express');

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../utils/clerk', () => ({
  clerkClient: {
    organizations: {
      getOrganizationMembershipList: jest.fn(),
      createOrganizationMembership: jest.fn(),
      deleteOrganizationMembership: jest.fn(),
      deleteOrganization: jest.fn(),
    },
  },
  getMembership: jest.fn(),
  adminOnly: jest.fn(),
  memberOnly: jest.fn(),
}));

jest.mock('../controllers/boards');
jest.mock('../controllers/teams');

const { verifyToken } = require('@clerk/backend');
const { clerkClient, getMembership, adminOnly, memberOnly } = require('../utils/clerk');
const boardsCtrl = require('../controllers/boards');
const teamsCtrl = require('../controllers/teams');

const app = (() => {
  const instance = express();
  instance.use(express.json());
  instance.use('/', require('../routes/root'));
  instance.use('/teams', require('../routes/teams'));
  instance.use('/boards', require('../routes/boards'));
  return instance;
})();

beforeEach(() => {
  jest.clearAllMocks();
  verifyToken.mockResolvedValue({ sub: 'user_test' });
  adminOnly.mockResolvedValue(undefined);
  memberOnly.mockResolvedValue(undefined);
});

const TOKEN = 'valid-token';

// --- AUTH TESTS ---
describe('Auth enforcement', () => {
  test('returns 500 when token is missing', async () => {
    const res = await request(app).get('/boards/team1/board1');
    expect(res.status).toBe(500);
  });

  test('returns 500 when token is invalid', async () => {
    verifyToken.mockRejectedValueOnce(Object.assign(new Error('bad token'), { reason: 'token-invalid' }));
    const res = await request(app).get('/boards/team1/board1').query({ token: 'bad' });
    expect(res.status).toBe(500);
  });

  test('root route is accessible with valid token', async () => {
    const res = await request(app).get('/').query({ token: TOKEN });
    expect(res.status).toBe(200);
  });
});

// --- BOARDS ROUTES ---
describe('Boards routes', () => {
  test('POST /:team_id/:id creates a board', async () => {
    boardsCtrl.createBoard.mockReturnValue({ status: 201, message: 'created', resource: 'board@board1' });

    const res = await request(app)
      .post('/boards/team1/board1')
      .query({ token: TOKEN })
      .send({ title: 'My Board' });

    expect(boardsCtrl.createBoard).toHaveBeenCalledWith('team1', 'board1', { title: 'My Board' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('created');
  });

  test('GET /:team_id/:id retrieves a board', async () => {
    boardsCtrl.getBoard.mockReturnValue({ status: 202, data: { x: 1 }, resource: 'board@board1' });

    const res = await request(app)
      .get('/boards/team1/board1')
      .query({ token: TOKEN });

    expect(boardsCtrl.getBoard).toHaveBeenCalledWith('team1', 'board1');
    expect(res.status).toBe(202);
    expect(res.body.data).toEqual({ x: 1 });
  });

  test('PUT /:team_id/:id updates board info', async () => {
    boardsCtrl.updateBoardInfo.mockResolvedValue({ status: 200, message: 'updated', resource: 'board@board1' });

    const res = await request(app)
      .put('/boards/team1/board1')
      .query({ token: TOKEN })
      .send({ boardName: 'Renamed', logo: 'data:img' });

    expect(boardsCtrl.updateBoardInfo).toHaveBeenCalledWith('team1', 'board1', { name: 'Renamed', logo: 'data:img' });
    expect(res.status).toBe(200);
  });

  test('DELETE /:team_id/:id deletes a board', async () => {
    boardsCtrl.deleteBoard.mockReturnValue({ status: 202, message: 'deleted', resource: 'board@board1' });

    const res = await request(app)
      .delete('/boards/team1/board1')
      .query({ token: TOKEN });

    expect(boardsCtrl.deleteBoard).toHaveBeenCalledWith('team1', 'board1');
    expect(res.status).toBe(202);
  });

  test('GET /:team_id retrieves all boards for a team', async () => {
    boardsCtrl.getTeamBoards.mockReturnValue({ status: 200, data: [], resource: 'team@team1' });

    const res = await request(app)
      .get('/boards/team1')
      .query({ token: TOKEN });

    expect(boardsCtrl.getTeamBoards).toHaveBeenCalledWith('team1');
    expect(res.status).toBe(200);
  });

  test('PUT /uploads/:team_id/:id/:asset_id uploads an asset', async () => {
    boardsCtrl.uploadBoardAsset.mockReturnValue({ status: 200, message: 'uploaded', resource: 'board@board1' });

    const res = await request(app)
      .put('/boards/uploads/team1/board1/asset-abc')
      .query({ token: TOKEN })
      .send({ file: 'data:image/png;base64,abc' });

    expect(boardsCtrl.uploadBoardAsset).toHaveBeenCalledWith(
      'team1', 'board1', { id: 'asset-abc', dataURL: 'data:image/png;base64,abc' }
    );
    expect(res.status).toBe(200);
  });

  test('GET /uploads/:team_id/:id/:asset_id retrieves an asset', async () => {
    boardsCtrl.getBoardAsset.mockReturnValue({ status: 200, data: 'data:img', resource: 'board@board1' });

    const res = await request(app)
      .get('/boards/uploads/team1/board1/asset-abc')
      .query({ token: TOKEN });

    expect(boardsCtrl.getBoardAsset).toHaveBeenCalledWith('team1', 'board1', 'asset-abc');
    expect(res.status).toBe(200);
  });
});

// --- TEAMS ROUTES ---
describe('Teams routes', () => {
  test('POST /create/:id creates a team', async () => {
    teamsCtrl.createTeam.mockReturnValue({ status: 201, message: 'created', resource: 'team@newteam' });

    const res = await request(app)
      .post('/teams/create/newteam')
      .query({ token: TOKEN });

    expect(teamsCtrl.createTeam).toHaveBeenCalledWith('newteam');
    expect(res.status).toBe(201);
  });

  test('GET /:teamId returns team members', async () => {
    clerkClient.organizations.getOrganizationMembershipList.mockResolvedValue({
      data: [{ publicUserData: { userId: 'user_1' } }],
    });

    const res = await request(app)
      .get('/teams/team-abc')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.getOrganizationMembershipList).toHaveBeenCalledWith({
      organizationId: 'team-abc',
    });
    expect(res.status).toBe(200);
  });

  test('POST /:teamId/:userId adds a member when not already present', async () => {
    getMembership.mockResolvedValue(null);
    clerkClient.organizations.createOrganizationMembership.mockResolvedValue({});

    const res = await request(app)
      .post('/teams/team-abc/user-123')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'team-abc',
      userId: 'user-123',
      role: 'org:member',
    });
    expect(res.status).toBe(202);
  });

  test('POST /:teamId/:userId returns 202 when user is already a member', async () => {
    getMembership.mockResolvedValue({ role: 'org:member' });

    const res = await request(app)
      .post('/teams/team-abc/user-123')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.createOrganizationMembership).not.toHaveBeenCalled();
    expect(res.status).toBe(202);
    expect(res.body.message).toMatch(/already in team/);
  });

  test('DELETE /:teamId/:userId removes a non-admin member', async () => {
    getMembership.mockResolvedValue({ role: 'org:member' });
    clerkClient.organizations.deleteOrganizationMembership.mockResolvedValue({});

    const res = await request(app)
      .delete('/teams/team-abc/user-123')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.deleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'team-abc',
      userId: 'user-123',
    });
    expect(res.status).toBe(202);
  });

  test('DELETE /:teamId/:userId returns 400 when removing admin', async () => {
    getMembership.mockResolvedValue({ role: 'org:admin' });

    const res = await request(app)
      .delete('/teams/team-abc/user-123')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.deleteOrganizationMembership).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  test('DELETE /:teamId/:userId returns 400 when user is not a member', async () => {
    getMembership.mockResolvedValue(null);

    const res = await request(app)
      .delete('/teams/team-abc/user-123')
      .query({ token: TOKEN });

    expect(res.status).toBe(400);
  });

  test('DELETE /:teamId deletes team from clerk and filesystem', async () => {
    clerkClient.organizations.deleteOrganization.mockResolvedValue({});
    teamsCtrl.deleteTeam.mockReturnValue({ status: 202, message: 'deleted', resource: 'team@team-abc' });

    const res = await request(app)
      .delete('/teams/team-abc')
      .query({ token: TOKEN });

    expect(clerkClient.organizations.deleteOrganization).toHaveBeenCalledWith('team-abc');
    expect(teamsCtrl.deleteTeam).toHaveBeenCalledWith('team-abc');
    expect(res.status).toBe(202);
  });
});
