import AssetsManager from "../AssetsManager";
import {applyObjectProperties, DONT_APPLY_PROPERIES} from "../../../three/src/apply-object-properties";
import {connectAttrs} from "../../../three/src/connect-attributes";
import {checkOverrideParam, getThreeObjectByString, replaceObject} from "../../../three/three-utils";
import {getLogger} from "../../../utils/log";

export default class ThreeParser {

  static singleGeometries = [];

  static PREFIXES = {
    texture: "t",
    material: "mat"
  }

  static TYPES = {
    mesh: "mesh",
    material: "material",
    texture: "texture",
  };

  static check({resource}) {
    return resource instanceof THREE.Group;
  }

  static apply({settings, resource}) {
    ThreeParser.parseMaterialsAndTexturesFromSceneFile(resource);
    ThreeParser.modifyScene(resource, settings);
  }

  static modifyScene(scene, settings) {
    const {
      replaceMaterials = [],
      singleGeometryKeys,
      useGlobalReplaceMaterials,
      materialOverrides,
      objectOverrides
    } = settings;

    const {replaceMaterials: globalReplaceMaterials = []} = AssetsManager.getAssetFromLib("settings", "json") ?? {};


    const materials = ThreeParser.mergeReplaceMaterials(
      useGlobalReplaceMaterials ? globalReplaceMaterials : [],
      replaceMaterials
    );

    materials.forEach((materialData) => {
      const [matSrc, matTarget] = materialData;
      const mat = AssetsManager.getAssetFromLib(matTarget, "material");
      if (!mat)
        return console.warn(`There's no such material ${matTarget}`);

      matSrc.split(',').forEach(matSrcName => ThreeParser.replaceMaterialsInObject(scene, matSrcName, mat));
    });

    ThreeParser.overrideMaterials(scene, materialOverrides, {scene});
    ThreeParser.overrideObjects(scene, objectOverrides, {scene});

    scene.traverse(child => ThreeParser.checkGeometry(child, singleGeometryKeys));
  }

  static parseMaterialsAndTexturesFromSceneFile(scene) {
    scene.traverse(item => {
      if (item.type.toLowerCase() !== ThreeParser.TYPES.mesh) return;

      if (item.material.length)
        item.material.forEach(mat => ThreeParser.saveMaterial(mat));
      else
        ThreeParser.saveMaterial(item.material);
    });
  }

  static saveMaterial(material) {
    const name = `${ThreeParser.PREFIXES.material}${material.name}`;
    if (material.name && !AssetsManager.isAssetIsRegistered(name, ThreeParser.TYPES.material))
      AssetsManager.addAssetToLib(material, name, ThreeParser.TYPES.material);

    for (const attrKey in material) {
      const attribute = material[attrKey];

      if (attribute instanceof THREE.Texture && attribute.name) {
        const textureName = `${ThreeParser.PREFIXES.material}${attribute.name}`;
        if (!AssetsManager.isAssetIsRegistered(textureName, ThreeParser.TYPES.texture))
          AssetsManager.addAssetToLib(attribute, textureName, ThreeParser.TYPES.texture);
      }
    }
  }

  static mergeReplaceMaterials(global, local) {
    local = (local || []).concat();

    global.forEach((replaceMaterialData) => {
      const [gMaterialName] = replaceMaterialData;
      const isAdded = !!local.filter(lReplaceMaterialData => {
        const [lMaterialName] = lReplaceMaterialData;
        return lMaterialName === gMaterialName;
      }).length;
      if (!isAdded)
        local.push(replaceMaterialData);
    });
    return local;
  }

  static createObjectsFromParams(objList, params) {
    Object.keys(objList).forEach((objName) => {
      const objData = Object.assign({}, objList[objName]);
      let obj;

      if (objData.clone) { // Clone
        if (!params.scene) {
          getLogger("warn")(`Can't clone (${objData.clone}) for (${objName}) without Scene link in the params`);
          return;
        }
        const refObj = params.scene.getObjectByName(objData.clone);
        if (!refObj) {
          getLogger("warn")(`Object (${objData.clone}) not found for cloning ${objName}`);
          return;
        }
        obj = refObj.clone();
      } else { // Create new One
        if (!THREE[objData.class]) {
          getLogger("warn")("There's no such class", objData.class, "in THREE.");
          return;
        }

        if (Array.isArray(objData.params)) {
          objData.params = objData.params.map((e) => {
            if (typeof e === 'string' && e.charAt(0) === '@' && params.scene) {
              return getThreeObjectByString(e.substr(1, e.length), params.scene);
            } else return e;
          })
        }
        obj = objData.params ? new THREE[objData.class](...objData.params) : new THREE[objData.class]();

      }

      obj.name = objName;

      ThreeParser.overrideObjectAttributes(obj, objData.attr, undefined, params);

      if (objData.type)
        AssetsManager.addAssetToLib(obj, objName, objData.type);
    });
  }

  static replaceMaterialsInObject(object, originalMatName, newMatClass) {
    object.traverse(item => {
      const {material} = item;

      if (!(item instanceof THREE.Mesh)) return;

      if (material?.length)
        material.forEach((mat, i) => {
          if (mat.name === originalMatName && typeof newMatClass !== 'string')
            material[i] = newMatClass;
        })
      else if (material.name === originalMatName) {
        if (typeof newMatClass !== 'string')
          item.material = newMatClass;
        else
          ThreeParser.changeMaterialType(THREE[newMatClass], material, item);
      }
    });

  }

  static changeMaterialType(newMatClass, oldMat, obj, createParams) {
    if (!newMatClass) return;
    const newMat = new newMatClass(createParams);
    if (!newMat) return;
    applyObjectProperties(newMat, oldMat, true, null, ['type', 'uuid', 'name']);
    connectAttrs(newMat, oldMat, ['map', 'emissiveMap', 'matcap', 'roughnessMap', 'metalnessMap', 'envMap', 'bumpMap', 'normalMap', 'alphaMap', 'bumpMap'], false);
    if (obj) obj.material = newMat;
    return newMat;
  }

  static overrideMaterials(asset, materialOverrides, {scene}) {
    console.log("Override materials",materialOverrides, asset);
    if (!asset || !materialOverrides) return;

    Object.keys(materialOverrides).forEach(_matNameId => {

      const newMatData = materialOverrides[_matNameId];

      const newMatDataCleared = {...newMatData};
      // Remove custom attrs from the Data object
      delete newMatDataCleared.type;
      delete newMatDataCleared.name;
      delete newMatDataCleared.ignorePrefix;
      delete newMatDataCleared.namePrefix;
      delete newMatDataCleared.nameSuffix;

      console.log("New material", AssetsManager.lib );
      const matNames = _matNameId.split(',');

      matNames.forEach(_matName => {

        const matName = _matName.trim();

        let currentMaterial = AssetsManager.getAssetFromLib(
          `${newMatData.ignorePrefix ? "" : ThreeParser.PREFIXES.material}${matName}`,
          ThreeParser.TYPES.material
        );

        if (!currentMaterial)
          return console.warn("There's no such material ", matName);

        const {uuid} = currentMaterial;
        const currentMaterialName = currentMaterial.name;

        // Get instances of the Original material
        const meshes = ThreeParser.getObjectsByMaterial(asset, currentMaterial);

        if (!meshes.length) return;

        // Change Material type if provided
        if (newMatData.type) {

          if (!THREE[newMatData.type])
            return console.warn("Material class must be contained in THREE Object.");


          // Create the new Material and pass attrs from the original one
          const newMaterial = ThreeParser.changeMaterialType(THREE[newMatData.type], currentMaterial);
          newMaterial.modified = true;
          AssetsManager.removeAssetById(`${ThreeParser.PREFIXES.material}${matName}`);
          currentMaterial.dispose(); // Destroy the Original material
          currentMaterial = newMaterial;

          // Change the name of this new Material
          currentMaterial.name = `${
            newMatData?.namePrefix ?? ""
          }${
            newMatData.name || currentMaterialName
          }${
            newMatData?.nameSuffix ?? ''
          }`;
          // Console.log('new Name', currentMaterial.name );
          AssetsManager.addAssetToLib(
            currentMaterial,
            `${ThreeParser.PREFIXES.material}${currentMaterial.name}`,
            ThreeParser.TYPES.material
          ); // Put this new Material to the Lib

          // Replace this new material on all instanses
          if (meshes && meshes.length)
            meshes.forEach(mesh => {
              const {material} = mesh;
              if (material.length)
                material
                  .forEach((meshMaterial, index) => {
                    if (meshMaterial.uuid === uuid)
                      material[index] = currentMaterial;
                  });
              else
                mesh.material = currentMaterial;
            });
        }

        //
        if (Object.keys(newMatDataCleared).length)  // Apply other Material overrides
          // ThreeAssets.applyObjectProperties( currentMaterial, newMatData, true );
          ThreeParser.overrideObjectAttributes(currentMaterial, newMatDataCleared, undefined, {scene});
      });

    });

  }

  static getObjectsByMaterial(object, material) {
    const result = [];
    object.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        ThreeParser.checkMaterials(item, itemMaterial => {
          if (itemMaterial && itemMaterial.name === material.name && !itemMaterial.modified) result.push(item);
          return itemMaterial;
        });
      }
    });
    return result;
  }


  static checkMaterials(child, modificator) {
    if (!child.material) return;
    const isModificator = typeof modificator === "function";
    if (Array.isArray(child.material)) {
      if (isModificator)
        child.material.forEach((material, index) => {
          child.material[index] = modificator.call(this, material, index, child.material.length, child);
        });
    } else if (isModificator)
      child.material = modificator.call(this, child.material, 0, 1, child);
  }

  static overrideObjectAttributes(obj, overrides, applyValue, params) {

    applyObjectProperties(obj, overrides, false, (paramName, oldValue, newValue, context) => {

      let doneHere = false;
      let contextParam = context[paramName];

      if (newValue && typeof newValue === "string" && newValue.charAt(0) === '$') { // include references
        newValue = AssetsManager.getGlobalAsset(newValue.substring(1));
      }

      newValue = checkOverrideParam(paramName, newValue, params.scene, AssetsManager);

      const _completeParam = (errorId = 0) => {
        newValue = DONT_APPLY_PROPERIES;
        doneHere = true;
        if (errorId)
          getLogger("warn")(`Can't apply param (${paramName})`)
      };

      switch (paramName) {

        case 'position':
        case 'scale':
          if (newValue === undefined) {
            _completeParam(1);
          } else if (Array.isArray(newValue)) { // Array params
            contextParam.set(newValue[0] || 0, newValue[1] || 0, newValue[2] || 0);
            _completeParam();
          }
          break;

        case 'addPosition':
        case 'addScale':
          if (newValue === undefined) {
            _completeParam(1);
          } else if (Array.isArray(newValue)) { // Array params
            contextParam = context[paramName.substr(3, paramName.length).toLowerCase()];
            contextParam.x += newValue[0];
            contextParam.y += newValue[1] || 0;
            contextParam.z += newValue[2] || 0;
            _completeParam();
          }
          break;

        case 'rotation':
          if (newValue === undefined) {
            _completeParam(1);
          } else if (Array.isArray(newValue)) { // Array params
            const usedOrder = newValue[3]; // rotation order
            if (usedOrder) {
              contextParam.order = usedOrder;
            }
            contextParam.set(
              newValue[0] !== undefined ? THREE.MathUtils.degToRad(newValue[0]) : contextParam.x,
              newValue[1] !== undefined ? THREE.MathUtils.degToRad(newValue[1]) : contextParam.y,
              newValue[2] !== undefined ? THREE.MathUtils.degToRad(newValue[2]) : contextParam.z
            );
            _completeParam();
          }
          break;

        case 'addRotation':
          if (newValue === undefined) {
            _completeParam(1);
          } else if (Array.isArray(newValue)) { // Array params
            contextParam = context[paramName.substr(3, paramName.length).toLowerCase()];

            contextParam.x += THREE.MathUtils.degToRad(newValue[0]);
            if (newValue[1]) contextParam.y += THREE.MathUtils.degToRad(newValue[1]);
            if (newValue[2]) contextParam.z += THREE.MathUtils.degToRad(newValue[2]);
            _completeParam();
          }
          break;

        case 'replaceMaterial':

          getLogger("log")('Material:', context)

          if (newValue === undefined) {

            _completeParam(1);

          } else {

            if (typeof newValue === 'string') { // Get material from lib

              const mat = AssetsManager.getAssetFromLib(newValue, ThreeParser.TYPES.material);

              if (mat) {
                context.material = mat;
                _completeParam();
                delete context.replaceMaterial;
              } else {
                _completeParam(1);
              }

            } else { // replace material

              const matType = THREE[newValue.shift()];
              const mat = ThreeParser.changeMaterialType(matType, context.material, context);
              if (mat) {
                ThreeParser.overrideObjectAttributes(mat, newValue[0], undefined, params);
                _completeParam();
              } else {
                _completeParam(1);
              }

            }
          }
          break;
      }

      if (!doneHere) {
        switch (paramName) {

          case "replaceObject":
            if (replaceObject(newValue, scene, context, scene, scene)) _completeParam();
            else {
              getLogger("log")('replaceObject failed:', paramName, oldValue, newValue, context)
              _completeParam(1);
            }
            break;

          case "parent":
            if (newValue === false) { // remove from parent
              if (oldValue) {
                oldValue.remove(context);
                _completeParam();
              } else {
                getLogger("warn")('Remove from parent failed:', paramName, oldValue, newValue, context);
                _completeParam(1);
              }
            } else if (params.scene) {
              if (newValue === true) newValue = params.scene;
              else if (typeof newValue === 'string') newValue = params.scene.getObjectByName(newValue);
              if (newValue) newValue.add(context);
              _completeParam();
            }
            break;
          case "baseColor":
            newValue = new THREE.Color(newValue);
            break;
          case "color":
            newValue = new THREE.Color(newValue);
            break;
        }

      }
      return applyValue ? applyValue(paramName, oldValue, newValue, context) : newValue;
    }, ['$id']);
  }

  static overrideObjects(asset, data, params) {
    if (!asset || !data) return;
    if (!params) params = {scene: asset};

    let obj;

    Object.keys(data).forEach(_objId => {

      const objData = data[_objId];
      const objNames = _objId.split(',');

      objNames.forEach((_objName) => {

        _objName = _objName.trim();

        if (_objName.charAt(0) === '&') {
          _objName = _objName.substring(1).split(';');
          const _objLibName = _objName.shift();
          _objName = _objName[1];

          obj = AssetsManager.getGlobalAsset(_objLibName);
          if (!obj)
            return getLogger("warn")('Object not found in lib', _objLibName, _objName);

          obj = obj.getObjectByName ? obj.getObjectByName(_objName) : obj;
        } else obj = _objName ? asset.getObjectByName(_objName) : asset;

        if (!obj) {
          getLogger("warn")('Object not found', _objName);
          return;
        }
        ThreeParser.overrideObjectAttributes(obj, objData, null, params);
      });
    });
  }

  static checkGeometry(object, singleGeometryKeys) {
    if (!object.geometry) return;
    const {singleGeometries} = ThreeParser;
    singleGeometryKeys && singleGeometryKeys.some(key => {
      const isSingleGeometryObject = object.name.indexOf(key) === 0;
      if (isSingleGeometryObject) {
        if (!singleGeometries[key])
          singleGeometries[key] = object.geometry;
        else
          object.geometry = singleGeometries[key];
        object.isSingleGeometryObject = true;
      }
      return isSingleGeometryObject;
    });
  }
}
