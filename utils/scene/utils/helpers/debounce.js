export function debounce(ms) {
  let timeout;

  return function (func, args, context) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), ms);
  };
}

export function debounceV2(ms) {
  let isBlocked;

  return function (func, args, context) {
    if (isBlocked) return;
    func.apply(context, args)
    isBlocked = true;
    setTimeout(() => isBlocked = false, ms);
  };
}
