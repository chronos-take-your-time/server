# due the nature of this tests i need to figure out an way to connect to clerk, most part of this code is placeholder

const app = express();
const request = require('supertest');
const express = require('express');
const teamRouter = require('../routes/teams');
const controller = require('../controllers/teams');
const handleResponse = require('../utils/handleResponse');
jest.mock('../controllers/teams');
jest.mock('../utils/handleResponse');
app.use(express.json());
app.use('/teams', teamRouter);

describe('Teams Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const success = true;
  const err = false;

  describe('POST /create/:id', () => {
    it('should create the structure for a team successfully', async () => {
      controller.createTeam.mockReturnValue(success);
      handleResponse.mockImplementation((res, result) => {
        res.json(result);
      });

      await request(app)
      .post('/create/team123');

      expect(controller.createTeam).toHaveBeenCalledWith('team123');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, success);
    });

    it('should handle controller errors', async () => {
      controller.createBoard.mockReturnValue(err);
      handleResponse.mockImplementation((res, result) => {
        res.status(400).json(result);
      });

      await request(app)
      .post('/create/team123');

      expect(controller.createTeam).toHaveBeenCalledWith('team123');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, err);
    });
  });

  describe('DELETE /:team_id', () => {
    it('should delete a team successfully', async () => {
      controller.deleteTeam.mockReturnValue(success);
      handleResponse.mockImplementation((res, result) => {
        res.json(result);
      });

      const response = await request(app)
      .delete('/team123');

      expect(controller.deleteTeam).toHaveBeenCalledWith('team123');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, success);
    });

    it('should handle deletion errors', async () => {
      controller.deleteTeam.mockReturnValue(err);
      handleResponse.mockImplementation((res, result) => {
        res.status(400).json(result);
      });

      await request(app)
      .delete('/team123');

      expect(controller.deleteTeam).toHaveBeenCalledWith('team123');
      expect(handleResponse).toHaveBeenCalledWith(expect.any(Object).success, err);
    });
  });
});