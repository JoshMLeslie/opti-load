import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';

export module Container {
  interface SimpleGeometry {
    width: number;
    height: number;
    depth: number;
  }
  interface MeshedGeometry extends SimpleGeometry {
    color?: string;
    mesh?: Mesh<BoxGeometry, MeshLambertMaterial>;
  }

  interface ContainerDatum {
    id: number;
    name: string;
    containerPosition: {
      x: number;
      y: number;
      z: number;
    };
    geometry: MeshedGeometry;
    children?: ContainerDatum[];
  }
}
