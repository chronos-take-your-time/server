const app = express();
const request = require('supertest');
const express = require('express');
const boardsRouter = require('../routes/boards');
const controller = require('../controllers/boards');
const handleResponse = require('../utils/handleResponse');
jest.mock('../controllers/boards');
jest.mock('../utils/handleResponse');
app.use(express.json());
app.use('/boards', boardsRouter);

describe('Boards Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const success = true;
  const err = false;

  describe('POST /:team_id/:id', () => {
    it('should create/update a board successfully', async () => {
      controller.createBoard.mockReturnValue(success);
      handleResponse.mockImplementation((res, result) => {
        res.json(result);
      });

      await request(app)
      .post('/boards/team123/board456')
      .send({ "just a string": "abatakum" });

      expect(controller.createBoard).toHaveBeenCalledWith('team123', 'board456', { "just a string": "abatakum" });
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, success);
    });

    it('should handle controller errors', async () => {
      controller.createBoard.mockReturnValue(err);
      handleResponse.mockImplementation((res, result) => {
        res.status(400).json(result);
      });

      await request(app)
      .post('/boards/team123/board456')
      .send({ name: 'Test Board' });

      expect(controller.createBoard).toHaveBeenCalledWith('team123', 'board456', { name: 'Test Board' });
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, err);
    });
  });

  describe('GET /:team_id/:id', () => {
    it('should get a board successfully', async () => {
      const mockBoard = { id: 'board456', name: 'Test Board', columns: [] };
      controller.getBoard.mockReturnValue(mockBoard);
      handleResponse.mockImplementation((res, result) => {
        res.json(result);
      });

      await request(app)
      .get('/boards/team123/board456');

      expect(controller.getBoard).toHaveBeenCalledWith('team123', 'board456');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, mockBoard);
    });

    it('should handle board not found', async () => {
      controller.getBoard.mockReturnValue(err);
      handleResponse.mockImplementation((res, result) => {
        res.status(404).json(result);
      });

      await request(app)
      .get('/boards/team123/nil');

      expect(controller.getBoard).toHaveBeenCalledWith('team123', 'nil');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, err);
    });
  });

  describe('DELETE /:team_id/:id', () => {
    it('should delete a board successfully', async () => {
      controller.deleteBoard.mockReturnValue(success);
      handleResponse.mockImplementation((res, result) => {
        res.json(result);
      });

      const response = await request(app)
      .delete('/boards/team123/board456');

      expect(controller.deleteBoard).toHaveBeenCalledWith('team123', 'board456');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, success);
    });

    it('should handle deletion errors', async () => {
      controller.deleteBoard.mockReturnValue(err);
      handleResponse.mockImplementation((res, result) => {
        res.status(400).json(result);
      });

      await request(app)
      .delete('/boards/team123/board456');

      expect(controller.deleteBoard).toHaveBeenCalledWith('team123', 'board456');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, err);
    });
  });
});