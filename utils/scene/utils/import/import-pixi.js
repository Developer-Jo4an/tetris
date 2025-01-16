export async function gsap() {
  const {default: gsap} = await import("gsap");
  global.gsap = gsap;
}

export async function pixi() {
  return await import("../../pixi/pixi");
}

export async function basePixiImports() {
  await gsap();
  await pixi();
}
