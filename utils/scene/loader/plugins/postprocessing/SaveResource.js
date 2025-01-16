import AssetsManager from "../AssetsManager";

export default class SaveResource {

  static check({settings, resource, loader}) {
    return true;
  }

  static apply({settings, resource}) {
    AssetsManager.addAssetToLib(resource, settings.name, settings.assetType ?? settings.type);
  }
}
