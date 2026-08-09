const express = require('express');
const router = express.Router();
const controller = require('../controllers/boards');
const { routeHelper } = require('../utils/routeHelper');
const { handleResponse } = require('../utils/output');

router.post('/:team_id/:id', async (req, res) => {
  const { team_id: teamId, id: boardId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.createBoard(teamId, boardId, req.body)));
});

router.get('/:team_id/:id', async (req, res) => {
  const { team_id: teamId, id: boardId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.getBoard(teamId, boardId)));
});

router.put('/:team_id/:id', async (req, res) => {
  const { team_id: teamId, id: boardId } = req.params;
  const changes = { name: req.body.boardName, logo: req.body.logo };
  routeHelper(req, res, async () => handleResponse(res, await controller.updateBoardInfo(teamId, boardId, changes)));
});

router.put('/uploads/:team_id/:id/:asset_id', async (req, res) => {
  const { team_id: teamId, id: boardId, asset_id: assetId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.uploadBoardAsset(teamId, boardId, { id: assetId, dataURL: req.body.file })));
});

router.get('/uploads/:team_id/:id/:asset_id', async (req, res) => {
  const { team_id: teamId, id: boardId, asset_id: assetId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.getBoardAsset(teamId, boardId, assetId)));
});

router.delete('/:team_id/:id', async (req, res) => {
  const { team_id: teamId, id: boardId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.deleteBoard(teamId, boardId)), true);
});

router.get('/:team_id', async (req, res) => {
  const { team_id: teamId } = req.params;
  routeHelper(req, res, () => handleResponse(res, controller.getTeamBoards(teamId), true));
});

module.exports = router;
