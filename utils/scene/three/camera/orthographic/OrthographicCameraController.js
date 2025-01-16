import SeekableValue from "../../../utils/animation/SeekableValue";

export default class OrthographicCameraController {

  target;

  position;

  offset;

  zoom;


  basePosition;

  baseTargetPosition;

  camera;

  constructor({storage, eventBus, baseTargetPosition, basePosition, selectOffset, baseZoom, selectZoom}) {

    const {animations: {move: {duration, ease}}} = storage;
    this.eventBus = eventBus;

    this.position = {
      x: new SeekableValue({ease, duration}),
      y: new SeekableValue({ease, duration}),
      z: new SeekableValue({ease, duration}),
    }

    this.target = {
      x: new SeekableValue({ease, duration}),
      y: new SeekableValue({ease, duration}),
      z: new SeekableValue({ease, duration}),
    }

    this.offset = {
      x: new SeekableValue({ease, duration}),
      y: new SeekableValue({ease, duration}),
      z: new SeekableValue({ease, duration}),
    }

    this.zoom = new SeekableValue({
      current: baseZoom,
      target: baseZoom
    });

    this.baseZoom = baseZoom;
    this.selectZoom = selectZoom;

    this.selectOffset = selectOffset;
    this.basePosition = basePosition;
    this.baseTargetPosition = baseTargetPosition;

    this.onSelect = this.onSelect.bind(this);
    this.onUnselect = this.onUnselect.bind(this);

    this.moveTo(basePosition, true)

    eventBus.addEventListener("area-controller:select", this.onSelect);
    eventBus.addEventListener("area-controller:unselect", this.onUnselect);

  }

  onSelect({data: {area}}) {
    const {selectOffset} = this;
    const p = new THREE.Vector3;
    const r = new THREE.Quaternion;
    const s = new THREE.Vector3;

    area.mesh.matrixWorld.decompose(p, r, s);

    this.moveTargetTo(p);
    this.moveTo({
      x: p.x + selectOffset.x,
      y: p.y + selectOffset.y,
      z: p.z + selectOffset.z,
    })

    this.zoom.target = this.selectZoom;

    if (!this._restoreOffset)
      this._restoreOffset = {
        x: this.offset.x.target,
        y: this.offset.y.target,
        z: this.offset.z.target,
      }

    this.offset.x.target = 0;
    this.offset.y.target = 0;
    this.offset.z.target = 0;
  }

  onUnselect() {
    if (this.zoom.target === this.baseZoom) return;
    this.moveTo(this.basePosition);
    this.moveTargetTo(this.baseTargetPosition);
    this.zoom.target = this.baseZoom;

    if (this._restoreOffset) {
      this.offset.x.target = this._restoreOffset.x;
      this.offset.y.target = this._restoreOffset.y;
      this.offset.z.target = this._restoreOffset.z;

      this._restoreOffset = null;
    }
  }

  moveTo(vec, force = false) {
    const {position} = this;

    if (force)
      Object.entries(position).forEach(([key, value]) => value.current = vec[key]);

    Object.entries(position).forEach(([key, value]) => value.target = vec[key]);


  }

  moveTargetTo(vec, force = false) {
    const {target} = this;
    if (force)
      Object.entries(target).forEach(([key, value]) => value.current = vec[key]);

    Object.entries(target).forEach(([key, value]) => value.target = vec[key]);
  }

  update(delta) {
    if (!this.camera) return;

    const {target, position, camera, offset} = this;

    Object.values(target).forEach(value => value.update(delta));
    Object.values(position).forEach(value => value.update(delta));
    Object.values(offset).forEach(value => value.update(delta));

    this.zoom.update(delta);

    camera.position.set(
      position.x.current + offset.x.current,
      position.y.current + offset.y.current,
      position.z.current + offset.z.current
    );
    camera.zoom = this.zoom.current;
    camera.updateMatrix();
    camera.lookAt(
      target.x.current + offset.x.current,
      target.y.current + offset.y.current,
      target.z.current + offset.z.current
    );
    camera.updateProjectionMatrix();
  }
}
