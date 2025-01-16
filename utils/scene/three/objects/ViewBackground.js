import AssetsManager from "../../loader/plugins/AssetsManager";
import {isMobile} from "../../../detector/detector";
import {deepClone} from "../src/clone";

export default class ViewBackground extends THREE.Object3D {

  settings = null;

  plane = null;

  constructor({settings}) {
    super();

    this.name = "viewBackground";

    const {mobileExtend = {}} = settings;
    this.settings = {...settings, ...(isMobile() ? mobileExtend : {})};

    this.backgroundBuildingTextures = settings.map;

    this.initPlane();
    this.initClouds();
  }

  initClouds() {
    const {settings: {cloudsOffsetY = 0}} = this;
    const model = AssetsManager.getAssetFromLib("model", "gltf");
    const clouds = this.clouds = deepClone(model.getObjectByName("clouds", true));
    clouds.traverse(child => {
      if (child?.material)
        child.material.fog = false;
    });
    this.add(clouds);
    clouds.position.set(0, cloudsOffsetY, 0);
  }

  get offsetZ() {
    const {settings: {camera: {far}}} = this;
    return far * .9;
  }

  initPlane() {
    const {settings, settings: {offsetY = 0, height = 1}} = this;
    const map = AssetsManager.getAssetFromLib(settings.map, "texture");
    map.encoding = THREE.sRGBEncoding;

    const aspect = map.image.width / map.image.height;
    let width = height * aspect;

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({map, transparent: true, fog: false});

    const scale = height / map.image.height;
    const plane = new THREE.Mesh(geometry, material);
    this.plane = plane;
    plane.name = settings.map;
    plane.scale.set(scale, scale, scale);
    this.add(plane);

    plane.position.set(0, offsetY, this.offsetZ);
  }

  update(data) {
    this.plane.position.z = -(this.offsetZ + data.offset);
    this.clouds.position.z = -(this.offsetZ + data.offset);
  }
}
