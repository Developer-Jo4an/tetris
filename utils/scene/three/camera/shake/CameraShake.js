import * as SimplexNoise from "simplex-noise";
import seedrandom from "seedrandom";

/**
 * example: https://gitlab.peppers-studio.ru/peppers/230605_1/-/blob/dev/controllers/jumper/systems/CamerasSystem.js
 */
export class CameraShake {
  constructor() {


    this.time = 0;

    /**
     * Shake rotational limits, yaw, pitch and roll
     * @type {Vector3}
     */
    this.limitsRotation = new THREE.Vector3();

    /**
     * Shake offset limits
     * @type {Vector3}
     */
    this.limitsOffset = new THREE.Vector3();


    const r = seedrandom(1);

    this.noiseRotataion = SimplexNoise.createNoise2D(r);
    this.noiseOffset = SimplexNoise.createNoise2D(r);

  }

  /**
   *
   * @param {number} value between 0 and 1
   * @param {number} time
   * @param {Vector3} offset
   * @param {Vector3} rotation
   */
  read(value, time, offset, rotation) {

    const t = time;

    const nR = this.noiseRotataion;

    rotation.set(
      this.limitsRotation.x * value * (nR(t, 1) * 2 - 1),
      this.limitsRotation.y * value * (nR(t, 2) * 2 - 1),
      this.limitsRotation.z * value * (nR(t, 3) * 2 - 1),
    );

    const nO = this.noiseOffset;

    offset.set(
      this.limitsOffset.x * value * (nO(t, 1) * 2 - 1),
      this.limitsOffset.y * value * (nO(t, 2) * 2 - 1),
      this.limitsOffset.z * value * (nO(t, 3) * 2 - 1)
    );
  }


}
