export default class Item {


  constructor({uid, settings}) {
    this.uid = uid;
    this.settings = settings;
    this.componentID = settings?.componentID;
  }

  getPluginSettings(name) {
    return this.settings?.[name];
  }
}
