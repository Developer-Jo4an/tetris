import THREE from "./threeGlobal";

const {InteractionManager} = require('./interaction/three.interactive');
THREE.InteractionManager = InteractionManager;

require('three/examples/js/controls/OrbitControls');
//require('three/examples/js/exporters/GLTFExporter');
require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/utils/BufferGeometryUtils');

export default THREE;
