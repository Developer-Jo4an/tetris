import Plugin from "./Plugin";

export default class WindowSizePlugin extends Plugin {

  name = "windowSize";

  width = 0;

  height = 0;

  constructor(data) {
    super(data);

    this.onResize = this.onResize.bind(this);

    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  onResize() {
    const {innerWidth, innerHeight} = window;

    if (innerWidth !== this.width || this.innerHeight !== this.height) {
      this.width = innerWidth;
      this.height = innerHeight;
      this.changed = true;

      this.informSubscribers();
    }
  }

  updateItemData(item) {
    item.windowSize.width = this.width;
    item.windowSize.height = this.height;
    item.windowSize.changed = true;
  }

  setItemData(item) {
    item.windowSize = {
      width: this.width,
      height: this.height,
      changed: true
    }
  }
}
