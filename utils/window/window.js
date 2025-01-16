/* eslint-disable */
import { URL } from "./url";

export function popup(link, width = 800, height = 600) {
  const params = {
    width,
    height,
    menubar: false,
    toolbar: false,
    location: false,
    status: false
  };

  if (window.screen) {
    params.top = (window.screen.height - params.height) >> 1;
    params.left = (window.screen.width - params.width) >> 1;
  }

  return window.open(link, "share", URL.fromObject(params, ",", ""));
}

export function popupPromise() {
  const w = popup.apply(this, arguments);

  return {
    promise: new Promise((resolve, reject) => {
      window.addEventListener("message", receiveMessage, false);
      function receiveMessage({ origin, data, source }) {
        if (
          source === window ||
          [location.host, "dev.peppers-studio.ru"].indexOf(
            origin.replace(/^https?:\/\//, "")
          ) < 0
        ) {
          return;
        }
        resolve(data);
        done();
      }

      tick();

      function done() {
        reject();
        window.removeEventListener("message", receiveMessage);
        try {
          w.postMessage("close", "*");
          w.close();
        } catch (e) {

        }
      }
      function tick() {
        if (w && w.closed) {
          setTimeout(done, 1000);
        } else {
          requestAnimationFrame(tick);
        }
      }
    }),
    window: w
  };
}
