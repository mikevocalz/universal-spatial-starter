# Third-party notices

The starter's own code is MIT (see `LICENSE`). These files in the repository come from other projects and keep their own licenses.

| What | Where | License | License text |
| --- | --- | --- | --- |
| Archivo Black font | `packages/assets/fonts/ArchivoBlack-Regular.*` | SIL Open Font License 1.1 | `packages/assets/fonts/OFL-archivoblack.txt` |
| Space Grotesk font, also embedded in `game-hud.riv`, `game-controls.riv` and `pulse-catch.riv` | `packages/assets/fonts/SpaceGrotesk-Variable.*` | SIL Open Font License 1.1 | `packages/assets/fonts/OFL-spacegrotesk.txt` |
| EfficientDet-Lite0 detection model (TensorFlow) | `packages/camera/assets/efficientdet_lite0.bin` | Apache License 2.0 | `packages/camera/assets/LICENSE-APACHE-2.0.txt`; source and checksum in `packages/camera/assets/MODEL.md` |
| ReactVision Viro 3.0.2, mikevocalz fork build | `vendor/reactvision-react-viro-3.0.2-moyo.1.tgz` | MIT | `LICENSE` inside the tarball |
| Viro Web Renderer wasm and its dependencies | `apps/{mobile,web}/public/viro/` | Several, listed per component | `apps/web/public/viro/wasm/THIRD-PARTY-LICENSES.md` |
| NeonBlade-derived UI components and other ports | `packages/ui` | MIT and others, listed per component | `packages/ui/THIRD-PARTY-NOTICES.md` |

The Rive artboards in `packages/assets/rive` were authored for this repository with the Rive CLI and are covered by `LICENSE`. The Rive WebGL2 runtime wasm (MIT) is copied from `@rive-app/webgl2` into `apps/web/public/rive` at install and is not committed.

npm dependencies are not vendored; each package's license ships with it in `node_modules`.
