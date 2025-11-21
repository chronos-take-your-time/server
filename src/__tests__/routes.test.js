const { fetchWithToken } = require('../utils/useAuthenticated');

const BASE_URL = process.env.TEST_BASE_URL || import.meta.env.VITE_API_URL;

describe('verificar se a autenticação esta funcionando', () => {
  it('deve ser respondida com sucesso', async () => {
    const response = await fetchWithToken(`${BASE_URL}/`, {
      method: 'GET',
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});

describe('criar time', () => {
  it('deve ser respondida com sucesso', async () => {
    const response = await fetchWithToken(`${BASE_URL}/team/create`, {
      method: 'GET',
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});
