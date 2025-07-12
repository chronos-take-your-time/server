# Servidor do Chronos
Este sistema pode ser iniciado facilmente em qualquer máquina Linux por meio do docker.

# Instruções
Crie e preencha o arquivo `.env`, após isso rode o container com `docker-compose up -d` (a flag "-d" faz ele rodar em segundo plano sem ocupar o terminal), por padrão ele roda na porta 3000, se quiser trocar a porta é mais fácil mexer na bind do `docker-compose.yml`. Para instalar novas dependências ou criar o server do zero use `docker-compose down` antes de inicia-lo.

> O script `./start.sh` é uma mais forma conveniente de executar a aplicação recriando seus containers do zero.

---
# Endpoints
Com o [Bruno](https://www.usebruno.com/) podemos acessar a coleção de endpoints para este server de forma fácil. 
[<img src="https://fetch.usebruno.com/button.svg" alt="Fetch no Cliente de API Bruno" style="width: 130px; height: 30px;" width="128" height="32">](https://fetch.usebruno.com?url=https://github.com/chronos-take-your-time/api-bruno.git "target=_blank rel=noopener noreferrer")

---

## Controllers
O *controller* é um arquivo que contém implementações para a infraestrutura por baixo das rotas, operando, por exemplo, no sistema de arquivos, seja criando diretórios ou arquivos.

- [`src/controllers/teams.js`](src/controllers/teams.js): Gerencia criação e remoção de times.
- [`src/controllers/boards.js`](src/controllers/boards.js): Gerencia criação e remoção de boards.

---

## Exemplos de uso

### Criar um time
```bash
curl -X POST http://localhost:3000/teams/create/123
```

### Adicionar usuário ao time
```bash
curl -X POST http://localhost:3000/teams/abc/add/456
```

### Criar um board
```bash
curl -X POST -H "Content-Type: application/json" -d '{ "Hello, i am a JSON (Joaquim Standart Object Notation)" }' http://localhost:3000/boards/123/789
```

### Remover um board
```bash
curl -X DELETE http://localhost:3000/boards/123/789
```
