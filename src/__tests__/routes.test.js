const { fetchAuthenticated } = require("../utils/useAuthenticated");

describe('root', () => {
  it('deve ser respondida com sucesso', async () => {
    const res = await fetchAuthenticated('https://psychic-palm-tree-qx4r9grpj6pf54p-3000.app.github.dev/', {
      method: 'GET',
    });

    expect(res).toBe(200);
  });
});