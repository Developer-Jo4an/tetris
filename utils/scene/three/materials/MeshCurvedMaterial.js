import MaterialHelper from "../MaterialHelper";

/**
 * Использован для закругления земли на "линии горизонта"
 */
export default class MeshCurvedMaterial extends THREE.MeshBasicMaterial {
  constructor(params = {}) {
    const {
      xDirections = [-1, 1, 0],
      xDirection = 0,
      cameraOffsetXAxis = 10,
      arcAngleX = Math.PI / 4,
      arcRadiusX = 50,
      arcAngleY = Math.PI / 6,
      arcRadiusY = 10,
      cameraOffsetYAxis = 10,
      texture,
      eventBus,
      curvedAreaXLength,
      ...props
    } = params;
    const _uniforms = MaterialHelper.setUniforms(params || {}, [
      // x-axis transform
      ["xDirections", xDirections, "vec3"],
      ["xDirection", xDirection, "float"], // turnProgress
      ["cameraOffsetXAxis", cameraOffsetXAxis, "float"],
      ["arcAngleX", arcAngleX, "float"],
      ["arcRadiusX", arcRadiusX, "float"],
      ["activationProgress", 1, "float"],
      ["activationUV", new THREE.Vector2(0, 0), "vec2", null, null, "varying"],
      ["activationTexture", texture, "sampler2D"],
      ["alphaValue", 0.5, "float"],
      ["time", 0.0, "float"],
      ["speed", 0.005, "float"],
      ["colorWhite", new THREE.Color(0, 0.26666666666666666, 1), "vec3"],
      ["colorBlack", new THREE.Color(0, 0.6588235294117647, 1), "vec3"],

      // z-axis transform
      ["arcAngleY", arcAngleY, "float"],
      ["arcRadiusY", arcRadiusY, "float"],
      ["cameraOffsetYAxis", cameraOffsetYAxis, "float"]
    ]);
    super({...props, transparent: true});
    this.onBeforeCompile = this.onBeforeCompile.bind(this);
    this.subType = "MeshCurvedMaterial";
    this._uniforms = _uniforms;

    MaterialHelper.initUniforms(this);
  }

  onBeforeCompile(shader) {
    this.shader = shader;

    MaterialHelper.addUniformsToShader(this, shader);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>", [
          `vec2 rotateV2(vec2 vector, float angle) {
              float x1 = vector.x * cos(angle) - vector.y * sin(angle);
              float y1 = vector.x * sin(angle) + vector.y * cos(angle);
              return vec2(x1, y1);
            }
            `,
          "#include <common>",
          MaterialHelper.getUniformsShaderDefenition(this),
        ].join("\n"))
      .replace(
        "#include <project_vertex>",
        `
            vec4 mvPosition = vec4( transformed, 1.0 );

            activationUV = vec2(mvPosition.z,  mvPosition.y);

            #ifdef USE_INSTANCING

              mvPosition = instanceMatrix * mvPosition;

            #endif

            mvPosition = modelViewMatrix * mvPosition;

// common
             float cameraZ = cameraPosition.z;
             float _vDist = abs(mvPosition.z - cameraZ);

// apply transform to x-axis: curved right/left

             float distX = _vDist - cameraOffsetXAxis;
             float arcLength = arcAngleX * arcRadiusX;
             float progressZ = clamp(distX/arcLength, 0.0, 1.0);
             float angle = arcAngleX * progressZ;

             vec2 offset = vec2(xDirection * min(arcLength, distX), 0.0);
             vec2 rotated = rotateV2(offset, xDirection * angle);
             vec2 resultOffset = vec2(rotated.x - offset.x, rotated.y - offset.y);

             mvPosition.x -= resultOffset.x;
             mvPosition.z -= resultOffset.y;

// apply transform to z-axis: curved down

              float distY = _vDist - cameraOffsetYAxis;
              float arcLengthY = arcRadiusY * arcAngleY;
              float progressY = clamp(distY/arcLengthY, 0.0, 1.0);
              float progressAngle = arcAngleY * progressY;
              vec2 offsetY = vec2(0, min(arcLengthY, distY));
              vec2 rotatedY = rotateV2(offsetY, progressAngle);
              vec2 resultOffsetY = vec2(rotatedY.x - offsetY.x, rotatedY.y - offsetY.y);

              mvPosition.y += resultOffsetY.y;
              mvPosition.z += resultOffsetY.x;



             gl_Position = projectionMatrix * mvPosition;
        `);

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>", [
          "#include <common>",
          MaterialHelper.getUniformsShaderDefenition(this, true),
        ].join("\n"))
      .replace(
        "#include <map_fragment>",
        `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vUv );

          #ifdef DECODE_VIDEO_TEXTURE
            sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
          #endif


          if(activationProgress < 1.0){
            vec4 actTexture = texture2D( activationTexture, vec2(activationUV.x, activationUV.y - time * speed) );
            actTexture= vec4(mix(colorWhite, colorBlack, actTexture.r), actTexture.a);
            actTexture.a *= alphaValue;
            vec4 middleColor = mix(sampledDiffuseColor,actTexture, 0.75);
            sampledDiffuseColor = mix( middleColor,sampledDiffuseColor,activationProgress);
          }



          diffuseColor *= sampledDiffuseColor;
        #endif
      `);
  }

  setProperty(name, value) {
    if (this.shader)
      this.shader.uniforms[name].value = value;
    else
      this._uniforms[name].value = value;
  }

  reset() {
    this.setProperty("xDirection", 0);
  }

}
