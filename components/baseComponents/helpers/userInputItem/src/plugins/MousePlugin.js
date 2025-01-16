import Plugin from "./Plugin";

export default class MousePlugin extends Plugin {

  name = "mouse";
  order = 0;
  x = 0;
  y = 0;

  constructor(data) {
    super(data);

    this.onMove = this.onMove.bind(this);

    window.addEventListener("mousemove", this.onMove);

    const initMouse = (e) => {
      this.onMove(e);
      window.removeEventListener("mousewheel", initMouse);
    }

    window.addEventListener("mousewheel", initMouse);
  }

  onMove(e) {
    this.x = e.clientX;
    this.y = e.clientY;
    this.changed = true;
    this.informSubscribers();
  }

  updateItemData(item) {
    item.mouse.x = this.x;
    item.mouse.y = this.y;
    item.mouse.changed = true;
  }

  setItemData(item) {
    item.mouse = {
      x: this.x,
      y: this.y,
      changed: true
    }
  }
}
