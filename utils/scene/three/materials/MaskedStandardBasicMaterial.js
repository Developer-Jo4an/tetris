import MaterialHelper from "../MaterialHelper";

export default class MaskedStandardBasicMaterial extends THREE.MeshPhysicalMaterial {
  constructor(data = {}) {
    const _uniforms = MaterialHelper.setUniforms(data || {}, [
      ['maskMaterialMap', data.maskMaterialMap, 'sampler2D'],
      ['bloomed', data.bloomed, 'bool'],
      ['basicMap', data.basicMap, 'sampler2D'],
    ]);

    super(data);

    this.subType = 'MaskedMatcapMaterial';
    this._uniforms = _uniforms;
    MaterialHelper.initUniforms(this);

    this.onBeforeCompile = (shader) => {
      this.shader = shader;
      MaterialHelper.addUniformsToShader(this, shader);
      shader.vertexShader = shader.vertexShader;


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
        .replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );', `
    
          float isBasic = texture2D(maskMaterialMap, vec2(vUv.x, 1.0-vUv.y)).r;
          
          if(isBasic != 0.0){
            gl_FragColor = vec4( outgoingLight, diffuseColor.a );
          }else if(bloomed){
            gl_FragColor = vec4(0.0,0.0,0.0,1.0);
          }else{
            gl_FragColor = texture2D(basicMap,vec2(vUv.x, 1.0-vUv.y));
            gl_FragColor.a*= diffuseColor.a;
          }
          `);
    }
  }
}

THREE.MaskedStandardBasicMaterial = MaskedStandardBasicMaterial;
