const fs = require('fs');
const os = require('os');
const path = require('path');

const { getRandomBoardId } = require('../utils/random');
const { createTeam, deleteTeam } = require('../controllers/teams');
const { createBoard, getBoard, deleteBoard, getTeamBoards } = require('../controllers/boards');

let tmpDir;
const fakeTeamId = 'org@test';
const fakeBoardId = getRandomBoardId();
const fakeBoardData = { ishow: 'speed' };

// Helpers
function setupBoard(boardId = fakeBoardId) {
  return createBoard(fakeTeamId, boardId, fakeBoardData, tmpDir);
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
    expect(result.status).toBe(201);
  });

  test('deletes existing team successfully', () => {
    const result = deleteTeam(fakeTeamId, tmpDir);
    expect(result.status).toBe(202);
  });

  test('doesnt delete non-existing team', () => {
    const result = deleteTeam('non_existing_team', tmpDir);
    expect(result.status).toBe(400);
  });
});

// --- BOARD TESTS ---
describe('Board Controller', () => {
  test('creates board successfully', () => {
    const result = setupBoard();
    expect(result.status).toBe(201);
  });

  test('returns board successfully', () => {
    setupBoard();
    const result = getBoard(fakeTeamId, fakeBoardId, tmpDir);
    expect(result.status).toBe(202);
    expect(result.data).toEqual(fakeBoardData);
  });

  test('deletes board successfully', () => {
    setupBoard();
    const result = deleteBoard(fakeTeamId, fakeBoardId, tmpDir);
    expect(result.status).toBe(202);
  });

  test('get team boards', () => {
    const altBoardId = getRandomBoardId(); // test with another board just in case
    setupBoard();
    setupBoard(altBoardId);
    const result = getTeamBoards(fakeTeamId, tmpDir);
    const expected = [{ boardId: fakeBoardId }, { boardId: altBoardId }];

    // sort to prevent false negatives due to order
    const sortById = arr => arr.sort((a, b) => a.boardId.localeCompare(b.boardId));
    expect(sortById(result.data)).toEqual(sortById(expected));
  });
});
