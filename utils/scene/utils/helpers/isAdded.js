export function isAdded(element){
  let parent = element;
  while (parent && parent.tagName !== "HTML") {
    parent = parent.parentNode;
  }
  return parent?.tagName === "HTML";
}
