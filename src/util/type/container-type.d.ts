import { Mesh } from 'three';

export module Container {
  interface ShippingContainer {
    name: string;
    width: number;
    height: number;
    depth: number;
  };

  interface Parcel {
    id: number;
    name: string;
    containerPosition: {
      x: number;
      y: number;
      z: number;
    };
    geometry: {
      width: number;
      height: number;
      depth: number;
      color?: string;
      mesh?: Mesh;
    };
  };
}
