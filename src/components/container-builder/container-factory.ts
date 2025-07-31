import {
	CONTAINER_SIZE,
	CONTAINER_SIZES,
	CONTAINER_TYPE,
	DIMENSION_TYPE,
	UNIT_SYSTEM,
} from 'ol/util/const/container-sizes';
import { Container } from 'ol/util/type/container-type';
import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';

type PresetDimensions = {
  size: CONTAINER_SIZE;
  type: CONTAINER_TYPE;
  unit: UNIT_SYSTEM;
  dimension: DIMENSION_TYPE;
};

interface ContainerInput {
  name: string;
  position: { x: number; y: number; z: number };
  id?: number;
  preset_geometry?: PresetDimensions;
  custom_geometry?: Container.MeshedGeometry;
  color?: string;
  mesh?: Mesh<BoxGeometry, MeshLambertMaterial>;
  children?: Container.ContainerDatum[];
}

export const containerFactory = (
  input: ContainerInput
): Container.ContainerDatum => {
  const { name, position, color, children = [] } = input;
  const id = input.id || Date.now();

  let dims: Container.SimpleGeometry | null | undefined;
  if (input.preset_geometry) {
    const preset = input.preset_geometry;
    dims =
      CONTAINER_SIZES[preset.size][preset.type]?.[preset.unit][
        preset.dimension
      ];
  } else if (input.custom_geometry) {
    dims = input.custom_geometry;
  }

  if (!dims) {
    throw new Error(
      'Container requires valid dims.' +
        (input?.preset_geometry
          ? ' Bad preset: ' + input.preset_geometry?.type
          : '')
    );
  }

  let useMesh = input.mesh;
  if (!input.mesh && color) {
    const boxGeometry = new BoxGeometry(dims.width, dims.height, dims.depth);
    const material = new MeshLambertMaterial({ color });
    useMesh = new Mesh(boxGeometry, material);
  }

  const geometry = new ReactiveGeometry(dims, color, useMesh);

  return {
    id,
    name,
    position,
    geometry,
    ...(children.length > 0 && { children }),
  };
};

export class ReactiveGeometry implements Container.MeshedGeometry {
  private _width: number;
  private _height: number;
  private _depth: number;
  private _color?: string;
  private _boxGeometry?: BoxGeometry;
  private _material?: MeshLambertMaterial;
  private _mesh?: Mesh<BoxGeometry, MeshLambertMaterial>;

  constructor(
    dims: Container.SimpleGeometry,
    color?: string,
    mesh?: Mesh<BoxGeometry, MeshLambertMaterial>
  ) {
    this._width = dims.width;
    this._height = dims.height;
    this._depth = dims.depth;
    this._color = color;
    if (mesh) {
      this._mesh = mesh;
    } else if (color) {
      this._mesh = this._generateMesh();
    }
  }

  updateSize({
    height,
    width,
    depth,
  }: Partial<Container.SimpleGeometry>): ReactiveGeometry {
    if (height) {
      this._height = height;
    }
    if (width) {
      this._width = width;
    }
    if (depth) {
      this._depth = depth;
    }
    this._updateMesh();
    return this;
  }

  updateColorByHex(code: string) {
    this.mesh?.material.color.setHex(parseInt(code.replace('#', '0x')));
  }

  dispose() {
    this.mesh?.geometry.dispose();
    this.mesh?.material.dispose();
  }

  get width() {
    return this._width;
  }
  set width(val: number) {
    console.log(val);
    this._width = val;
    this._updateMesh();
  }

  get height() {
    return this._height;
  }
  set height(val: number) {
    this._height = val;
    this._updateMesh();
  }

  get depth() {
    return this._depth;
  }
  set depth(val: number) {
    this._depth = val;
    this._updateMesh();
  }

  get color() {
    return this._color;
  }
  set color(val: string | undefined) {
    this._color = val;
    this._material = undefined;
    this._updateMesh();
  }

  get mesh() {
    return this._mesh;
  }

  private _updateMesh() {
    if (!this._color) return;
    this._mesh = this._generateMesh();
  }

  private _generateMesh(): Mesh<BoxGeometry, MeshLambertMaterial> | undefined {
    if (!this._boxGeometry) {
      this._boxGeometry = new BoxGeometry(
        this._width,
        this._height,
        this._depth
      );
    }

    const renderedSize = this._boxGeometry.parameters;
    if (
      renderedSize &&
      (renderedSize.width !== this._width ||
        renderedSize.height !== this._height ||
        renderedSize.depth !== this._depth)
    ) {
      this._boxGeometry.dispose();
      this._boxGeometry = new BoxGeometry(
        this._width,
        this._height,
        this._depth
      );
    }

    if (!this._material && this._color) {
      this._material = new MeshLambertMaterial({ color: this._color });
    }

    if (this._boxGeometry && this._material) {
      return new Mesh(this._boxGeometry, this._material);
    }
    return undefined;
  }

  toMeshedGeometry(): Container.MeshedGeometry {
    return {
      width: this._width,
      height: this._height,
      depth: this._depth,
      color: this._color,
      mesh: this._mesh,
    };
  }
}
