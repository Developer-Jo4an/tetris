export default function applyRef(ref, node) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(node)
  } else if (typeof ref === "object") {
    ref.current = node;
  }
}

export function combineRefs(refs) {
  return (node) => refs.forEach(ref => applyRef(ref, node))
}
