{
  description = "Ambiente de desenvolvimento Nix para o Servidor do Chronos";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            
            python3
            gnumake
            gcc
          ];

          shellHook = ''
            echo "🚀 Bem-vindo ao devshell do Servidor do Chronos!"
            echo "📦 Node.js versão: $(node -v)"
            
            export NODE_ENV=development
            
            if [ -f .env ]; then
              # Exporta as variáveis ignorando comentários
              export $(grep -v '^#' .env | xargs)
              echo "✅ Variáveis de ambiente (.env) carregadas com sucesso."
            else
              echo "⚠️ Arquivo .env não encontrado."
              exit 1
            fi
            
            echo 'Instalando dependências...'
            npm install

            echo 'Iniciando servidor (Porta 3000)...'
            npm run dev
          '';
        };
      }
    );
}
