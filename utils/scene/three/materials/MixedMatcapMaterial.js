import MaterialHelper from "../MaterialHelper";

export default class MixedMatcapMaterial extends THREE.MeshMatcapMaterial {
  constructor(data = {}) {

    if (data.sMap)
      data.sMap.wrapS = data.sMap.wrapT = THREE.RepeatWrapping;
    if (data.sMapAlpha)
      data.sMapAlpha.wrapS = data.sMapAlpha.wrapT = THREE.RepeatWrapping;

    const _uniforms = MaterialHelper.setUniforms(data || {}, [
      ['mixMod', data.mixMod || 0, 'float'],
      ['repeat', data.repeat || 1, 'float'],
      ['sMap', data.sMap, 'sampler2D'],
      ['hasAlpha', !!data.sMapAlpha, 'bool'],
      ['sMapAlpha', data.sMapAlpha, 'sampler2D'],
      ['hasMatcap', !!data.sMatcap, 'bool'],
      ['sMatcap', data.sMatcap, 'sampler2D'],
    ]);
    super(data);


    this.subType = 'MixedMatcapMaterial';
    this._uniforms = _uniforms;


    _uniforms.sMap.setter = (v) => {
      if (v)
        v.wrapS = v.wrapT = THREE.RepeatWrapping;
      if (this.shader) this.shader.uniforms.sMap.value = v;
      _uniforms.sMap.value = v;
    };

    _uniforms.sMapAlpha.setter = (v) => {
      if (v)
        v.wrapS = v.wrapT = THREE.RepeatWrapping;
      if (this.shader) this.shader.uniforms.sMapAlpha.value = v;
      _uniforms.sMapAlpha.value = v;
      if (this.shader) this.shader.uniforms.hasAlpha.value = !!v;
      _uniforms.hasAlpha.value = !!v;
    };

    _uniforms.sMatcap.setter = (v) => {
      if (v)
        v.wrapS = v.wrapT = THREE.RepeatWrapping;
      if (this.shader) this.shader.uniforms.sMatcap.value = v;
      _uniforms.sMatcap.value = v;
      if (this.shader) this.shader.uniforms.hasMatcap.value = !!v;
      _uniforms.hasMatcap.value = !!v;
    };

    MaterialHelper.initUniforms(this);

    this.onBeforeCompile = (shader) => {

      if (this.sMap)
        this.sMap.wrapS = this.sMap.wrapT = THREE.RepeatWrapping;

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
          vec4 sColor = texture2D(sMap, vUv * repeat);
          vec4 sAlpha = texture2D(sMapAlpha, vUv * repeat);
          vec3 viewDir = normalize( vViewPosition );
        `)
        .replace(`vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;`, `
          vec4 matcapColor2 = texture2D( sMatcap, uv );
		      matcapColor2 = matcapTexelToLinear( matcapColor2 );
		      float alpha = sAlpha.r;
		      if(!hasAlpha){ alpha = 1.0; }
		      float alphaMatcap = matcapColor2.r;
		      if(!hasMatcap){ alphaMatcap = 1.0; }
          vec3 outgoingLight = diffuseColor.rgb * mix(matcapColor.rgb, sColor.rgb, alpha * alphaMatcap * mixMod);
        `)
    }
  }
}

THREE.MixedMatcapMaterial = MixedMatcapMaterial;
