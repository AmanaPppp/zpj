import * as THREE from 'three';

/**
 * Create a procedural 3D card model (replaces card.glb)
 * Returns a THREE.Group with card mesh, clip, and clamp
 */
export function createProceduralCard(): THREE.Group {
  const group = new THREE.Group();

  // Main card body
  const cardGeo = new THREE.BoxGeometry(1.6, 2.25, 0.02);
  const cardMesh = new THREE.Mesh(cardGeo);
  cardMesh.name = 'card';
  group.add(cardMesh);

  // Metal clip (top center)
  const clipGeo = new THREE.BoxGeometry(0.3, 0.15, 0.04);
  const clipMesh = new THREE.Mesh(clipGeo);
  clipMesh.name = 'clip';
  clipMesh.position.set(0, 1.2, 0.02);
  group.add(clipMesh);

  // Metal clamp (ring)
  const clampGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
  const clampMesh = new THREE.Mesh(clampGeo);
  clampMesh.name = 'clamp';
  clampMesh.position.set(0, 1.35, 0.02);
  group.add(clampMesh);

  return group;
}

/**
 * Create a procedural lanyard rope texture (replaces lanyard.png)
 */
export function createLanyardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base - dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, 64, 512);

  // Vertical stripe pattern (braided rope look)
  const gradient = ctx.createLinearGradient(0, 0, 64, 0);
  gradient.addColorStop(0, '#2a2a4e');
  gradient.addColorStop(0.2, '#3a3a5e');
  gradient.addColorStop(0.4, '#4a4a6e');
  gradient.addColorStop(0.5, '#5a5a7e');
  gradient.addColorStop(0.6, '#4a4a6e');
  gradient.addColorStop(0.8, '#3a3a5e');
  gradient.addColorStop(1, '#2a2a4e');
  ctx.fillStyle = gradient;
  ctx.fillRect(4, 0, 56, 512);

  // Horizontal thread lines
  ctx.strokeStyle = 'rgba(100, 100, 140, 0.3)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(4, y);
    ctx.lineTo(60, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
