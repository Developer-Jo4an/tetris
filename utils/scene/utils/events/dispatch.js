export function dispatch(target, message) {
  let event;
  if (typeof (global.Event) === 'function') {
    event = new Event(message);
  } else {
    event = document.createEvent('Event');
    event.initEvent(message, true, true);
  }
  target.dispatchEvent(event);
}
