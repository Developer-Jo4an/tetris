export async function gsap() {
  const {default: gsap} = await import("gsap");
  global.gsap = gsap;
}

export async function three() {
  return await import("../../three/three.jsm");
}


export async function baseThreeImports() {
  await gsap();
  await three();
}
