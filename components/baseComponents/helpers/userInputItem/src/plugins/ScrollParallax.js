import Plugin from "./Plugin";

export default class ScrollParallax extends Plugin {

  name = "scrollParallax";

  order = 2;


  update() {
    this.informSubscribers();
  }

  updateItemData(item) {
    if (!item.settings.ref.current) return;

    if (!item.position.changed) return;

    const settings = item.getPluginSettings(this.name);

    const offsetProgressY = settings.progressOffset?.y ?? 0;
    const scrollYProgress = Math.max(settings.min.y, Math.min(settings.max.y, item.position.centerYProgress + offsetProgressY));

    if (item.scrollParallax.scrollYProgress === scrollYProgress) return;

    item.scrollParallax.scrollYProgress = scrollYProgress + offsetProgressY;

    item.transform.scroll.changed = true;

    const ty = -scrollYProgress * settings.offsetY;

    item.transform.scroll.y = settings.type ? `${ty}${settings.type}` : ty;
  }

  setItemData(item) {
    if (!item.transform) item.transform = {changed: true};

    item.scrollParallax = {
      scrollYProgress: 0,
    };

    item.transform.scroll = {
      x: 0,
      y: 0,
      changed: true
    }
  }
}
