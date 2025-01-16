const {THREE} = global;
export default class SequenceMesh extends THREE.Mesh {

  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet.
  numberOfTiles;

  tilesHorizontal;

  tilesVertical;

  tileDispDuration = 40;

  clips = {};

  startClip = "all";

  startTile = 0;

  isAnimatedSpriteSheet = true;

  paused = false;

  constructor(props = {}) {
    const {texture, material, geometry} = createOrGet(props);
    super(geometry, material);
    this.applySettings(props);
    this.settings = props;

    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    // Растянуть часть(кадр) тестуры-секвенции на весь материал
    if (!props.ignoreRepeat)
      texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    if (material.alphaMap) {
      material.alphaMap.wrapS = texture.wrapT = THREE.RepeatWrapping;
      material.alphaMap.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);
    }

    this.currentDisplayTime = 0;
    this.clips.all = [0, this.numberOfTiles - 1];
    this.start();
    this.updateSpriteAnimation(0);
  }


  start() {
    this.play(this.startClip, this.startTile);
  }

  play(clip_id, _startTitle, _onLoopComplete, abortCurrent) {
    if (this.current_clip_id === clip_id && !abortCurrent) return;
    const {clips, material} = this;

    this.onLoopComplete = _onLoopComplete;

    const clip = clips[clip_id];
    if (!clip) return;

    this.current_clip = clip;
    this.current_clip_id = clip_id;
    this.current_clip_start = this.current_clip[0];
    this.current_clip_end = this.current_clip[1];
    const texture = this.current_clip[2];

    if (texture) {
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      if (!this.settings.ignoreRepeat)
        texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

      if (material.alphaMap) {
        material.alphaMap.needsUpdate = true;
        material.alphaMap.wrapS = material.alphaMap.wrapT = THREE.RepeatWrapping;
        material.alphaMap.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);
      }
    }
    this.currentTile = this.current_clip_start + (_startTitle || 0);
    this.currentDisplayTime = 0;
    this.updateTexture();
  }

  updateSpriteAnimation(milliSec) {
    const {material, settings: {tileDispDuration}} = this;
    if (this.paused || !material.map) return;

    this.currentDisplayTime += milliSec;

    while (this.currentDisplayTime > tileDispDuration) {
      this.currentDisplayTime -= tileDispDuration;
      this.currentTile++;

      if (this.currentTile >= this.current_clip_end) {// end of loop
        this.currentTile = this.current_clip_start;
        if (this.onLoopComplete) {
          this.onLoopComplete(this);
          this.onLoopComplete = undefined;
        }
      }

      this.updateTexture();
    }
  }

  updateTexture() {
    const {material} = this;
    const texture = material.map;
    const currentColumn = this.currentTile % this.tilesHorizontal;
    texture.offset.x = currentColumn / this.tilesHorizontal;
    const currentRow = this.tilesVertical - Math.floor(this.currentTile / this.tilesHorizontal) - 1;
    texture.offset.y = currentRow / this.tilesVertical;

    if (material.alphaMap) {
      material.alphaMap.offset.x = currentColumn / this.tilesHorizontal;
      material.alphaMap.offset.y = currentRow / this.tilesVertical;
    }
  }

  applySettings({
                  numTiles,
                  tilesHoriz,
                  tilesVert,
                  // how long should each image be displayed?
                  tileDispDuration = 40,
                  clips = {},
                  startClip = "all",
                  startTile = 0,
                  ...props
                }) {

    this.numberOfTiles = numTiles;
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.tileDispDuration = tileDispDuration ?? this.tileDispDuration;
    this.clips = clips ?? this.clips;
    this.startClip = startClip ?? this.startClip;
    this.startTile = startTile ?? this.startTile;
  }


  clone(recursive) {
    return new this.constructor(this.settings).copy(this, recursive);
  }

}

function createOrGet({
                       geometry = new THREE.BufferGeometry(),
                       material = new THREE.MeshBasicMaterial,
                       texture = null
                     } = {},
                     ...props
) {
  texture = texture ?? props.texture ?? material.map ?? new THREE.Texture();

  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;
  texture.needsUpdate = true;

  if (material.alphaMap) {
    material.alphaMap.flipY = false;
    material.alphaMap.needsUpdate = true;
  }

  material.map = texture;
  return {texture, material, geometry};
}

