import { Container } from '../type/container-type';

export enum CONTAINER_SIZE {
  TWENTY_FT = 'TWENTY_FT',
  FORTY_FT = 'FORTY_FT',
  FORTY_FIVE_FT = 'FORTY_FIVE_FT',
}
export enum CONTAINER_TYPE {
  STANDARD = 'STANDARD',
  HIGH_CUBE = 'HIGH_CUBE',
}
export enum UNIT_SYSTEM {
  ENGLISH = 'ENGLISH',
  METRIC = 'METRIC',
}
export enum DIMENSION_TYPE {
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
}

type ContainerTypeData = Record<
  UNIT_SYSTEM,
  Record<DIMENSION_TYPE, Container.SimpleGeometry>
>;

export const CONTAINER_SIZES: Record<
  CONTAINER_SIZE,
  Record<CONTAINER_TYPE, ContainerTypeData | null>
> = {
  [CONTAINER_SIZE.TWENTY_FT]: {
    [CONTAINER_TYPE.STANDARD]: {
      [UNIT_SYSTEM.ENGLISH]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 94, width: 92, depth: 232 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 102, width: 96, depth: 240 },
      },
      [UNIT_SYSTEM.METRIC]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 2.39, width: 2.35, depth: 5.9 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 2.59, width: 2.44, depth: 6.06 },
      },
    },
    [CONTAINER_TYPE.HIGH_CUBE]: null,
  },
  [CONTAINER_SIZE.FORTY_FT]: {
    [CONTAINER_TYPE.STANDARD]: {
      [UNIT_SYSTEM.ENGLISH]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 94, width: 92, depth: 474 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 102, width: 96, depth: 480 },
      },
      [UNIT_SYSTEM.METRIC]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 2.39, width: 2.35, depth: 12.03 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 2.59, width: 2.44, depth: 12.19 },
      },
    },
    [CONTAINER_TYPE.HIGH_CUBE]: {
      [UNIT_SYSTEM.ENGLISH]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 106, width: 92, depth: 474 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 114, width: 96, depth: 480 },
      },
      [UNIT_SYSTEM.METRIC]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 2.7, width: 2.35, depth: 12.03 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 2.9, width: 2.44, depth: 12.19 },
      },
    },
  },
  [CONTAINER_SIZE.FORTY_FIVE_FT]: {
    [CONTAINER_TYPE.STANDARD]: null,
    [CONTAINER_TYPE.HIGH_CUBE]: {
      [UNIT_SYSTEM.ENGLISH]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 106, width: 92, depth: 534 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 114, width: 96, depth: 540 },
      },
      [UNIT_SYSTEM.METRIC]: {
        [DIMENSION_TYPE.INTERIOR]: { height: 2.7, width: 2.35, depth: 13.56 },
        [DIMENSION_TYPE.EXTERIOR]: { height: 2.9, width: 2.44, depth: 13.72 },
      },
    },
  },
};

export const DefaultPresetContainer: Container.PresetGeometry = {
  dimensionType: DIMENSION_TYPE.INTERIOR,
  geometry: CONTAINER_SIZES.FORTY_FIVE_FT.HIGH_CUBE!.ENGLISH.INTERIOR,
  size: CONTAINER_SIZES.FORTY_FIVE_FT,
  type: CONTAINER_TYPE.HIGH_CUBE,
  unitSystem: UNIT_SYSTEM.ENGLISH,
};
