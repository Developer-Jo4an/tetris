export function phpContent(selector, attr = "innerHTML") {
  const baseContent = global?.document?.querySelector(selector)[attr];
  return (content) => {
    return baseContent || content;
  }
}
