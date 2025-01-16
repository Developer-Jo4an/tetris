import MaterialHelper from "../MaterialHelper";

export default class FlagMaterial extends THREE.MeshBasicMaterial {

  constructor(params = {}) {

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['textureOffset', params.textureOffset, 'vec2'],
      ['textureStartOffset', params.textureStartOffset, 'vec2'],
    ]);

    super(params);

    if (params.map)
      params.map.wrapS = params.map.wrapT = THREE.RepeatWrapping;
    this.speed = params?.speed || 0;
    this.subType = 'MixedMatcapMaterial';
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
            `#include <common>`,
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))

        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP
	          vec4 texelColor;
  
            if(gl_FrontFacing){
             texelColor = texture2D( map, vec2(vUv.x,vUv.y) );
            }else{
              texelColor = texture2D( map, vec2(-( textureOffset.x +  vUv.x), textureOffset.y + vUv.y) );
            }
	          texelColor = mapTexelToLinear( texelColor );
	          diffuseColor *= texelColor;

#endif`)
    };
  }


}


THREE.FlagMaterial = FlagMaterial;
