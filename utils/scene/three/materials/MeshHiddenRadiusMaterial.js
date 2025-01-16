import MaterialHelper from "../MaterialHelper";

export default class MeshHiddenRadiusMaterial extends THREE.MeshBasicMaterial {

  constructor(params = {}) {

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['endRadius', params?.endRadius, 'float'],
      ['startRadius', params?.startRadius, 'float'],
      ['center', params?.center || new THREE.Vector3(), 'vec3'],
    ]);
    super(params);

    this.subType = 'MeshScaleMaterial';
    this._uniforms = _uniforms;
    MaterialHelper.initUniforms(this);

    this.onBeforeCompile = (shader) => {
      this.shader = shader;
      MaterialHelper.addUniformsToShader(this, shader);

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>', [
            '#include <common>',
            `varying vec4 sTransformed;`,
            MaterialHelper.getUniformsShaderDefenition(this),
          ].join('\n'))
        .replace(
          '#include <worldpos_vertex>',
          `
            #include <worldpos_vertex>
            sTransformed = worldPosition;`);

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            `varying vec4 sTransformed;`,
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(
          '#include <alphamap_fragment>',
          `
            #include <alphamap_fragment>

            float deltaX = center.x - sTransformed.x;
            float deltaZ = center.z - sTransformed.z;
            
            float distance = deltaX * deltaX + deltaZ * deltaZ;
            
            float pStartR = startRadius * startRadius;
            
            float pEndR = endRadius * endRadius;
            
            
            if(distance > pEndR){
                diffuseColor.a *= 0.0;
            }else if( distance > pStartR){
                diffuseColor.a *= diffuseColor.a *= mix(1.0, 0.0,  (distance - pStartR) / (pEndR - pStartR)); 
            }
         
            `);
    };
  }

}

THREE.MeshHiddenRadiusMaterial = MeshHiddenRadiusMaterial;
