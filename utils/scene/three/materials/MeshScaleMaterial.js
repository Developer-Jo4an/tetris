import MaterialHelper from "../MaterialHelper";

export default class MeshScaleMaterial extends THREE.MeshStandardMaterial {

  constructor(params = {}) {

    params.maskMap.minFilter = params.maskMap.magFilter = THREE.NearestFilter;
    params.maskMap.generateMipmaps = false;
    params.noiseMap.wrapS = params.noiseMap.wrapT = THREE.RepeatWrapping;

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['maskMap', params?.maskMap, 'sampler2D'],
      ['showProgress', params?.showProgress || 0, 'float'],
      ['selectionIncrease', params?.selectionIncrease, 'float'],
      ['noiseMap', params?.noiseMap, 'sampler2D'],
      ['isDisableNoise', params?.isDisableNoise, "bool"],
      ['radius', params?.radius, 'float'],
      ['center', params?.center || new THREE.Vector3(), 'vec3'],
      ['mixColor', params?.mixColor || new THREE.Vector3(), 'vec3'],
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
            'varying vec4 deltaMask;',
            MaterialHelper.getUniformsShaderDefenition(this),
          ].join('\n'))
        .replace(
          '#include <displacementmap_vertex>',
          `

            float deltaX = center.x - transformed.x;
            float deltaZ = center.z - transformed.z;
            float base = -2.0;
            float noiseScale = 0.05;
            deltaMask = vec4(deltaX / radius, deltaZ / radius, 0.0, 0.0);
            vec2 position = vec2((clamp(deltaMask.x,-1.0,1.0) + 1.0) / 2.0, (clamp(deltaMask.y,-1.0,1.0) + 1.0) / 2.0);
            vec4 noiseColor = texture2D(noiseMap, vec2(transformed.x * noiseScale, transformed.z * noiseScale));
            float noise = noiseColor.r;
            if(isDisableNoise){
              noise = 1.0;
            }

            if(position.y == 1.0 || position.x == 1.0 || position.x == 0.0 || position.y == 0.0){
               deltaMask.z = -1.0;
            }else{
              vec4 maskColor = texture2D(maskMap, position);
              deltaMask.z =  maskColor.r *  mix(maskColor.r, clamp(noise * 2.0, 0.0,1.0), maskColor.g) * maskColor.b;
            }
            transformed.y = (base - deltaMask.z * base * showProgress + transformed.y * deltaMask.z) * selectionIncrease;
            deltaMask.a = transformed.y;
            `);


      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            'varying vec4 deltaMask;',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(
          '#include <clipping_planes_fragment>', `
            if(deltaMask.z < 0.0){
               discard;
            }
            #include <clipping_planes_fragment>
          `
        ).replace("#include <output_fragment>", `
            #ifdef OPAQUE
            diffuseColor.a = 1.0;
            #endif

            // https://github.com/mrdoob/three.js/pull/22425
            #ifdef USE_TRANSMISSION
            diffuseColor.a *= transmissionAlpha + 0.1;
            #endif


            // outgoingLight = mix(mixColor, outgoingLight,  mix(max(deltaMask.a * 0.2, (deltaMask.z - 0.95)/0.05),deltaMask.z, pow(deltaMask.z, 50.0)));

            gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        `);
    };
  }

}

export class MeshScaleDepthMaterial extends THREE.MeshDepthMaterial {

  constructor(params = {}) {

    params.maskMap.minFilter = params.maskMap.magFilter = THREE.NearestFilter;
    params.maskMap.generateMipmaps = false;
    params.noiseMap.wrapS = params.noiseMap.wrapT = THREE.RepeatWrapping;

    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      ['maskMap', params?.maskMap, 'sampler2D'],
      ['showProgress', params?.showProgress || 0, 'float'],
      ['noiseMap', params?.noiseMap, 'sampler2D'],
      ['isDisableNoise', params?.isDisableNoise, "bool"],
      ['radius', params?.radius, 'float'],
      ['center', params?.center || new THREE.Vector3(), 'vec3'],
    ]);

    super(params);

    this.subType = 'MeshScaleDepthMaterial';
    this._uniforms = _uniforms;
    MaterialHelper.initUniforms(this);

    this.onBeforeCompile = (shader) => {
      this.shader = shader;
      MaterialHelper.addUniformsToShader(this, shader);

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>', [
            '#include <common>',
            'varying vec3 deltaMask;',
            MaterialHelper.getUniformsShaderDefenition(this),
          ].join('\n'))
        .replace(
          '#include <displacementmap_vertex>',
          `

            vec3 currentPosition = vec3(transformed);
            float deltaX = center.x - transformed.x;
            float deltaZ = center.z - transformed.z;
            float base = -2.0;
            float noiseScale = 0.05;
            deltaMask = vec3(deltaX / radius, deltaZ / radius, 0.0);
            vec2 position = vec2((clamp(deltaMask.x,-1.0,1.0) + 1.0) / 2.0, (clamp(deltaMask.y,-1.0,1.0) + 1.0) / 2.0);
            vec4 noiseColor = texture2D(noiseMap, vec2(transformed.x * noiseScale, transformed.z * noiseScale));
             float noise = noiseColor.r;
            if(isDisableNoise){
              noise = 1.0;
            }

            if(position.y == 1.0 || position.x == 1.0 || position.x == 0.0 || position.y == 0.0){
               deltaMask.z = -1.0;
            }else{
              vec4 maskColor = texture2D(maskMap, position);
              deltaMask.z =  maskColor.r *  mix(maskColor.r, clamp(noise * 2.0, 0.0,1.0), maskColor.g) * maskColor.b;
            }
            transformed.y = base - deltaMask.z * base * showProgress + transformed.y * deltaMask.z;

            `);

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>', [
            '#include <common>',
            'varying vec3 deltaMask;',
            MaterialHelper.getUniformsShaderDefenition(this, true),
          ].join('\n'))
        .replace(
          '#include <clipping_planes_fragment>', `
            if(deltaMask.z < 0.0){
               discard;
            }
            #include <clipping_planes_fragment>
          `
        )
    };
  }

}


THREE.MeshScaleDepthMaterial = MeshScaleDepthMaterial;
THREE.MeshScaleMaterial = MeshScaleMaterial;
