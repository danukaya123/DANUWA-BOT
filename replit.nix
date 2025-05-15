{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.pkg-config
    pkgs.cairo
    pkgs.pango
    pkgs.libuuid
    pkgs.libpng
    pkgs.glib
  ];
}
