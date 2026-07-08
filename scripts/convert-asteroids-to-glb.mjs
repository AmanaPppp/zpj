import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';

const ASTEROID_IDS = [1, 4, 8];
const MODEL_ROOT = path.join(process.cwd(), 'public', 'models', 'asteroids-pbr');
const SOURCE_MODEL_ROOT = path.join(process.cwd(), 'source-models', 'asteroids-pbr');
const TARGET_TRIANGLE_RATIO = 0.14;
const TARGET_ERROR = 0.018;

if (!globalThis.FileReader) {
  globalThis.FileReader = class NodeFileReader {
    result = null;
    onloadend = null;

    async readAsArrayBuffer(blob) {
      this.result = await blob.arrayBuffer();
      this.onloadend?.();
    }

    async readAsDataURL(blob) {
      const buffer = Buffer.from(await blob.arrayBuffer());
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
      this.onloadend?.();
    }
  };
}

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

function toUint32Index(index) {
  if (!index) {
    throw new Error('Expected indexed geometry after mergeVertices.');
  }

  return index.array instanceof Uint32Array
    ? new Uint32Array(index.array)
    : Uint32Array.from(index.array);
}

function compactAttribute(attribute, remap, vertexCount) {
  const ArrayType = attribute.array.constructor;
  const itemSize = attribute.itemSize;
  const compacted = new ArrayType(vertexCount * itemSize);

  for (let oldIndex = 0; oldIndex < remap.length; oldIndex += 1) {
    const newIndex = remap[oldIndex];
    if (newIndex === 0xffffffff) continue;

    for (let component = 0; component < itemSize; component += 1) {
      compacted[newIndex * itemSize + component] = attribute.array[oldIndex * itemSize + component];
    }
  }

  return new THREE.BufferAttribute(compacted, itemSize, attribute.normalized);
}

function simplifyGeometry(sourceGeometry) {
  let geometry = mergeVertices(sourceGeometry, 1e-5);

  if (!geometry.index) {
    const vertexCount = geometry.getAttribute('position').count;
    geometry.setIndex(Array.from({ length: vertexCount }, (_, index) => index));
  }

  const position = geometry.getAttribute('position');
  const sourceIndex = toUint32Index(geometry.index);
  const targetIndexCount = Math.max(3000, Math.floor(sourceIndex.length * TARGET_TRIANGLE_RATIO / 3) * 3);
  const [simplifiedIndex, error] = MeshoptSimplifier.simplify(
    sourceIndex,
    position.array,
    position.itemSize,
    targetIndexCount,
    TARGET_ERROR,
    ['Prune'],
  );
  const [remap, vertexCount] = MeshoptSimplifier.compactMesh(simplifiedIndex);

  const compacted = new THREE.BufferGeometry();
  compacted.setIndex(new THREE.BufferAttribute(
    vertexCount > 65535 ? simplifiedIndex : Uint16Array.from(simplifiedIndex),
    1,
  ));

  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    compacted.setAttribute(name, compactAttribute(attribute, remap, vertexCount));
  }

  compacted.computeBoundingBox();
  compacted.computeBoundingSphere();
  compacted.computeVertexNormals();

  return {
    geometry: compacted,
    error,
    sourceTriangles: sourceIndex.length / 3,
    targetTriangles: simplifiedIndex.length / 3,
    vertices: vertexCount,
  };
}

async function exportGlb(object) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(object, {
    binary: true,
    embedImages: false,
    onlyVisible: true,
    trs: false,
  });

  return Buffer.from(result);
}

async function convertAsteroid(id) {
  const asteroidDir = path.join(MODEL_ROOT, `asteroid${id}`);
  const objPath = path.join(SOURCE_MODEL_ROOT, `asteroid${id}`, 'model.obj');
  const glbPath = path.join(asteroidDir, 'model.glb');
  const objText = await fs.readFile(objPath, 'utf8');
  const parsed = new OBJLoader().parse(objText);
  const sourceGeometry = largestMeshGeometry(parsed);
  const simplified = simplifyGeometry(sourceGeometry);
  const mesh = new THREE.Mesh(
    simplified.geometry,
    new THREE.MeshStandardMaterial({
      color: '#d6d6d6',
      roughness: 0.88,
      metalness: 0.015,
    }),
  );
  mesh.name = `asteroid${id}`;

  const glb = await exportGlb(mesh);
  await fs.writeFile(glbPath, glb);

  const objSize = (await fs.stat(objPath)).size;
  const glbSize = glb.length;
  console.log(
    `asteroid${id}: ${simplified.sourceTriangles.toFixed(0)} tris -> ${simplified.targetTriangles.toFixed(0)} tris, ` +
    `${(objSize / 1024 / 1024).toFixed(2)} MB OBJ -> ${(glbSize / 1024 / 1024).toFixed(2)} MB GLB, error ${simplified.error.toFixed(4)}`,
  );
}

await MeshoptSimplifier.ready;

for (const id of ASTEROID_IDS) {
  await convertAsteroid(id);
}
