import THREE from "../three";
import MaterialHelper from "../MaterialHelper";

export default class BlendMaterial extends THREE.MeshBasicMaterial {

  constructor(params = {}) {

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['maskMap', params?.maskMap, 'sampler2D']
    ]);

    super(params);

    this.subType = 'BlendMaterial';
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
          `
            varying vec2 vUv; 
            varying vec2 baseUV; 
            uniform mat3 uvTransform;
         
            `)

        .replace(
          '#include <uv_vertex>', [
            `vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
            baseUV = uv;
            `
          ].join('\n'));


      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(
          '#include <uv_pars_fragment>',
          `
            varying vec2 vUv;
            varying vec2 baseUV;
            `)

        .replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
          `
	         vec4 maskColor = texture2D( maskMap, baseUV );
           gl_FragColor = vec4( outgoingLight * maskColor.r, diffuseColor.a );`)
    };

  }

}


THREE.BlendMaterial = BlendMaterial;
