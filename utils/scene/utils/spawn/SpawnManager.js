export default class SpawnManager {

  spawnRate = Number.MAX_VALUE;

  constructor({onSpawn, spawnRate, spawnRandom = 0}) {
    this._time = 0;
    this.spawnRate = spawnRate;
    this.spawnRandom = spawnRandom;
    this.onSpawn = onSpawn;
  }

  reset() {
    this._time = 0;
  }

  update(delta) {
    this._time += delta;
    const rate = this.spawnRate + Math.random() * this.spawnRandom;
    if (this._time >= rate) {
      this._time -= rate;
      if (typeof this.onSpawn === "function")
        this.onSpawn();
    }
  }
}
