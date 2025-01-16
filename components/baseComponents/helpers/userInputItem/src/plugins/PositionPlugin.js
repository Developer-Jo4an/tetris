import Plugin from "./Plugin";
import getOffset from "../../../../../../utils/element/getOffset";
import {isMobile} from "../../../../../../utils/detector/detector";

export default class PositionPlugin extends Plugin {

  order = 1;

  name = "position";

  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;

    const element = item.settings.ref.current;
    const isChanged = item.windowSize.changed || item.scroll.changed;

    item.position.changed = isChanged;

    if (!isChanged) return;

    const {offsetHeight} = element;

    const hHeight = item.windowSize.height / 2;

    if (item.getPluginSettings("position")?.useBoundingRect) {
      const rect = element.getBoundingClientRect();
      item.position.screenTop = rect.top;
      item.position.screenLeft = rect.left;
      item.position.top = rect.top + item.scroll.scroll.y;
      item.position.left = rect.left + item.scroll.scroll.x;
    } else {
      const position = getOffset(element);
      item.position.top = position.top + item.scroll.scroll.y;
      item.position.left = position.left + item.scroll.scroll.x;
      item.position.screenTop = position.top;
      item.position.screenLeft = position.left;
    }
    if (this.isMob === undefined) {
      this.isMob = isMobile();
    }


    let offsetScrollbar = window.scrollBar?.offset?.y ?? 0;

    if (this.isMob) {
      offsetScrollbar += item.scroll.scroll.y;
    }
    item.position.centerYProgress = (item.position.screenTop - offsetScrollbar + offsetHeight / 2 - hHeight) / hHeight;

    item.getPluginSettings("position")?.onChange?.call(null, item);
  }

  setItemData(item) {
    item.position = {
      top: 0,
      left: 0,
      centerYProgress: 0,
      changed: true
    }
  }
}
