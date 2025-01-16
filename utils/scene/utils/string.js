export function kebabToCamelCase(str) {
  return str.replace(/-./g, x => x[1].toUpperCase())
}
