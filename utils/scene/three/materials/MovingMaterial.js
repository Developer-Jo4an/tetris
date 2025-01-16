import THREE from "../three";
import MaterialHelper from "../MaterialHelper";

export default class MovingMaterial extends THREE.MeshBasicMaterial {

  constructor(params = {}) {

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['offset', params?.offset || 0, 'float']
    ]);

    super(params);

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
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))

        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vec2(vUv.x + offset,vUv.y) );

	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;

#endif`)
    };

    requestAnimationFrame(this.updateOffset);
  }

  updateOffset = () => {
    this.offset += this.speed;
    requestAnimationFrame(this.updateOffset);
  };

  set offset(speed) {
    if (this.shader)
      this.shader.uniforms.offset.value = speed;
    else
      this._uniforms.offset.value = speed;
  }

  get offset() {
    return this.shader.uniforms.offset.value;
  }
}


THREE.MovingMaterial = MovingMaterial;
