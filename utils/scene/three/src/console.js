global.DEBUG = false;
const Console = new class {
  log() {
    if (global.DEBUG)
      console.log.call(undefined, arguments);
  }

  warn() {
    if (global.DEBUG)
      console.warn.call(undefined, arguments);
  }

  error() {
    if (global.DEBUG)
      console.error.call(undefined, arguments);
  }

  info() {
    if (global.DEBUG)
      console.info.call(undefined, arguments);
  }
};
export {Console};
