import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const require = createRequire(import.meta.url);
const draco3d = require('draco3d');

const ASTEROID_IDS = [1, 4, 8];
const MODEL_ROOT = path.join(process.cwd(), 'public', 'models', 'asteroids-pbr');
const SOURCE_MODEL_ROOT = path.join(process.cwd(), 'source-models', 'asteroids-pbr');

function largestMeshGeometry(object) {
  let selected = null;
  let largestVolume = -Infinity;

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return;

    child.geometry.computeBoundingBox();
    const box = child.geometry.boundingBox;
    if (!box) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (volume > largestVolume) {
      largestVolume = volume;
      selected = child.geometry;
    }
  });

  if (!selected) {
    throw new Error('No mesh geometry found in OBJ.');
  }

  const geometry = selected.clone();
  geometry.computeVertexNormals();
  return geometry;
}

function attributeArray(geometry, name, fallbackItemSize) {
  const attribute = geometry.getAttribute(name);
  if (attribute) return attribute;

  const position = geometry.getAttribute('position');
  return new THREE.BufferAttribute(new Float32Array(position.count * fallbackItemSize), fallbackItemSize);
}

function encodeGeometryToDraco(encoderModule, geometry) {
  const position = geometry.getAttribute('position');
  if (!position) throw new Error('Geometry has no position attribute.');

  const normal = attributeArray(geometry, 'normal', 3);
  const uv = attributeArray(geometry, 'uv', 2);
  const vertexCount = position.count;
  const faceCount = Math.floor(vertexCount / 3);
  const indices = new Uint32Array(faceCount * 3);

  for (let index = 0; index < indices.length; index += 1) {
    indices[index] = index;
  }

  const meshBuilder = new encoderModule.MeshBuilder();
  const mesh = new encoderModule.Mesh();
  meshBuilder.AddFacesToMesh(mesh, faceCount, indices);
  meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.POSITION, vertexCount, 3, position.array);
  meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.NORMAL, vertexCount, 3, normal.array);
  meshBuilder.AddFloatAttributeToMesh(mesh, encoderModule.TEX_COORD, vertexCount, 2, uv.array);

  const encoder = new encoderModule.Encoder();
  encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);
  encoder.SetSpeedOptions(5, 5);
  encoder.SetAttributeQuantization(encoderModule.POSITION, 11);
  encoder.SetAttributeQuantization(encoderModule.NORMAL, 8);
  encoder.SetAttributeQuantization(encoderModule.TEX_COORD, 10);

  const encodedData = new encoderModule.DracoInt8Array();
  const encodedLength = encoder.EncodeMeshToDracoBuffer(mesh, encodedData);

  if (encodedLength <= 0) {
    throw new Error('Draco encoding failed.');
  }

  const output = Buffer.alloc(encodedLength);
  for (let index = 0; index < encodedLength; index += 1) {
    output[index] = encodedData.GetValue(index);
  }

  encoderModule.destroy(encodedData);
  encoderModule.destroy(encoder);
  encoderModule.destroy(mesh);
  encoderModule.destroy(meshBuilder);

  return output;
}

async function convertAsteroid(encoderModule, id) {
  const asteroidDir = path.join(MODEL_ROOT, `asteroid${id}`);
  const objPath = path.join(SOURCE_MODEL_ROOT, `asteroid${id}`, 'model.obj');
  const drcPath = path.join(asteroidDir, 'model.drc');
  const objText = await fs.readFile(objPath, 'utf8');
  const parsed = new OBJLoader().parse(objText);
  const geometry = largestMeshGeometry(parsed);
  const drc = encodeGeometryToDraco(encoderModule, geometry);

  await fs.writeFile(drcPath, drc);

  const objSize = (await fs.stat(objPath)).size;
  const triangleCount = geometry.getAttribute('position').count / 3;
  console.log(
    `asteroid${id}: ${triangleCount.toFixed(0)} tris, ` +
    `${(objSize / 1024 / 1024).toFixed(2)} MB OBJ -> ${(drc.length / 1024 / 1024).toFixed(2)} MB DRC`,
  );
}

const encoderModule = await draco3d.createEncoderModule({});

for (const id of ASTEROID_IDS) {
  await convertAsteroid(encoderModule, id);
}
