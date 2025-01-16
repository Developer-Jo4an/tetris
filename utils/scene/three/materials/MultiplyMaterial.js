import MaterialHelper from "../MaterialHelper";
import AssetsManager from "../../loader/plugins/AssetsManager";

export default class MultiplyMaterial extends THREE.MeshStandardMaterial {

  constructor(params = {}) {
    const multiplyColor = params.multiplyColor ?? "#ffffff";

    params.map = params.map ?? AssetsManager.getAssetFromLib("empty", "texture");

    delete params.multiplyColor;

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['multiplyColor', new THREE.Color(multiplyColor), 'vec3']
    ]);

    super(params);

    this.subType = 'MultiplyMaterial';

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

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(
          '#include <map_fragment>', `

           vec4 multiplyMapColor = texture2D( map, vUv );
           diffuseColor.rgb *= multiplyMapColor.rgb * multiplyColor;
            `)

    };

  }

}


THREE.MultiplyMaterial = MultiplyMaterial;
