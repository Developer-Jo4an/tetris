
import AssetsManager from "../../loader/plugins/AssetsManager";
import {fragment} from "../particles/effect/AlphaParticles";

BABYLON.Effect.ShadersStore["alphaParticlesFragmentShader"] = fragment;

export default class RaySelection {

  static effect = null;

  static TOGGLE_DURATION = 1;

  alpha = 0;

  lights = [];

  _showProgress = 0;

  _isShown = false;

  _isInit = false;

  constructor({scene, eventBus, settings, offset = {x: 0, y: 0, z: 0}, scaleX = 1, target, height = 2, width = 2}) {

    if (!RaySelection.effect)
      RaySelection.effect = scene.getEngine().createEffectForParticles("alphaParticles", []);

    this.offset = offset;
    this.target = target;
    this.scene = scene;
    this.scaleX = scaleX;
    this.settings = settings;
    this.eventBus = eventBus;

    this.height = height;
    this.width = width;
  }

  init() {
    const {target, offset} = this;
    const worldMatrix = target.getWorldMatrix();
    const quatRotation = new BABYLON.Quaternion();
    const position = new BABYLON.Vector3();
    const scale = new BABYLON.Vector3();

    worldMatrix.decompose(scale, quatRotation, position);

    this._isInit = true;

    position.x += offset.x;
    position.y += offset.y;
    position.z += offset.z;

    this.position = position;

    this.initLightPlane();
    this.initLights();

    this.systems = this.settings.systems.map(system => this.initParticleSystem(system));
  }

  get isShown() {
    return this._isShown;
  }

  get topPosition() {
    const {position, height} = this;
    return new BABYLON.Vector3(
      position.x,
      position.y + height / 2,
      position.z
    );
  }

  initLights() {
    const {
      settings: {
        light
      }
    } = this;

    Object.entries(light).forEach(([name, lightSettings]) => this.initSpotLight(name, lightSettings));

  }

  initSpotLight(name, settings) {
    const {
      width
    } = this;
    const {
      offset,
      intensity,
      exponent,
      isTop,
      angle
    } = settings
    const position = (isTop ? this.topPosition : this.position).clone();

    position.x += offset.x;
    position.y += offset.y;
    position.z += offset.z;

    console.log(angle)

    const spotLight = new BABYLON.SpotLight(
      name,
      position, new BABYLON.Vector3(0, isTop ? -1 : 1, 0),
      angle ?? Math.atan(width / 2 / Math.abs(position.y - this.position.y)) * 2,
      exponent,
      this.scene
    );
    spotLight.intensity = 0;
    spotLight.baseIntensity = intensity;

    spotLight.setDirectionToTarget(this.position);
    this.lights.push(spotLight);
  }

  initLightPlane() {
    const {scene, position, height, scaleX} = this;

    const material = new BABYLON.StandardMaterial("light", scene);
    material.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
    material.diffuseTexture = AssetsManager.getAssetFromLib("light", "texture");
    material.emissiveTexture = AssetsManager.getAssetFromLib("light", "texture");
    material.emissiveTexture.hasAlpha = true;
    material.useAlphaFromDiffuseTexture = true;
    material.twoSidedLighting = true;
    material.disableLighting = true;
    material.alpha = 0;

    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
      height: 2,
      width: 1,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);

    plane.scaling.x = scaleX;
    plane.material = material;
    plane.position.x = position.x;
    plane.position.y = position.y + height / 2;
    plane.position.z = position.z;

    this.lightPlane = plane;

  }

  initParticleSystem(settings) {
    const {
      scene, position, height, width
    } = this;
    const {
      startSize,
      texture: {
        name,
        animationSpeedFactor,
        persistence,
        brightness,
        octaves,
        noiseStrength
      },
      ...params
    } = settings;
    const particleSystem = new BABYLON.ParticleSystem("particles", 200, scene, RaySelection.effect);
    const fountain = BABYLON.MeshBuilder.CreateSphere("fountain", {
      diameter: 0.01
    }, scene);
    fountain.material = new BABYLON.StandardMaterial("mFountain");
    fountain.material.alpha = 0;
    fountain.position.set(
      position.x,
      position.y + height,
      position.z,
    )

    const noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, scene);
    noiseTexture.animationSpeedFactor = animationSpeedFactor;
    noiseTexture.persistence = persistence;
    noiseTexture.brightness = brightness;
    noiseTexture.octaves = octaves;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new BABYLON.Vector3(noiseStrength, noiseStrength, noiseStrength);

    particleSystem.particleTexture = AssetsManager.getAssetFromLib(name, "texture");
    particleSystem.emitter = fountain;
    particleSystem.minEmitBox = new BABYLON.Vector3(-width * startSize, 0.3, -width * startSize);
    particleSystem.maxEmitBox = new BABYLON.Vector3(width * startSize, 0.3, width * startSize);


    Object.entries(params).forEach(([key, value]) => {
      if (value[0] === "#") {
        particleSystem[key] = BABYLON.Color4.FromHexString(value)
      } else if (typeof value === "object")
        particleSystem[key] = new BABYLON.Vector3(value.x, value.y, value.z)
      else
        particleSystem[key] = value;
    });

    particleSystem.updateFunction = this.updateParticles.bind(particleSystem, this)

    return particleSystem;
  }


  updateParticles(controller, particles) {

    let noiseTextureSize = null;

    if (this.noiseTexture) {
      // We need to get texture data back to CPU
      noiseTextureSize = this.noiseTexture.getSize();
      this.noiseTexture.getContent()?.then((data) => {
        this.noiseTextureData = data;
      });
    }

    for (let index = 0; index < particles.length; index++) {
      const particle = particles[index];

      let scaledUpdateSpeed = this._scaledUpdateSpeed;
      const previousAge = particle.age;
      particle.age += scaledUpdateSpeed;

      // Evaluate step to death
      if (particle.age > particle.lifeTime) {
        const diff = particle.age - previousAge;
        const oldDiff = particle.lifeTime - previousAge;

        scaledUpdateSpeed = (oldDiff * scaledUpdateSpeed) / diff;

        particle.age = particle.lifeTime;
      }

      const ratio = particle.age / particle.lifeTime;
      const progress = 1 - Math.pow(ratio, this.scaleProgress ?? 1);

      particle.color.set(
        progress,
        progress,
        progress,
        (this.baseAlpha ?? 1.0) * (controller.alpha ?? 0.0)
      );

      particle.angle += particle.angularSpeed * scaledUpdateSpeed;

      // Direction
      let directionScale = scaledUpdateSpeed;

      particle.direction.scaleToRef(directionScale, this._scaledDirection);

      if (this.isLocal && particle._localPosition) {
        particle._localPosition?.addInPlace(this._scaledDirection);
        BABYLON.Vector3.TransformCoordinatesToRef(particle._localPosition, this._emitterWorldMatrix, particle.position);
      } else {
        particle.position.addInPlace(this._scaledDirection);
      }

      // Noise
      if (this.noiseTextureData && noiseTextureSize &&
        particle._randomNoiseCoordinates1) {
        const fetchedColorR = this._fetchR(
          particle._randomNoiseCoordinates1.x,
          particle._randomNoiseCoordinates1.y,
          noiseTextureSize.width,
          noiseTextureSize.height,
          this.noiseTextureData
        );
        const fetchedColorG = this._fetchR(
          particle._randomNoiseCoordinates1.z,
          particle._randomNoiseCoordinates2.x,
          noiseTextureSize.width,
          noiseTextureSize.height,
          this.noiseTextureData
        );
        const fetchedColorB = this._fetchR(
          particle._randomNoiseCoordinates2.y,
          particle._randomNoiseCoordinates2.z,
          noiseTextureSize.width,
          noiseTextureSize.height,
          this.noiseTextureData
        );

        const force = BABYLON.TmpVectors.Vector3[0];
        const scaledForce = BABYLON.TmpVectors.Vector3[1];

        force.copyFromFloats(
          (2 * fetchedColorR - 1) * this.noiseStrength.x,
          (2 * fetchedColorG - 1) * this.noiseStrength.y,
          (2 * fetchedColorB - 1) * this.noiseStrength.z
        );

        force.scaleToRef(scaledUpdateSpeed, scaledForce);
        particle.direction.addInPlace(scaledForce);
      }

      // Gravity
      this.gravity.scaleToRef(scaledUpdateSpeed,
        this._scaledGravity);
      particle.direction.addInPlace(this._scaledGravity);

      if (this._isAnimationSheetEnabled) {
        particle.updateCellIndex();
      }

      // Update the position of the attached sub-emitters to match their attached particle
      particle._inheritParticleInfoToSubEmitters();

      if (particle.age >= particle.lifeTime) {
        // Recycle by swapping with last particle
        this._emitFromParticle(particle);
        if (particle._attachedSubEmitters) {
          particle._attachedSubEmitters.forEach((subEmitter) => {
            subEmitter.particleSystem.disposeOnStop = true;
            subEmitter.particleSystem.stop();
          });
          particle._attachedSubEmitters = null;
        }
        this.recycleParticle(particle);
        index--;

      }
    }
  }

  set showProgress(showProgress) {
    this._showProgress = showProgress;
    this.alpha = showProgress;
    this.lightPlane.material.alpha = showProgress;
  }

  get showProgress() {
    return this._showProgress;
  }

  checkInit() {
    if (!this._isInit)
      this.init();
  }

  show() {
    const duration = RaySelection.TOGGLE_DURATION;

    this.checkInit();

    this._isShown = true;

    this.systems.forEach(system => system.start());

    this.toggle(true, duration);
    this.toggleLight(true, duration);
  }

  hide() {
    const duration = RaySelection.TOGGLE_DURATION;

    this.checkInit()
    this._isShown = false;

    this.toggle(false, duration, () => this.systems.forEach(system => system.stop()));

    this.toggle(false, duration);
    this.toggleLight(false, duration);
  }

  toggle(toggle, duration, onComplete) {
    gsap.killTweensOf(this, "showProgress");
    gsap.to(this,
      {
        duration,
        showProgress: Number(toggle),
        onComplete
      });
  }

  toggleLight(toggle, duration) {
    this.scene.lights.forEach(light => {

      if (light.baseIntensity === undefined)
        light.baseIntensity = light.intensity;

      const isSelectionLight = this.lights.includes(light);
      const isCurrentLight = true;
      let intensity = 1;

      if (isSelectionLight)
        intensity = toggle ? (light.baseIntensity ?? 1) : 0;
      else if (isCurrentLight)
        intensity = toggle ? light.baseIntensity * 0.1 : (light.baseIntensity ?? 1);

      gsap.killTweensOf(light, "intensity");
      gsap.to(light,
        {
          duration,
          intensity
        });
    });
  }
}
