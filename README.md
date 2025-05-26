# server
este server pode ser iniciado facilmente em qualquer máquina linux por meio do docker.

# instruções
com um simples `docker-compose up -d` (a flag "-d" faz ele rodar em segundo plano sem ocupar o terminal) você pode subir o servidor, por padrão ele roda na porta 3000, se quiser trocar a porta é mais fácil mexer na bind do `docker-compose.yml`.

para instalar novas dependências ou criar o server do zero use `docker-compose down` antes de inicia-lo.
