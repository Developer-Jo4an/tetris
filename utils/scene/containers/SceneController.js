import Loader from "../loader/Loader";
import AssetsManager from "../loader/plugins/AssetsManager";
import {getIsDebug} from "../debug/getIsDebug";
import FPSMeter, {fpsMeter} from "../utils/fps-meter/fps-meter";

export default class SceneController {

  manifest;

  storage;

  eventBus;

  container;

  debug = getIsDebug();

  constructor({storage, eventBus} = {}) {

    this.update = this.update.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onManifestLoaded = this.onManifestLoaded.bind(this);
    this.onLoadingProgress = this.onLoadingProgress.bind(this);
    this.onDecreaseStepChange = this.onDecreaseStepChange.bind(this);
    this.onLoadingManifestProgress = this.onLoadingManifestProgress.bind(this);

    this.storage = storage;
    this.eventBus = eventBus;
  }

  init() {
    this.initFPSMeter();
  }

  initFPSMeter(){
    FPSMeter.listen(this.onDecreaseStepChange);
    fpsMeter.start();
  }

  onDecreaseStepChange(step) {
  }

  appendContainer(container) {
    this.container = container;
    this.eventBus.dispatchEvent({type: "scene-controller:append", data: {container}})
  }

  update() {
  }

  loadingSelect() {
    return Loader.load(this.storage.preload, {
      onLoad: this.onLoad,
      onProgress: this.onLoadingProgress
    })
  }

  onLoad() {
    this.eventBus.dispatchEvent({
      type: "scene-controller:loaded"
    })
  }

  loadManifestSelect() {
    return Loader.load([{
      subtype: "base",
      type: "json",
      name: "settings",
      url: this.storage.manifestLink
    }], {
      onLoad: this.onManifestLoaded,
      onProgress: this.onLoadingManifestProgress
    })
  }

  onLoadingProgress({itemsLoaded, itemsTotal}) {
    this.eventBus.dispatchEvent({
      type: "scene-controller:loading-progress", data: {
        progress: itemsLoaded / itemsTotal,
        itemsLoaded, itemsTotal
      }
    })
  }

  onLoadingManifestProgress({itemsLoaded, itemsTotal}) {
    this.eventBus.dispatchEvent({
      type: "scene-controller:loading-manifest-progress", data: {
        progress: itemsLoaded / itemsTotal,
        itemsLoaded, itemsTotal
      }
    })
  }

  onManifestLoaded() {
    this.storage.data = AssetsManager.getAssetFromLib("settings", "json");
  }
}
