import { ThreeElements } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElements['mesh'] & {
      ref?: React.Ref<MeshLineGeometry>;
      points?: THREE.Vector3[];
    };
    meshLineMaterial: ThreeElements['meshStandardMaterial'] & {
      ref?: React.Ref<MeshLineMaterial>;
      lineWidth?: number;
      map?: THREE.Texture;
      useMap?: number;
      repeat?: [number, number];
      resolution?: [number, number];
      color?: string;
      depthTest?: boolean;
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

export {};
