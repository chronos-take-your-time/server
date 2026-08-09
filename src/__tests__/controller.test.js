const fs = require('fs');
const os = require('os');
const path = require('path');

const { getRandomBoardId } = require('../utils/random');
const { createTeam, deleteTeam } = require('../controllers/teams');
const {
  createBoard, getBoard, updateBoardContent, updateBoardInfo,
  uploadBoardAsset, getBoardAsset, deleteBoard, getTeamBoards,
} = require('../controllers/boards');

let tmpDir;
const fakeTeamId = 'org@test';
const fakeBoardId = getRandomBoardId();
const fakeBoardData = { title: 'test board', assets: [] };

function setupBoard(boardId = fakeBoardId, data = fakeBoardData) {
  return createBoard(fakeTeamId, boardId, data, tmpDir);
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
    expect(result.message).toBe('created');
  });

  test('returns 400 when creating a duplicate team', () => {
    const result = createTeam(fakeTeamId, tmpDir); // already created in beforeEach
    expect(result.status).toBe(400);
  });

  test('deletes existing team successfully', () => {
    const result = deleteTeam(fakeTeamId, tmpDir);
    expect(result.status).toBe(202);
  });

  test('returns 400 when deleting non-existing team', () => {
    const result = deleteTeam('non_existing_team', tmpDir);
    expect(result.status).toBe(400);
  });
});

// --- BOARD TESTS ---
describe('Board Controller', () => {
  describe('createBoard', () => {
    test('creates board successfully', () => {
      const result = setupBoard();
      expect(result.status).toBe(201);
    });

    test('creates folder and board when team does not exist locally', () => {
      const result = createBoard('ghost_team', fakeBoardId, fakeBoardData, tmpDir);
      expect(result.status).toBe(201);
    });

    test('creates board with empty object when data is null', () => {
      const boardId = getRandomBoardId();
      createBoard(fakeTeamId, boardId, null, tmpDir);
      const result = getBoard(fakeTeamId, boardId, tmpDir);
      expect(result.status).toBe(202);
      expect(result.data).toEqual({});
    });
  });

  describe('getBoard', () => {
    test('returns board data successfully', () => {
      setupBoard();
      const result = getBoard(fakeTeamId, fakeBoardId, tmpDir);
      expect(result.status).toBe(202);
      expect(result.data).toEqual(fakeBoardData);
    });

    test('returns 400 when board does not exist', () => {
      const result = getBoard(fakeTeamId, 'nonexistent-board', tmpDir);
      expect(result.status).toBe(400);
    });
  });

  describe('updateBoardContent', () => {
    test('updates board content successfully', () => {
      setupBoard();
      const result = updateBoardContent(fakeTeamId, fakeBoardId, { nodes: [] }, tmpDir);
      expect(result.status).toBe(202);
    });

    test('returns the updated content when board is retrieved', () => {
      setupBoard();
      updateBoardContent(fakeTeamId, fakeBoardId, { nodes: [1, 2, 3] }, tmpDir);
      const result = getBoard(fakeTeamId, fakeBoardId, tmpDir);
      expect(result.data.content).toEqual({ nodes: [1, 2, 3] });
    });

    test('returns 400 when board does not exist', () => {
      const result = updateBoardContent(fakeTeamId, 'ghost-board', { nodes: [] }, tmpDir);
      expect(result.status).toBe(400);
    });
  });

  describe('updateBoardInfo', () => {
    test('renames board successfully', async () => {
      const uuid = getRandomBoardId();
      const boardId = `oldname_${uuid}`;
      createBoard(fakeTeamId, boardId, fakeBoardData, tmpDir);

      const result = await updateBoardInfo(fakeTeamId, boardId, { name: 'newname' }, tmpDir);
      expect(result.status).toBe(200);
      expect(result.data.id).toBe(`newname_${uuid}`);
    });

    test('updates board logo successfully', async () => {
      const uuid = getRandomBoardId();
      const boardId = `myboard_${uuid}`;
      createBoard(fakeTeamId, boardId, fakeBoardData, tmpDir);

      const result = await updateBoardInfo(fakeTeamId, boardId, { logo: 'data:image/png;base64,abc' }, tmpDir);
      expect(result.status).toBe(200);
      expect(result.data.logo).toBe('data:image/png;base64,abc');

      const board = getBoard(fakeTeamId, boardId, tmpDir);
      expect(board.data.logo).toBe('data:image/png;base64,abc');
    });
  });

  describe('uploadBoardAsset', () => {
    test('uploads asset to board successfully', () => {
      setupBoard();
      const asset = { id: 'asset-1', dataURL: 'data:image/png;base64,xyz' };
      const result = uploadBoardAsset(fakeTeamId, fakeBoardId, asset, tmpDir);
      expect(result.status).toBe(200);
    });

    test('uploaded asset is retrievable', () => {
      setupBoard();
      const asset = { id: 'asset-1', dataURL: 'data:image/png;base64,xyz' };
      uploadBoardAsset(fakeTeamId, fakeBoardId, asset, tmpDir);
      const result = getBoardAsset(fakeTeamId, fakeBoardId, 'asset-1', tmpDir);
      expect(result.status).toBe(200);
      expect(result.data).toBe('data:image/png;base64,xyz');
    });

    test('returns 400 when board does not exist', () => {
      const result = uploadBoardAsset(fakeTeamId, 'ghost-board', { id: 'a1', dataURL: 'x' }, tmpDir);
      expect(result.status).toBe(400);
    });
  });

  describe('getBoardAsset', () => {
    test('returns asset data successfully', () => {
      setupBoard();
      uploadBoardAsset(fakeTeamId, fakeBoardId, { id: 'img-1', dataURL: 'data:img' }, tmpDir);
      const result = getBoardAsset(fakeTeamId, fakeBoardId, 'img-1', tmpDir);
      expect(result.status).toBe(200);
      expect(result.data).toBe('data:img');
    });

    test('returns 400 when board does not exist', () => {
      const result = getBoardAsset(fakeTeamId, 'ghost-board', 'any-asset', tmpDir);
      expect(result.status).toBe(400);
    });

    test('returns 400 when asset does not exist', () => {
      setupBoard();
      const result = getBoardAsset(fakeTeamId, fakeBoardId, 'nonexistent-asset', tmpDir);
      expect(result.status).toBe(400);
    });
  });

  describe('deleteBoard', () => {
    test('deletes existing board successfully', () => {
      setupBoard();
      const result = deleteBoard(fakeTeamId, fakeBoardId, tmpDir);
      expect(result.status).toBe(202);
    });

    test('returns 400 when board does not exist', () => {
      const result = deleteBoard(fakeTeamId, 'ghost-board', tmpDir);
      expect(result.status).toBe(400);
    });

    test('board is gone after deletion', () => {
      setupBoard();
      deleteBoard(fakeTeamId, fakeBoardId, tmpDir);
      const result = getBoard(fakeTeamId, fakeBoardId, tmpDir);
      expect(result.status).toBe(400);
    });
  });

  describe('getTeamBoards', () => {
    test('returns all boards for a team', () => {
      const altBoardId = getRandomBoardId();
      setupBoard();
      setupBoard(altBoardId);
      const result = getTeamBoards(fakeTeamId, tmpDir);
      expect(result.status).toBe(200);
      const sortById = arr => arr.sort((a, b) => a.boardId.localeCompare(b.boardId));
      const expected = [{ boardId: fakeBoardId }, { boardId: altBoardId }];
      expect(sortById(result.data).map(({ boardId }) => ({ boardId }))).toEqual(sortById(expected));
    });

    test('returns board metadata with name and timestamp', () => {
      setupBoard();
      const result = getTeamBoards(fakeTeamId, tmpDir);
      const board = result.data[0];
      expect(board.boardName).toBe(board.boardId);
      expect(board.createdAt.getTime()).toBeGreaterThan(0);
      expect(board.data).toEqual(fakeBoardData);
    });

    test('returns empty array when team does not exist locally', () => {
      const result = getTeamBoards('nonexistent_team', tmpDir);
      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    test('returns empty array when team has no boards', () => {
      const result = getTeamBoards(fakeTeamId, tmpDir);
      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });
  });
});
