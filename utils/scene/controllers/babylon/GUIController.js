import * as GUI from 'babylonjs-gui';
import * as dat from 'dat.gui';

export default class GUIController {


  constructor() {
    this.gui = new dat.GUI();

    const texture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true);

    const panel = new GUI.StackPanel();
    panel.background = "grey";
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    texture.addControl(panel);

    this.panel = panel;
  }

  addFolder(name, folder) {
    return (folder ?? this.gui).addFolder(name);
  }

  addDOFSettings(lensEffect) {
    const folder = this.addFolder(`DOF '${lensEffect.name}'`);
    console.log(lensEffect);
    try {
      folder.add(lensEffect, "edgeBlur");
      folder.add(lensEffect, "edgeDistortion");
      folder.add(lensEffect, "highlightsThreshold");
      folder.add(lensEffect, "chromaticAberration");
      folder.add(lensEffect, "dofDistortion");
      folder.add({dofFocusDistance: 1}, "dofFocusDistance").onChange(value => lensEffect.setFocusDistance(value));
      folder.add(lensEffect, "dofAperture");
      folder.add(lensEffect, "grainAmount");
    } catch (e) {
      console.log(e);
    }

    console.log('here')
  }

  addLightSettings(light) {
    const folder = this.addFolder(`Light '${light.name}'`);


    folder
      .addColor({diffuse: light.diffuse.toHexString()}, "diffuse")
      .onChange(color => light.diffuse = BABYLON.Color3.FromHexString(color));

    folder.add(light, "intensity", 0, 1000);
  }

}
