import * as THREE from 'three';

export const HERO_CAMERA = new THREE.Vector3(0, 0.42, 9.9);
export const HERO_LOOK_AT = new THREE.Vector3(-0.44, 0.98, 0);
export const REVEAL_LIGHT_POSITION = new THREE.Vector3(-10, 15, -5);
export const REVEAL_AMBIENT_INTENSITY = 0.008;
export const REVEAL_LIGHT_INTENSITY = 10.8;
export const START_EARTH_SCALE = 1.64;
export const START_EARTH_X = -0.56;
export const START_EARTH_Y = -0.38;
export const REVEAL_EARTH_SCALE = 1.28;
export const REVEAL_EARTH_X = -0.72;
export const REVEAL_EARTH_Y = 0.78;
export const HERO_EARTH_SCALE = 1.06;
export const HERO_EARTH_Y = 1.28;
export const HERO_EARTH_X = -0.28;
export const HERO_EARTH_ROT_X = -0.08;
export const HERO_EARTH_ROT_Z = -0.08;
export const START_FOV = 50;
export const HERO_FOV = 55;
export const START_CAMERA = new THREE.Vector3(-1.58, 1.02, 5.55);
export const START_LOOK_AT = new THREE.Vector3(-0.48, 1.06, 0);
export const CINEMATIC_DURATION = 4.85;

export const smoothStep = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    let t = x;
    for (let i = 0; i < 5; i += 1) {
      const dx = sampleX(t) - x;
      const derivative = sampleDerivativeX(t);
      if (Math.abs(dx) < 0.000001 || Math.abs(derivative) < 0.000001) break;
      t -= dx / derivative;
    }

    return sampleY(THREE.MathUtils.clamp(t, 0, 1));
  };
}

export const cinematicEase = cubicBezier(0.25, 0.1, 0.25, 1);

const lerpVector = (
  target: THREE.Vector3,
  start: THREE.Vector3,
  end: THREE.Vector3,
  progress: number,
) => target.copy(start).lerp(end, progress);

export function applyCinematicRevealMotion({
  progress,
  camera,
  cameraTarget,
  earthGroup,
  perspectiveCamera,
}: {
  progress: number;
  camera: THREE.Camera;
  cameraTarget: THREE.Vector3;
  earthGroup: THREE.Group;
  perspectiveCamera: THREE.PerspectiveCamera | null;
}) {
  const easedProgress = cinematicEase(progress);
  const settleProgress = smoothStep(easedProgress);

  lerpVector(camera.position, START_CAMERA, HERO_CAMERA, settleProgress);
  lerpVector(cameraTarget, START_LOOK_AT, HERO_LOOK_AT, settleProgress);
  camera.lookAt(cameraTarget);

  if (perspectiveCamera) {
    perspectiveCamera.fov = THREE.MathUtils.lerp(START_FOV, HERO_FOV, settleProgress);
    perspectiveCamera.updateProjectionMatrix();
  }

  const revealProgress = smoothStep(THREE.MathUtils.clamp(easedProgress / 0.42, 0, 1));
  earthGroup.position.x = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(START_EARTH_X, REVEAL_EARTH_X, revealProgress),
    HERO_EARTH_X,
    settleProgress,
  );
  earthGroup.position.y = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(START_EARTH_Y, REVEAL_EARTH_Y, revealProgress),
    HERO_EARTH_Y,
    settleProgress,
  );

  const scale = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(START_EARTH_SCALE, REVEAL_EARTH_SCALE, revealProgress),
    HERO_EARTH_SCALE,
    settleProgress,
  );
  earthGroup.scale.setScalar(scale);

  earthGroup.rotation.x = THREE.MathUtils.lerp(-0.18, HERO_EARTH_ROT_X, settleProgress);
  earthGroup.rotation.y = THREE.MathUtils.lerp(-0.88, -0.16, settleProgress);
  earthGroup.rotation.z = THREE.MathUtils.lerp(-0.04, HERO_EARTH_ROT_Z, settleProgress);

  return {
    easedProgress,
    cameraTarget,
  };
}
