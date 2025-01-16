export function exportGLTF(input, params) {

  const gltfExporter = new THREE.GLTFExporter();

  const options = {
    trs: params.trs,
    onlyVisible: params.onlyVisible,
    truncateDrawRange: params.truncateDrawRange,
    binary: params.binary,
    maxTextureSize: params.maxTextureSize
  };
  gltfExporter.parse(
    input,
    function (result) {

      if (result instanceof ArrayBuffer) {

        saveArrayBuffer(result, 'scene.glb');

      } else {

        const output = JSON.stringify(result, null, 2);
        console.log(output);
        saveString(output, 'scene.gltf');

      }

    },
    function (error) {

      console.log('An error happened during parsing', error);

    },
    options
  );

}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
}

function saveString(text, filename) {
  save(new Blob([text], {type: 'text/plain'}), filename);
}

function save(blob, filename) {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
