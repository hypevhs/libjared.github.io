{
  description = "perrycode.com";

  outputs = { self, nixpkgs }: let
    name = "perrycode";

    nixlessFilter = fname: ftype: let
      baseFileName = baseNameOf (toString fname);
    in ! (
      pkgs.lib.hasSuffix ".nix" baseFileName ||
      baseFileName == "flake.lock"
    );
    nixlessSrc = pkgs.lib.sources.cleanSourceWith {
      src = self;
      name = "${name}-source";
      filter = nixlessFilter;
    };

    pkgs = import nixpkgs {
      system = "x86_64-linux";
    };

    gems = pkgs.bundlerEnv {
      name = "${name}-gems";
      gemdir = ./.;
    };

    perrycode-watch = pkgs.writeShellScriptBin "perrycode-watch" ''
      exec "${gems}/bin/jekyll" serve \
        --host 0.0.0.0 \
        --verbose
    '';

    perrycode = pkgs.stdenvNoCC.mkDerivation {
      inherit name;
      src = nixlessSrc;
      nativeBuildInputs = [
        gems
        gems.wrappedRuby
      ];
      dontConfigure = true;
      # FIXME: jekyll inserts the current datetime into feed.xml, breaking reproducibility
      buildPhase = ''
        runHook preBuild

        jekyll build

        runHook postBuild
      '';
      installPhase = ''
        runHook preInstall

        mkdir -p "$out"
        cp -vpr _site "$out"

        runHook postInstall
      '';
    };

    perrycode-watch-app = {
      type = "app";
      program = "${self.packages.x86_64-linux.perrycode-watch}/bin/perrycode-watch";
    };
  in {
    packages.x86_64-linux.perrycode = perrycode;
    packages.x86_64-linux.perrycode-watch = perrycode-watch;
    defaultPackage.x86_64-linux = perrycode;

    apps.x86_64-linux.perrycode-watch = perrycode-watch-app;
    apps.x86_64-linux.default = perrycode-watch-app;
  };
}
