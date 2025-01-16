export default class BaseDecorator {

  define(target, property, get, set) {
    const attributes = {get, set};

    if (target.hasOwnProperty(property) || target[property] !== undefined) return;
    Object.defineProperty(target, property, attributes)
  }
}
