# Servidor do Chronos

## Overview & Architecture
- **Projeto:** API Node.js / Servidor do aplicativo Chronos.
- **Padrão Arquitetural:** 
  - **Routes (`src/routes/`):** Mapeiam endpoints, tratam validações, sanitização e segurança.
  - **Controllers (`src/controllers/`):** Lógica de negócios e acesso à infraestrutura/filesystem (ex: `src/controllers/teams.js`, `src/controllers/boards.js`).
- **Ambiente:** Rodado via Docker (Porta padrão: `3000`).

---

## Build & Run Commands
- **Iniciar ambiente:** `docker-compose up -d` ou `./start.sh`
- **Reconstruir/Parar containers:** `docker-compose down && docker-compose up -d`
- **Variáveis de Ambiente:** Espera arquivo `.env` configurado no root.

---

## Guidance for Refactoring & Code Style
1. **Responsabilidade Única (SoC):** Mantenha rotas apenas como camada de entrada/sanitização. A regra de negócio pesada e manipulação do sistema de arquivos fica estritamente nos Controllers.
2. **Escopo Curto:** Ao refatorar, trabalhe em **um controller/rota por vez**. Não altere múltiplos módulos sem solicitação explícita.
3. **Preserve Contratos:** Mantenha a compatibilidade com a documentação OpenAPI/Apidog. Não mude schemas de resposta ou parâmetros de rota arbitrariamente.
4. **Token Optimization:**
   - Leia apenas os arquivos diretamente relacionados à tarefa atual (`src/controllers/...` ou `src/routes/...`).
   - Não varra ou liste arquivos desnecessários no projeto.
