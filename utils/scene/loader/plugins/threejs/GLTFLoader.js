import BaseLoader from "../BaseLoader";
import AssetsManager from "../AssetsManager";

/**
 * {
 *     "subtype": "threejs",
 *     "type": "gltf",
 *     "name": "some_model",
 *     "addDracoLoader": true, - [optional] add this property if gltf was compressed
 *     "path": "assets/", - path to asset's folder
 *     "fileName": "model.gltf" - asset's file name
 *   }
 */
export default class GLTFLoader extends BaseLoader {

  static sysName = "ThreeGLTFLoader";

  dracoLoader;

  constructor(manager) {
    super(manager);
    this.checkParser = this.checkParser.bind(this);
  }

  checkParser(settings, parser) {
    parser.beforeRoot = this.getBeforeRoot(parser.beforeRoot, parser, settings);
    return {
      name: "checkParser",
      parser
    };
  }

  getBeforeRoot(baseCallBack, parser, settings) {
    const {path} = settings;

    return () => {
      if (!parser.json.textures) return;
      const texturesPromises = parser.json.textures
        .filter(textureDef => {
          const sourceIndex = textureDef.source;
          const sourceDef = parser.json.images[sourceIndex];

          return !!sourceDef.uri;
        })
        .map((textureDef, index) => {
          const sourceIndex = textureDef.source;
          const sourceDef = parser.json.images[sourceIndex];
          const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;

          const promise = this.loadTexture(`${path}${sourceDef.uri}`).then(texture => {

            if (!AssetsManager.isAssetIsRegistered(sourceDef.uri, "texture"))
              AssetsManager.addAssetToLib(texture, sourceDef.uri, "texture");

            parser.textureCache[cacheKey] = AssetsManager.getAssetFromLib(sourceDef.uri, "texture");

            return AssetsManager.getAssetFromLib(sourceDef.uri, "texture");
          });

          parser.cache.add(`texture:${index}`, promise);

          return promise;
        });

      return Promise.all([baseCallBack?.call(parser), ...texturesPromises]);
    };
  }

  loadTexture(url, resolver) {

    return new Promise(resolve => {
      const loader = new THREE.TextureLoader();
      loader.load(
        this.manager.resolveURL(url),
        resolver ?? resolve,
        undefined,
        () => setTimeout(() => this.loadTexture(url, resolver ?? resolve), 100)
      );
    });
  }

  load(settings) {
    const {path, fileName} = settings;
    const loader = new THREE.GLTFLoader(this.manager);
    const url = this.manager.resolveURL(`${path}${fileName}`);

    const key = super.load(url);

    if (settings.addDracoLoader) {

      if (!this.dracoLoader) {
        const dracoLoader = new THREE.DRACOLoader(this.manager);
        dracoLoader.setDecoderPath(`${global.ASSETS_PREFIX}js/libs/`);
        dracoLoader.setDecoderConfig({type: "js"});

        this.dracoLoader = dracoLoader;
      }

      loader.setDRACOLoader(this.dracoLoader);
    }


    loader.pluginCallbacks.push(this.checkParser.bind(this, settings));

    loader.load(url, (data) => {

        data.scene.animations = data.animations;

        data.scene._loadData = data;

        if (data._loader) {
          data.scene.getClone = () => {
            return new Promise((resolve, reject) => {
              const {_loadData: {_loader, _data, _resourcePath}} = data.scene;
              _loader.parse(_data, _resourcePath, (gltf) => {
                gltf.scene.animations = gltf.animations;
                resolve(gltf);
              });
            });
          };
        }

        this.onLoad(settings, data.scene, key);
      },
      () => {
      },
      () => this.onError(key, ...arguments));
  }
}
