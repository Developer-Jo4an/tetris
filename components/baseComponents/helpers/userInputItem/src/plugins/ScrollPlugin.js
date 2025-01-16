import Plugin from "./Plugin";
import {isMobile} from "../../../../../../utils/detector/detector";

export default class ScrollPlugin extends Plugin {

  name = "scroll";

  scroll = {
    x: 0,
    y: 0,
  };

  order = 0;

  prevScroll = {
    x: 0,
    y: 0
  };

  constructor(data) {
    super(data);

    const handler = ({target}) => {
      if (!target) return;
      if (isMobile()) this.scrollTarget = target;
      window.removeEventListener("scroll", handler, {capture: true});
    }

    window.addEventListener("scroll", handler, {capture: true});
    this.update();
  }

  update() {
    let {scrollY, scrollX} = window;

    if (window.scrollBar) {
      scrollY += window.scrollBar?.offset?.y ?? 0;
      scrollX += window.scrollBar?.offset?.x ?? 0;

    } else if (this.scrollTarget) {
      scrollY += this.scrollTarget.scrollTop ?? 0;
      scrollX += this.scrollTarget.scrollLeft ?? 0;
    }


    if (scrollX !== this.scroll.x || scrollY !== this.scroll.y) {
      this.prevScroll.x = this.scroll.x;
      this.prevScroll.y = this.scroll.y;

      this.scroll.x = scrollX;
      this.scroll.y = scrollY;

      this.changed = true;

      this.informSubscribers();
    }
  }

  updateItemData(item) {
    item.scroll.scroll.x = this.scroll.x;
    item.scroll.scroll.y = this.scroll.y;
    item.scroll.prevScroll.x = this.prevScroll.x;
    item.scroll.prevScroll.y = this.prevScroll.y;
    item.scroll.changed = true;
  }

  setItemData(item) {
    item.scroll = {
      scroll: {...this.scroll},
      prevScroll: {...this.prevScroll},
      changed: true
    }
  }
}
