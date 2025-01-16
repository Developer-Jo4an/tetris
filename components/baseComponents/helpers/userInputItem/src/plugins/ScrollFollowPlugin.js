import Plugin from "./Plugin";
import {isMac} from "../../../../../../utils/detector/detector";

export default class ScrollFollowPlugin extends Plugin {

  name = "scrollFollow";

  order = 2;


  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;
    if (!item.scroll.changed && !item.mouse.changed) return;

    const position = {
      x: item.mouse.x,
      y: item.mouse.y
    }

    if (this.isMac === undefined) {
      this.isMac = isMac();
    }
    if (!this.isMac) {
      position.x += item.scroll.scroll.x;
      position.y += item.scroll.scroll.y
    }

    item.transform.scrollFollow.y = `${position.y}px`;
    item.transform.scrollFollow.x = `${position.x}px`;
  }

  setItemData(item) {
    if (!item.transform) item.transform = {changed: true};

    item.transform.scrollFollow = {
      x: 0,
      y: 0,
      changed: true
    }
  }
}
