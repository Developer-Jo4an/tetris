import {postprocessingList} from "../plugins/postprocessing/list";

export default class LoadingManager {

  static version = 1;

  static LOADING_STATES = {
    loading: 0,
    loaded: 1,
    failed: 2,
  };

  itemsTotal = 0;

  itemsLoaded = 0;

  isLoading = false;

  promise;

  _retryCount = 100;

  _loadingList = {};

  _loadedList = [];

  _loaders = {};

  _loadResolve;

  constructor({onLoad, onStart, onProgress, onError} = {}) {

    this.onStart = onStart;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;

    this.promise = new Promise(resolve => this._loadResolve = resolve);
  }

  addLoader(Cls, loader) {
    if (Cls.sysName)
      this._loaders[Cls.sysName] = loader;
  }

  getHandler() {
    return null;
  }

  getLoader(Cls) {
    return Cls?.sysName ? this._loaders[Cls.sysName] : null;
  }

  itemStart(url, key) {

    if (key)
      this._loadingList[key] = LoadingManager.LOADING_STATES.loading;

    if (!this.isLoading && typeof this.onStart === "function") {
      this.onStart(this.getStatusData());
    }


    this.isLoading = true;
  }

  itemEnd(settings, resource, loader, key) {
    if (!resource || key === undefined) return;

    this._loadingList[key] = LoadingManager.LOADING_STATES.loaded;

    const itemsLoaded = Object.values(this._loadingList).reduce((a, b) => {
      if (b === LoadingManager.LOADING_STATES.loaded) return a + 1;
      return a;
    }, 0);
    const itemsTotal = Object.values(this._loadingList)
      .filter(value =>
        value === LoadingManager.LOADING_STATES.loading ||
        value === LoadingManager.LOADING_STATES.loaded
      ).length;

    this._loadedList.push({settings, resource, loader});

    if (typeof this.onProgress === "function")
      this.onProgress({itemsLoaded, itemsTotal});

    if (itemsTotal === itemsLoaded) {
      this._loadedList.forEach(data => {
        postprocessingList.forEach(postprocessing => {
          if (postprocessing.check(data))
            postprocessing.apply(data);
        });
      });

      this.isLoading = false;

      if (typeof this.onLoad === "function")
        this.onLoad({data: this.getStatusData(), settings, resource});

      this._loadingList = {};

      this._loadResolve();
    }
  }

  resolveURL(url, ignoreVersion) {
    const isAddPrefix = url.indexOf(global.ASSETS_PREFIX) !== 0 && global.ASSETS_PREFIX && !url.includes("blob");
    return `${isAddPrefix ? global.ASSETS_PREFIX : ""}${url}${ignoreVersion?"":`?version=${LoadingManager.version}`}`;
  }

  itemError(loader, key, ...args) {
    if (!loader.load) return;


    if (this._retryCount-- > 0) {
      setTimeout(() => {
        this._loadingList[key] = LoadingManager.LOADING_STATES.failed;
        loader.load(...args);
      }, 100);
      return;
    } else this._loadingList[key] = LoadingManager.LOADING_STATES.failed;

    if (typeof this.onError === "function")
      this.onError();
  }

  getStatusData() {
    return {itemsLoaded: this.itemsLoaded, itemsTotal: this.itemsTotal};
  }
}
