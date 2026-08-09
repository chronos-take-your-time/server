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
            nodejs_24
            
            python3
            gnumake
            gcc
          ];

          shellHook = ''
            
            export NODE_ENV=development
            
            if [ -f .env ]; then
              export $(grep -v '^#' .env | xargs)
            else
              echo "Error: .env not found"
              exit 1
            fi
            
            echo ""
            echo "Chronos Server development environment loaded"
            echo "  Node: $(node --version)"
            echo ""
            echo "Quick start:"
            echo "  npm install       # Install dependencies"
            echo "  npm run dev       # Start development build"
            echo "  npm run build     # Build for production"
          '';
        };
      }
    );
}
