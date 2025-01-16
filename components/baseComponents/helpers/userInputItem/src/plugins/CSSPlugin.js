import Plugin from "./Plugin";

export default class CSSPlugin extends Plugin {

  order = 3;

  name = "css";


  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;

    this.checkTransform(item);
  }

  checkTransform(item) {
    if (!item?.transform?.changed) return;

    item.settings.ref.current.style.transform = `translate3d(${
      item.transform.tx
    }, ${
      item.transform.ty
    },${
      item.transform.tz
    })`
  }
}
