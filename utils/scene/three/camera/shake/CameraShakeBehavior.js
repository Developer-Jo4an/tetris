import {CameraShake} from "./CameraShake";

export class CameraShakeBehavior {
  /**
   *
   * @param {number} maxPitch
   * @param {number} maxYaw
   * @param {number} maxRoll
   * @param {number} maxOffsetX
   * @param {number} maxOffsetY
   * @param {number} maxOffsetZ
   * @param {number} strength
   */
  constructor(
    {
      maxPitch = 0,
      maxYaw = 0,
      maxRoll = 0,
      maxOffsetX = 0,
      maxOffsetY = 0,
      maxOffsetZ = 0,
      strength = 0,
    }
  ) {

    this.time = 0;

    this.timeScale = 1;

    this.strength = strength;

    this.shake = new CameraShake();

    this.shake.limitsRotation.set(maxPitch, maxYaw, maxRoll);
    this.shake.limitsOffset.set(maxOffsetX, maxOffsetY, maxOffsetZ);
  }


  tick(timeDelta) {
    this.time += timeDelta * this.timeScale;

    const offset = new THREE.Vector3();
    const rotation = new THREE.Vector3();

    //read out shake values
    this.shake.read(this.strength, this.time, offset, rotation);

    return {offset, rotation}
  }
}
