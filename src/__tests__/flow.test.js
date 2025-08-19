const fs = require('fs');
const os = require('os');
const path = require('path');

const { getRandomBoardId } = require('../utils/random');
const { createTeam, deleteTeam, getTeamBoards } = require('../controllers/teams');
const { createBoard, getBoard, deleteBoard } = require('../controllers/boards');

let tmpDir;
const fakeTeamId = 'org@test';
const fakeBoardId = getRandomBoardId();
const fakeBoardData = { ishow: 'speed' };

// Helpers
function setupBoard(boardId = fakeBoardId) {
  createBoard(fakeTeamId, boardId, fakeBoardData, tmpDir);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chronos-'));
  createTeam(fakeTeamId, tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// --- TEAM TESTS ---
describe('Team Controller', () => {
  test('creates team successfully', () => {
    const result = createTeam('newTeam', tmpDir);
    expect(result.status).toBe('success');
  });

  test('deletes existing team successfully', () => {
    const result = deleteTeam(fakeTeamId, tmpDir);
    expect(result.status).toBe('success');
  });

  test('doesnt delete non-existing team', () => {
    const result = deleteTeam('non_existing_team', tmpDir);
    expect(result.status).toBe('error');
  });
});

// --- BOARD TESTS ---
describe('Board Controller', () => {
  test('creates board successfully', () => {
    const result = setupBoard();
    expect(result.status).toBe('success');
  });

  test('returns board successfully', () => {
    setupBoard();
    const result = getBoard(fakeTeamId, fakeBoardId, tmpDir);
    expect(result.status).toBe('success');
    expect(result.data).toEqual(fakeBoardData);
  });

  test('deletes board successfully', () => {
    setupBoard();
    const result = deleteBoard(fakeTeamId, fakeBoardId, tmpDir);
    expect(result.status).toBe('success');
  });

  test('get team boards', () => {
    const altBoardId = getRandomBoardId(); // test with another board just in case
    setupBoard();
    setupBoard(altBoardId);
    const result = getTeamBoards(fakeTeamId, tmpDir);
    expect(result).toStrictEqual([{boardId: fakeBoardId}, {boardId: altBoardId}])
  });
});
