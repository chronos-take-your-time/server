# Servidor do Chronos
Este sistema pode ser iniciado facilmente em qualquer máquina Linux por meio do docker.

Confira as tasks do momento [neste quadro](https://github.com/orgs/chronos-take-your-time/projects/1/views/2).

# Instruções
Crie e preencha o arquivo `.env` com as credenciais corretas do Clerk.

## Nix
`nix develop` no shell.

## Docker
`docker-compose up -d` (a flag "-d" faz ele rodar em segundo plano sem ocupar o terminal).

> O script `./start.sh` é uma mais forma conveniente de executar a aplicação recriando seus containers do zero.

## Routes
As *routes* essencialmente mapeiam os *controllers*, sendo como uma camada de contato que pode ser usada como reforço de segurança sanitizando e controlando o acesso.

## Controllers
O *controller* é um arquivo que contém implementações para a infraestrutura por baixo das rotas, operando, por exemplo, no sistema de arquivos, seja criando diretórios ou arquivos.

- [`src/controllers/teams.js`](src/controllers/teams.js): Gerencia criação e remoção de times.
- [`src/controllers/boards.js`](src/controllers/boards.js): Gerencia criação e remoção de boards.
