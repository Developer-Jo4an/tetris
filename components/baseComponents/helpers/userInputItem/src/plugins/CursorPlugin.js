import Plugin from "./Plugin";
import {isMac} from "../../../../../../utils/detector/detector";

export default class CursorPlugin extends Plugin {
  name = "cursor";
  order = 1;


  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;
    if (!item.mouse.changed && !item.scroll.changed) return;


    const parentItem = this.items.find(it => item.settings.ref.current.parentNode === it.settings.ref.current);
    if (!parentItem) return;

    const position = {
      x: item.mouse.x - parentItem.position.screenLeft,
      y: item.mouse.y - parentItem.position.screenTop
    }

    if (this.isMac === undefined) {
      this.isMac = isMac();
    }
    if (!this.isMac) {
      position.x += parentItem.scroll.scroll.x;
      position.y += parentItem.scroll.scroll.y
    }

    if (item.settings.cursor.isFixed) {
      const {clientWidth, clientHeight} = item.settings.ref.current.parentNode;
      item.transform.cursor.y = `${clientHeight / 2}px`;
      item.transform.cursor.x = `${clientWidth / 2}px`;
    } else {
      item.transform.cursor.y = `${position.y}px`;
      item.transform.cursor.x = `${position.x}px`;
    }
  }

  setItemData(item) {
    if (!item.transform) item.transform = {changed: true};

    item.transform.cursor = {
      x: 0,
      y: 0,
      changed: true
    }
  }
}
