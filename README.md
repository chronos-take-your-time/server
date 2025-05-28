# Servidor do Chronos
Este sistema pode ser iniciado facilmente em qualquer máquina Linux por meio do docker.

# Instruções
Crie e preencha o arquivo `.env`, após isso rode o container com `docker-compose up -d` (a flag "-d" faz ele rodar em segundo plano sem ocupar o terminal), por padrão ele roda na porta 3000, se quiser trocar a porta é mais fácil mexer na bind do `docker-compose.yml`. Para instalar novas dependências ou criar o server do zero use `docker-compose down` antes de inicia-lo.
