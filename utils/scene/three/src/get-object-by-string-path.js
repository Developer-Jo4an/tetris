export function getObjectByStringPath(obj, path) {
  if (!obj) return null;
  if (!path) return obj;
  return (Array.isArray(path) ? path : path.split('.')).reduce((o, i) => {
    return o && o[i];
  }, obj);
}
