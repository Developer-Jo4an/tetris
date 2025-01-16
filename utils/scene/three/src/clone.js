const defaultSettings = {}

export function deepClone(object, settings = defaultSettings) {

  let clone;

  if (object instanceof THREE.SkinnedMesh) {
    clone = THREE.SkeletonUtils.clone(object);

    return clone;
  }
  clone = object.clone(false);

  object.children.forEach(child => clone.add(deepClone(child, settings)));

  return clone;
}
