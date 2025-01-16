import MaterialHelper from "../MaterialHelper";

export default class MixedMatcap2Material extends THREE.MeshMatcapMaterial {
  constructor(data) {

    const _uniforms = MaterialHelper.setUniforms(data || {}, [
      ['mixMod', data.mixMod || 0, 'float'],
      ['sMatcap', data.sMatcap, 'sampler2D'],
    ]);
    super(data);

    this.subType = 'MixedMatcap2Material';
    this._uniforms = _uniforms;
    MaterialHelper.initUniforms(this);

    this.onBeforeCompile = (shader) => {

      this.shader = shader;
      MaterialHelper.addUniformsToShader(this, shader);

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>', [
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this),
          ].join('\n'));


      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(`vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;`, `
          vec4 matcapColor2 = texture2D( sMatcap, uv );
		      matcapColor2 = matcapTexelToLinear( matcapColor2 );
          vec3 outgoingLight = diffuseColor.rgb * mix(matcapColor.rgb, matcapColor2.rgb, mixMod);
        `)
    }
  }

  set mixMod(mixMod) {
    this.shader.uniforms.mixMod.value = mixMod;
  }

  get mixMod() {
    return this.shader.uniforms.mixMod.value;
  }
}
