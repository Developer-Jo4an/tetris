import {getLogger} from "../../utils/log";

export default class AssetsManager {

  static lib = {};

  static getLib() {
    return this.lib;
  }

  static getType(type) {
    return this.lib[type];
  }

  static removeAssetById(id, type, isDiscard) {
    const asset = AssetsManager.getAssetFromLib(id, type);
    if (!asset)
      return console.warn(`Trying to remove an unregistered Asset from the Lib ${id}`)

    delete this.lib[type].assets[id];
    if (isDiscard && typeof asset.discard === "function")
      asset.discard();
  }

  static isAssetIsRegistered(id, type = "base") {
    return !!this.lib?.[type]?.assets[id];
  }

  static getAssetFromLib(id, type = "base") {
    const asset = this.lib?.[type]?.assets[id];
    if (asset) return asset.item;
    getLogger("warn")("getAssetFromLib: there's no such LibAsset:", id, type);
    return null;
  }

  static getGlobalAsset(id) {
    let result;
    Object.values(this.lib).forEach(typeData => {
      if (result) return;
      if (typeData.assets[id])
        result = typeData.assets[id].item;
    });

    if (!result) getLogger("warn")("getAssetFromLib: there's no such LibAsset:", id);

    return result;
  }

  static addAssetToLib(item, id, type = "base") {
    if (!this.lib[type]) this.lib[type] = {type, assets: {}};

    if (this.lib?.[type]?.assets[id])
      getLogger("warn")("Lib Asset exists", id, type);
    this.lib[type].assets[id] = {
      item
    };
    item['$assetid'] = id;
  }

  static clearAllAssets() {
    Object.keys(this.lib).forEach(type => {
      const assets = this.lib[type].assets;
      Object.keys(assets).forEach(id => {
        const asset = assets[id].item;

        if (asset && typeof asset.destroy === 'function') {
          asset.destroy({ children: true, texture: true, baseTexture: true });
        } else if (asset && typeof asset.discard === 'function') {
          asset.discard();
        }
        delete assets[id];
      });
    });

    this.lib = {};
  }
}
