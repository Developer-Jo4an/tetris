import AssetsManager from "../../loader/plugins/AssetsManager";

export default class CameraBackground extends THREE.Object3D {

  name = "CameraBackground";

  needsUpdate = true;

  renderOrder = -999;

  constructor({map, offsetY = 0, scalar = 1}, eventBus) {
    super();
    if (typeof map === "string")
      map = AssetsManager.getAssetFromLib(map, "texture");

    this.offsetY = offsetY;
    this.scalar = scalar;
    map.encoding = 3001;

    eventBus.addEventListener("camera-updated", this.onCameraUpdated.bind(this));
    this.initPlane({map, offsetY});
  }

  onCameraUpdated() {
    this.needsUpdate = true;
    this.update();
  }

  initPlane({map, offsetY = 0}) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map,
      depthWrite: false,
      depthTest: false
    });

    map.generateMipmaps = false;

    const plane = this.plane = new THREE.Mesh(geometry, material);

    const container = this.container = new THREE.Object3D;

    plane.renderOrder = -999;
    plane.position.set(0, -50, 0);
    container.add(plane);
    this.add(container);
  }

  update(data = this._prevData) {
    if (!data.camera) return console.log("Camera is not set");
    if (!this.needsUpdate) return;

    this._prevData = data;

    this.updatePosition(data);

    this.needsUpdate = false;
  }

  updatePosition({camera}) {
    const {plane: {material: {map}}, plane, container} = this;
    const vector = new THREE.Vector3();
    const zNearPlane = -1;

    const w = map?.image?.width || 1;
    const h = map?.image?.height || 1;

    const aspect = w / h;
    camera.add(this);

    camera.near = camera.near || 0.01;
    camera.updateMatrixWorld(true);
    const tl = vector.set(-1, 1, zNearPlane).applyMatrix4(camera.projectionMatrixInverse.clone()).clone();
    const br = vector.set(1, -1, zNearPlane).applyMatrix4(camera.projectionMatrixInverse.clone()).clone();

    const height = Math.abs(br.y - tl.y);
    const width = Math.abs(br.x - tl.x);

    const size = Math.max(height, width / aspect);
    const position = (new THREE.Vector3()).setFromMatrixPosition(camera.matrixWorld.clone());

    container.position.set(
      tl.x + (br.x - tl.x) / 2,
      tl.y + (br.y - tl.y) / 2,
      tl.z + (br.z - tl.z) / 2,
    );

    plane.position.set(0, (height - size) / 2 + this.offsetY, 0);

    container.updateMatrixWorld(true);
    container.lookAt(position.x, position.y, position.z);

    plane.scale.set(size * aspect * this.scalar, size * this.scalar, this.scalar);
  }
}
