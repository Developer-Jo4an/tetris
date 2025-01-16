import THREE from "./threeGlobal";

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "./loaders/GLTFLoader";

import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

THREE.OrbitControls = OrbitControls;
THREE.GLTFLoader = GLTFLoader;
THREE.BufferGeometryUtils = BufferGeometryUtils;
THREE.SkeletonUtils = SkeletonUtils;

const {InteractionManager} = require('./interaction/three.interactive');
THREE.InteractionManager = InteractionManager;

export default THREE;
