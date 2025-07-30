import { Container } from "ol/util/type/container-type";
import { v4 } from "uuid";

export const DefaultParcel: Container.ContainerDatum = {
  id: 0,
  name: v4(),
  position: { x: 0, y: 1, z: 0 },
  geometry: { width: 2, height: 2, depth: 2, color: '#0167d3' },
};
