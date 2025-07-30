import { ReactiveGeometry } from 'ol/components/container-builder/container-factory';
import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';

export module Container {
  type ContainerMesh = Mesh<BoxGeometry, MeshLambertMaterial>;
  interface SimpleGeometry {
    width: number;
    height: number;
    depth: number;
  }
  interface MeshedGeometry extends SimpleGeometry {
    color?: string;
    mesh?: ContainerMesh;
  }

  interface ContainerDatum {
    id: number;
    name: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    geometry: ReactiveGeometry;
    children?: ContainerDatum[];
  }
}
