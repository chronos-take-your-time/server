# Servidor do Chronos
Este sistema pode ser iniciado facilmente em qualquer máquina Linux por meio do docker.

Confira as tasks do momento [neste quadro](https://github.com/orgs/chronos-take-your-time/projects/1/views/2).

# Instruções
Crie e preencha o arquivo `.env`, após isso rode o container com `docker-compose up -d` (a flag "-d" faz ele rodar em segundo plano sem ocupar o terminal), por padrão ele roda na porta 3000, se quiser trocar a porta é mais fácil mexer na bind do `docker-compose.yml`. Para instalar novas dependências ou criar o server do zero use `docker-compose down` antes de inicia-lo.

> O script `./start.sh` é uma mais forma conveniente de executar a aplicação recriando seus containers do zero.

# Endpoints
A documentação dos endpoints está disponível em [chronos.apidog.io](chronos.apidog.io), caso prefira, acesse a [Documentação alternativa nos padrões OpenAPI ou Postman](https://github.com/chronos-take-your-time/open-api/)

## Routes
As *routes* essencialmente mapeiam os *controllers*, sendo como uma camada de contato que pode ser usada como reforço de segurança sanitizando e controlando o acesso.

## Controllers
O *controller* é um arquivo que contém implementações para a infraestrutura por baixo das rotas, operando, por exemplo, no sistema de arquivos, seja criando diretórios ou arquivos.

- [`src/controllers/teams.js`](src/controllers/teams.js): Gerencia criação e remoção de times.
- [`src/controllers/boards.js`](src/controllers/boards.js): Gerencia criação e remoção de boards.
