import PIXI from "./pixi-global";
import * as animate from "@pixi/animate";

console.log(PIXI)
PIXI.animate = animate;

global.PIXI = PIXI;

export default PIXI;
