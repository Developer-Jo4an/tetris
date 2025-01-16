export default class InteractiveRaycaster extends THREE.Raycaster {
  constructor() {
    super();
  }

  intersectObjects(objects, recursive, optionalTarget) {
    const array = super.intersectObjects(objects, recursive, optionalTarget);
    const filtered = array.filter(({object}) => this.isInteractive(object) && !this.isCheckDisableParent(object));
    return filtered;
  }

  isInteractive(object) {
    if (!object.parent)
      return object.disableInteractive !== true && object.interactive;
    else if (object.disableInteractive === true)
      return false;
    else if (object.interactive)
      return object.interactive;
    else return this.isInteractive(object.parent);
  }

  isCheckDisableParent(object) {
    if (!object.parent) return object.disableInteractive;
    else if (object.disableInteractive) return true;
    else return this.isCheckDisableParent(object.parent);
  }
}
