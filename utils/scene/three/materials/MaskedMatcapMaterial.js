import MaterialHelper from "../MaterialHelper";

export default class MaskedMatcapMaterial extends THREE.MeshMatcapMaterial {
  constructor(data) {

    const _uniforms = MaterialHelper.setUniforms(data || {}, [
      ['maskedMap', data.maskedMap, 'sampler2D'],
      ['mask', data.mask, 'sampler2D'],
    ]);
    super(data);

    this.subType = 'MaskedMatcapMaterial';
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
          ].join('\n'))
        .replace(
          '#include <uv_pars_vertex>',
          `varying vec2 vUv; 
            uniform mat3 uvTransform;
            `)
        .replace(
          '#include <uv_vertex>', [
            'vUv = ( uvTransform * vec3( uv, 1 ) ).xy;'
          ].join('\n'));


      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))

        .replace(
          '#include <uv_pars_fragment>', [
            '#include <uv_pars_fragment>',
            'varying vec2 vUv;',
          ].join('\n'))
        .replace(`vec3 viewDir = normalize( vViewPosition );`, `
          vec3 viewDir = normalize( vViewPosition );
          vec4 color = texture2D(maskedMap, vUv);
          float maskValue = texture2D(mask, vUv).r;
          if(color.r == 1.0 && color.g == 1.0 && color.b == 1.0){
            maskValue = 0.0;
          }
        `)
        .replace(`vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;`, `
          vec3 outgoingLight = diffuseColor.rgb * mix(matcapColor.rgb,color.rgb,maskValue);
        `)
    }
  }
}
