// TS resolution anchor. Bundlers load CameraLab.native.tsx / CameraLab.web.tsx.
// Must stay .tsx to match the forks (a .ts anchor wins over .native.tsx in
// Metro and would ship the web build to devices).
export { CameraLab } from './CameraLab.web';
