const fs = require('fs');
const path = require("path");
const { baseDir, getTeamPath, getBoardPath } = require("../controllers/helper");

function readBoardJSON(boardPath) {
  try {
    return JSON.parse(fs.readFileSync(boardPath, "utf-8"));
  } catch {
    return null;
  }
}

function createBoard(teamId, boardId, boardData, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  if (!fs.existsSync(teamPath)) {
    fs.mkdirSync(teamPath, { recursive: true });
  }

  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(boardPath, JSON.stringify(boardData ?? {}, null, 2));

  return { status: 201, message: `created at team@${teamId}`, resource: `board@${boardId}` };
}

function getBoard(teamId, boardId, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);
  const data = readBoardJSON(boardPath);

  if (!data) return { status: 400, message: "not found or invalid JSON", resource: `board@${boardId}` };
  return { status: 202, data, resource: `board@${boardId}` };
}

function updateBoardContent(teamId, boardId, newContent, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);
  const data = readBoardJSON(boardPath);

  if (!data) return { status: 400, message: "not found or invalid JSON", resource: `board@${boardId}` };

  fs.writeFileSync(boardPath, JSON.stringify({ ...data, content: newContent }));
  return { status: 202, message: `updated at board@${boardId}`, resource: `board@${boardId}` };
}

async function updateBoardInfo(teamId, boardId, changes, customBaseDir) {
  const separator = boardId.indexOf('_');
  const uuid = boardId.substring(separator);
  const oldPath = getBoardPath(teamId, boardId, customBaseDir);

  let boardPath = oldPath;
  let newBoardId = boardId;

  if (changes.name) {
    newBoardId = `${changes.name}${uuid}`;
    const newPath = getBoardPath(teamId, newBoardId, customBaseDir);
    await fs.promises.rename(oldPath, newPath);
    boardPath = newPath;
  }

  if (changes.logo) {
    const data = JSON.parse(await fs.promises.readFile(boardPath, "utf-8"));
    await fs.promises.writeFile(boardPath, JSON.stringify({ ...data, logo: changes.logo }, null, 2));
  }

  return {
    status: 200,
    message: `updated at board@${newBoardId}`,
    resource: `board@${newBoardId}`,
    data: { id: newBoardId, name: changes.name, logo: changes.logo }
  };
}

function uploadBoardAsset(teamId, boardId, asset, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);
  const data = readBoardJSON(boardPath);

  if (!data) return { status: 400, message: `invalid asset or board not founded`, resource: `board@${boardId}` };

  fs.writeFileSync(boardPath, JSON.stringify({ ...data, assets: [...(data.assets ?? []), asset] }));
  return { status: 200, message: `asset uploaded at board@${boardId}`, resource: `board@${boardId}` };
}

function getBoardAsset(teamId, boardId, assetId, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);
  const data = readBoardJSON(boardPath);

  if (!data) return { status: 400, message: "not found", resource: `board@${boardId}` };

  const asset = data.assets.find(v => v.id == assetId);
  if (!asset) return { status: 400, message: "asset not found", resource: `board@${boardId}` };

  return { status: 200, data: asset.dataURL, resource: `board@${boardId}` };
}

function deleteBoard(teamId, boardId, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);

  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    return { status: 202, message: `deleted at team@${teamId}`, resource: `board@${boardId}` };
  }

  return { status: 400, message: `board does not exist`, resource: `team@${teamId}.board@${boardId}` };
}

function getTeamBoards(teamId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const teamPath = path.join(root, teamId);

  if (!fs.existsSync(teamPath)) {
    return { status: 200, message: 'boards retrieved', data: [], resource: `team@${teamId}` };
  }

  const boards = fs.readdirSync(teamPath)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const boardId = path.basename(file, '.json');
      const boardName = boardId.replace(/_([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i, '');
      const filePath = path.join(teamPath, file);

      return {
        boardId,
        boardName,
        createdAt: fs.statSync(filePath).birthtime,
        data: getBoard(teamId, boardId, customBaseDir).data
      };
    });

  return { status: 200, message: 'boards retrieved', data: boards, resource: `team@${teamId}` };
}

module.exports = {
  createBoard,
  getBoard,
  updateBoardInfo,
  updateBoardContent,
  getBoardAsset,
  uploadBoardAsset,
  deleteBoard,
  getTeamBoards,
};
