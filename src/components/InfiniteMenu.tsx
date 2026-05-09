import { useEffect, useRef, useState } from 'react';
import { Matrix4, Quaternion, Vector2, Vector3 } from 'three';
import './InfiniteMenu.css';

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;

    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;

    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

export interface InfiniteMenuItem {
  image: string;
  link?: string;
  title: string;
  description: string;
}

interface InfiniteMenuProps {
  items?: InfiniteMenuItem[];
  scale?: number;
}

class Face {
  a: number;
  b: number;
  c: number;

  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Vertex {
  position: Vector3;
  normal = new Vector3();
  uv = new Vector2();

  constructor(x: number, y: number, z: number) {
    this.position = new Vector3(x, y, z);
  }
}

class Geometry {
  vertices: Vertex[] = [];
  faces: Face[] = [];

  addVertex(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    const midPointCache: Record<string, number> = {};
    let faces = this.faces;

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array<Face>(faces.length * 4);

      faces.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);
        const i = ndx * 4;
        newFaces[i] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });

      faces = newFaces;
    }

    this.faces = faces;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach((vertex) => {
      vertex.normal.copy(vertex.position).normalize();
      vertex.position.copy(vertex.normal).multiplyScalar(radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: new Float32Array(this.vertices.flatMap((v) => v.position.toArray())),
      indices: new Uint16Array(this.faces.flatMap((f) => [f.a, f.b, f.c])),
      uvs: new Float32Array(this.vertices.flatMap((v) => v.uv.toArray())),
    };
  }

  getMidPoint(ndxA: number, ndxB: number, cache: Record<string, number>) {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) return cache[cacheKey];

    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[cacheKey] = ndx;
    this.addVertex((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, (a.z + b.z) * 0.5);
    return ndx;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
      0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
      t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
    ).addFace(
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    const safeSteps = Math.max(4, steps);
    const alpha = (2 * Math.PI) / safeSteps;

    this.addVertex(0, 0, 0);
    this.lastVertex.uv.set(0.5, 0.5);

    for (let i = 0; i < safeSteps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv.set(x * 0.5 + 0.5, y * 0.5 + 0.5);
      if (i > 0) this.addFace(0, i, i + 1);
    }
    this.addFace(0, safeSteps, 1);
  }
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext, shaderSources: [string, string], attribLocations: Record<string, number>) {
  const program = gl.createProgram();
  if (!program) return null;

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx]);
    if (shader) gl.attachShader(program, shader);
  });

  Object.entries(attribLocations).forEach(([attrib, loc]) => gl.bindAttribLocation(program, loc, attrib));
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: ArrayBufferView | ArrayBuffer | number, usage: number) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  if (typeof sizeOrData === 'number') {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData as AllowSharedBufferSource, usage);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function makeVertexArray(
  gl: WebGL2RenderingContext,
  bufLocNumElmPairs: Array<[WebGLBuffer | null, number, number]>,
  indices: Uint16Array
) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);

  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1 || !buffer) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return va;
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio);
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
}

function createAndSetupTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  return texture;
}

function targetToMatrix(eye: Vector3, target: Vector3, up: Vector3) {
  const z = eye.clone().sub(target).normalize();
  const x = up.clone().cross(z).normalize();
  const y = z.clone().cross(x).normalize();
  const e = new Matrix4().elements;
  e[0] = x.x; e[4] = y.x; e[8] = z.x; e[12] = eye.x;
  e[1] = x.y; e[5] = y.y; e[9] = z.y; e[13] = eye.y;
  e[2] = x.z; e[6] = y.z; e[10] = z.z; e[14] = eye.z;
  e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
  const out = new Matrix4();
  out.fromArray(e);
  return out;
}

class ArcballControl {
  isPointerDown = false;
  orientation = new Quaternion();
  pointerRotation = new Quaternion();
  rotationVelocity = 0;
  rotationAxis = new Vector3(1, 0, 0);
  snapDirection = new Vector3(0, 0, -1);
  snapTargetDirection: Vector3 | null = null;

  private readonly epsilon = 0.1;
  private readonly identityQuat = new Quaternion();
  private pointerPos = new Vector2();
  private previousPointerPos = new Vector2();
  private combinedQuat = new Quaternion();
  private internalRotationVelocity = 0;
  private canvas: HTMLCanvasElement;
  private updateCallback: (deltaTime: number) => void;

  constructor(canvas: HTMLCanvasElement, updateCallback: (deltaTime: number) => void) {
    this.canvas = canvas;
    this.updateCallback = updateCallback;
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointerleave', this.handlePointerUp);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.style.touchAction = 'none';
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointerleave', this.handlePointerUp);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.pointerPos.set(e.clientX, e.clientY);
    this.previousPointerPos.copy(this.pointerPos);
    this.isPointerDown = true;
  };

  private handlePointerUp = () => {
    this.isPointerDown = false;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (this.isPointerDown) this.pointerPos.set(e.clientX, e.clientY);
  };

  update(deltaTime: number, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    const snapRotation = new Quaternion();

    if (this.isPointerDown) {
      const intensity = 0.3 * timeScale;
      const angleAmplification = 5 / timeScale;
      const midPointerPos = this.pointerPos.clone().sub(this.previousPointerPos).multiplyScalar(intensity);

      if (midPointerPos.lengthSq() > this.epsilon) {
        midPointerPos.add(this.previousPointerPos);
        const p = this.project(midPointerPos).normalize();
        const q = this.project(this.previousPointerPos).normalize();
        this.previousPointerPos.copy(midPointerPos);
        angleFactor *= angleAmplification;
        this.quatFromVectors(p, q, this.pointerRotation, angleFactor);
      } else {
        this.pointerRotation.slerp(this.identityQuat, intensity);
      }
    } else {
      const intensity = 0.1 * timeScale;
      this.pointerRotation.slerp(this.identityQuat, intensity);

      if (this.snapTargetDirection) {
        const sqrDist = this.snapTargetDirection.distanceToSquared(this.snapDirection);
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= 0.2 * distanceFactor;
        this.quatFromVectors(this.snapTargetDirection, this.snapDirection, snapRotation, angleFactor);
      }
    }

    const combined = snapRotation.clone().multiply(this.pointerRotation);
    this.orientation.premultiply(combined).normalize();
    this.combinedQuat.slerp(combined, 0.8 * timeScale).normalize();

    const rad = Math.acos(Math.max(-1, Math.min(1, this.combinedQuat.w))) * 2;
    const s = Math.sin(rad / 2);
    let rv = 0;
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI);
      this.rotationAxis.set(this.combinedQuat.x / s, this.combinedQuat.y / s, this.combinedQuat.z / s);
    }

    this.internalRotationVelocity += (rv - this.internalRotationVelocity) * 0.5 * timeScale;
    this.rotationVelocity = this.internalRotationVelocity / timeScale;
    this.updateCallback(deltaTime);
  }

  private quatFromVectors(a: Vector3, b: Vector3, out: Quaternion, angleFactor = 1) {
    const axis = a.clone().cross(b).normalize();
    const d = Math.max(-1, Math.min(1, a.dot(b)));
    const angle = Math.acos(d) * angleFactor;
    out.setFromAxisAngle(axis, angle);
  }

  private project(pos: Vector2) {
    const r = 2;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const s = Math.max(w, h) - 1;
    const x = (2 * pos.x - w - 1) / s;
    const y = (2 * pos.y - h - 1) / s;
    const xySq = x * x + y * y;
    const rSq = r * r;
    const z = xySq <= rSq / 2 ? Math.sqrt(rSq - xySq) : rSq / Math.sqrt(xySq);
    return new Vector3(-x, y, z);
  }
}

class InfiniteGridMenu {
  private readonly targetFrameDuration = 1000 / 60;
  private readonly sphereRadius = 2;
  private time = 0;
  private deltaTime = 0;
  private frames = 0;
  private gl: WebGL2RenderingContext;
  private discProgram: WebGLProgram;
  private discLocations: Record<string, WebGLUniformLocation | number | null>;
  private discBuffers: { vertices: Float32Array; indices: Uint16Array; uvs: Float32Array };
  private discVAO: WebGLVertexArrayObject | null;
  private discInstances: { matricesArray: Float32Array; matrices: Float32Array[]; buffer: WebGLBuffer | null };
  private instancePositions: Vector3[];
  private discInstanceCount: number;
  private worldMatrix = new Matrix4();
  private tex: WebGLTexture | null;
  private control: ArcballControl;
  private smoothRotationVelocity = 0;
  private movementActive = false;
  private animationFrame = 0;
  private atlasSize = 1;
  private canvas: HTMLCanvasElement;
  private items: InfiniteMenuItem[];
  private onActiveItemChange: (index: number) => void;
  private onMovementChange: (moving: boolean) => void;
  private scaleFactor: number;

  private camera = {
    near: 0.1,
    far: 40,
    fov: Math.PI / 4,
    aspect: 1,
    position: new Vector3(0, 0, 3),
    up: new Vector3(0, 1, 0),
    matrices: {
      view: new Matrix4(),
      projection: new Matrix4(),
      inversProjection: new Matrix4(),
    },
  };

  constructor(
    canvas: HTMLCanvasElement,
    items: InfiniteMenuItem[],
    onActiveItemChange: (index: number) => void,
    onMovementChange: (moving: boolean) => void,
    onInit: ((sketch: InfiniteGridMenu) => void) | null = null,
    scaleFactor = 1
  ) {
    this.canvas = canvas;
    this.items = items;
    this.onActiveItemChange = onActiveItemChange;
    this.onMovementChange = onMovementChange;
    this.scaleFactor = scaleFactor;
    this.camera.position.z = 3 * scaleFactor;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!gl) throw new Error('No WebGL 2 context');
    this.gl = gl;

    const program = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
      aModelPosition: 0,
      aModelNormal: 1,
      aModelUvs: 2,
      aInstanceMatrix: 3,
    });
    if (!program) throw new Error('Unable to create InfiniteMenu shader program');
    this.discProgram = program;

    this.discLocations = {
      aModelPosition: gl.getAttribLocation(program, 'aModelPosition'),
      aModelUvs: gl.getAttribLocation(program, 'aModelUvs'),
      aInstanceMatrix: gl.getAttribLocation(program, 'aInstanceMatrix'),
      uWorldMatrix: gl.getUniformLocation(program, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uCameraPosition: gl.getUniformLocation(program, 'uCameraPosition'),
      uRotationAxisVelocity: gl.getUniformLocation(program, 'uRotationAxisVelocity'),
      uTex: gl.getUniformLocation(program, 'uTex'),
      uFrames: gl.getUniformLocation(program, 'uFrames'),
      uItemCount: gl.getUniformLocation(program, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(program, 'uAtlasSize'),
    };

    const discGeo = new DiscGeometry(56, 1);
    this.discBuffers = discGeo.data;
    this.discVAO = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition as number, 3],
        [makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW), this.discLocations.aModelUvs as number, 2],
      ],
      this.discBuffers.indices
    );

    const icoGeo = new IcosahedronGeometry();
    icoGeo.subdivide(1).spherize(this.sphereRadius);
    this.instancePositions = icoGeo.vertices.map((v) => v.position.clone());
    this.discInstanceCount = this.instancePositions.length;
    this.discInstances = this.initDiscInstances(this.discInstanceCount);
    this.tex = this.initTexture();
    this.control = new ArcballControl(this.canvas, (deltaTime) => this.onControlUpdate(deltaTime));

    this.updateCameraMatrix();
    this.updateProjectionMatrix();
    this.resize();
    if (onInit) onInit(this);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    this.control.destroy();
  }

  resize() {
    const needsResize = resizeCanvasToDisplaySize(this.canvas);
    if (needsResize) this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.updateProjectionMatrix();
  }

  run = (time = 0) => {
    this.deltaTime = Math.min(32, time - this.time);
    this.time = time;
    this.frames += this.deltaTime / this.targetFrameDuration;
    this.animate(this.deltaTime);
    this.render();
    this.animationFrame = requestAnimationFrame(this.run);
  };

  private initTexture() {
    const gl = this.gl;
    const tex = createAndSetupTexture(gl);
    const itemCount = Math.max(1, this.items.length);
    this.atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 512;
    canvas.width = this.atlasSize * cellSize;
    canvas.height = this.atlasSize * cellSize;

    if (ctx) {
      Promise.all(
        this.items.map(
          (item) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.src = item.image;
            })
        )
      ).then((images) => {
        images.forEach((img, i) => {
          const x = (i % this.atlasSize) * cellSize;
          const y = Math.floor(i / this.atlasSize) * cellSize;
          ctx.drawImage(img, x, y, cellSize, cellSize);
        });
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
      });
    }

    return tex;
  }

  private initDiscInstances(count: number) {
    const gl = this.gl;
    const instances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [] as Float32Array[],
      buffer: gl.createBuffer(),
    };

    for (let i = 0; i < count; ++i) {
      const instanceMatrixArray = new Float32Array(instances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(new Matrix4().elements);
      instances.matrices.push(instanceMatrixArray);
    }

    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, instances.matricesArray.byteLength, gl.DYNAMIC_DRAW);

    const baseLoc = this.discLocations.aInstanceMatrix as number;
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < 4; ++j) {
      const loc = baseLoc + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return instances;
  }

  private animate(deltaTime: number) {
    this.control.update(deltaTime, this.targetFrameDuration);
    const positions = this.instancePositions.map((p) => p.clone().applyQuaternion(this.control.orientation));
    const scale = 0.25;
    const scaleIntensity = 0.6;

    positions.forEach((p, ndx) => {
      const s = (Math.abs(p.z) / this.sphereRadius) * scaleIntensity + (1 - scaleIntensity);
      const finalScale = s * scale;
      const matrix = new Matrix4()
        .multiply(new Matrix4().makeTranslation(-p.x, -p.y, -p.z))
        .multiply(targetToMatrix(new Vector3(0, 0, 0), p, new Vector3(0, 1, 0)))
        .multiply(new Matrix4().makeScale(finalScale, finalScale, finalScale))
        .multiply(new Matrix4().makeTranslation(0, 0, -this.sphereRadius));
      this.discInstances.matrices[ndx].set(matrix.elements);
    });

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.discInstances.buffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.smoothRotationVelocity = this.control.rotationVelocity;
  }

  private render() {
    const gl = this.gl;
    gl.useProgram(this.discProgram);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix as WebGLUniformLocation, false, this.worldMatrix.elements);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix as WebGLUniformLocation, false, this.camera.matrices.view.elements);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix as WebGLUniformLocation, false, this.camera.matrices.projection.elements);
    gl.uniform3f(this.discLocations.uCameraPosition as WebGLUniformLocation, this.camera.position.x, this.camera.position.y, this.camera.position.z);
    gl.uniform4f(
      this.discLocations.uRotationAxisVelocity as WebGLUniformLocation,
      this.control.rotationAxis.x,
      this.control.rotationAxis.y,
      this.control.rotationAxis.z,
      this.smoothRotationVelocity * 1.1
    );
    gl.uniform1i(this.discLocations.uItemCount as WebGLUniformLocation, Math.max(1, this.items.length));
    gl.uniform1i(this.discLocations.uAtlasSize as WebGLUniformLocation, this.atlasSize);
    gl.uniform1f(this.discLocations.uFrames as WebGLUniformLocation, this.frames);
    gl.uniform1i(this.discLocations.uTex as WebGLUniformLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);

    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.discInstanceCount);
  }

  private updateCameraMatrix() {
    const matrix = targetToMatrix(this.camera.position, new Vector3(0, 0, 0), this.camera.up);
    this.camera.matrices.view.copy(matrix).invert();
  }

  private updateProjectionMatrix() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight || 1;
    const height = this.sphereRadius * 0.35;
    const distance = this.camera.position.z;
    this.camera.fov = this.camera.aspect > 1 ? 2 * Math.atan(height / distance) : 2 * Math.atan(height / this.camera.aspect / distance);
    this.camera.matrices.projection.makePerspective(
      -this.camera.near * Math.tan(this.camera.fov / 2) * this.camera.aspect,
      this.camera.near * Math.tan(this.camera.fov / 2) * this.camera.aspect,
      this.camera.near * Math.tan(this.camera.fov / 2),
      -this.camera.near * Math.tan(this.camera.fov / 2),
      this.camera.near,
      this.camera.far
    );
    this.camera.matrices.inversProjection.copy(this.camera.matrices.projection).invert();
  }

  private onControlUpdate(deltaTime: number) {
    const timeScale = deltaTime / this.targetFrameDuration + 0.0001;
    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;
    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;

    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving;
      this.onMovementChange(isMoving);
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.findNearestVertexIndex();
      this.onActiveItemChange(nearestVertexIndex % Math.max(1, this.items.length));
      this.control.snapTargetDirection = this.getVertexWorldPosition(nearestVertexIndex).normalize();
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
      damping = 7 / timeScale;
    }

    this.camera.position.z += (cameraTargetZ - this.camera.position.z) / damping;
    this.updateCameraMatrix();
  }

  private findNearestVertexIndex() {
    const inversOrientation = this.control.orientation.clone().conjugate();
    const nt = this.control.snapDirection.clone().applyQuaternion(inversOrientation);
    let maxD = -1;
    let nearestVertexIndex = 0;
    for (let i = 0; i < this.instancePositions.length; ++i) {
      const d = nt.dot(this.instancePositions[i]);
      if (d > maxD) {
        maxD = d;
        nearestVertexIndex = i;
      }
    }
    return nearestVertexIndex;
  }

  private getVertexWorldPosition(index: number) {
    return this.instancePositions[index].clone().applyQuaternion(this.control.orientation);
  }
}

const defaultItems: InfiniteMenuItem[] = [
  {
    image: '/avatar1.png',
    link: '#',
    title: '',
    description: '',
  },
];

export default function InfiniteMenu({ items = [], scale = 1.0 }: InfiniteMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeItem, setActiveItem] = useState<InfiniteMenuItem | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const safeItems = items.length ? items : defaultItems;
    const sketch = new InfiniteGridMenu(
      canvas,
      safeItems,
      (index) => setActiveItem(safeItems[index % safeItems.length]),
      setIsMoving,
      (sk) => sk.run(),
      scale
    );

    const handleResize = () => sketch.resize();
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      sketch.destroy();
    };
  }, [items, scale]);

  const handleButtonClick = () => {
    if (!activeItem?.link) return;
    if (activeItem.link.startsWith('http')) window.open(activeItem.link, '_blank');
  };

  return (
    <div className="infinite-menu">
      <canvas id="infinite-grid-menu-canvas" ref={canvasRef} aria-label="InfiniteMenu 3D 无限菜单" />

      {activeItem && (
        <>
          <h2 className={`face-title ${isMoving ? 'inactive' : 'active'}`}>{activeItem.title}</h2>
          <p className={`face-description ${isMoving ? 'inactive' : 'active'}`}>{activeItem.description}</p>
          <button type="button" onClick={handleButtonClick} className={`action-button ${isMoving ? 'inactive' : 'active'}`} aria-label={`Open ${activeItem.title}`}>
            <span className="action-button-icon">↗</span>
          </button>
        </>
      )}
    </div>
  );
}
