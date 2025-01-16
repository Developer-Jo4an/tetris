import Plugin from "./Plugin";

export default class TransformPlugin extends Plugin {

  name = "transform";

  order = 2;

  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;

    const tX = [];
    const tY = [];
    const tZ = [];

    let isChanged = false;

    Object.entries(item.transform).forEach(([key, value]) => {
      if (!value.changed) return;

      isChanged = true;
      if (value.x)
        tX.push(value.x);
      if (value.y)
        tY.push(value.y);
      if (value.z)
        tZ.push(value.z);

      value.changed = false;
    });


    if (!isChanged) return;

    item.transform.tx = this.combineTransforms(tX);
    item.transform.ty = this.combineTransforms(tY);
    item.transform.tz = this.combineTransforms(tZ);
    item.transform.changed = true;

    item.settings.ref.current.style.transform = `translate3d(${
      item.transform.tx
    }, ${
      item.transform.ty
    },${
      item.transform.tz
    })`
  }

  combineTransforms(transforms) {
    return transforms[transforms.length - 1] || 0; //TODO: написать
  }

  setItemData(item) {
    if (!item.transform) item.transform = {changed: true};
  }
}
