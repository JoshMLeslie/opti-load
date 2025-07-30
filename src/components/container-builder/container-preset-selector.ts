import { CommonModule } from '@angular/common';
import {
	Component,
	computed,
	effect,
	output,
	signal,
	untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	CONTAINER_SIZE,
	CONTAINER_SIZES,
	CONTAINER_TYPE,
	DIMENSION_TYPE,
	UNIT_SYSTEM,
} from 'ol/util/const/container-sizes';
import { Container } from 'ol/util/type/container-type';

@Component({
  selector: 'ol-container-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './container-preset-selector.html',
  styleUrl: './container-preset-selector.scss',
  styles: `
	:host{
		width: 100%;
	}`,
})
export class ContainerPresetSelector {
  // Selection signals
  selectedSize = signal<CONTAINER_SIZE | null>(null);
  selectedType = signal<CONTAINER_TYPE | null>(null);
  selectedUnitSystem = signal<UNIT_SYSTEM | null>(null);
  selectedDimensionType = signal<DIMENSION_TYPE | null>(null);

  // Available options computed signals
  availableSizes = computed(() => Object.values(CONTAINER_SIZE));

  availableTypes = computed(() => {
    const size = this.selectedSize();
    if (!size) return [];
    return Object.entries(CONTAINER_SIZES[size])
      .filter(([_, data]) => data !== null)
      .map(([type]) => type as CONTAINER_TYPE);
  });

  availableUnitSystems = computed(() => {
    const size = this.selectedSize();
    const type = this.selectedType();
    if (!size || !type || !CONTAINER_SIZES[size][type]) return [];
    return Object.keys(CONTAINER_SIZES[size][type]!) as UNIT_SYSTEM[];
  });

  availableDimensionTypes = computed(() => {
    const size = this.selectedSize();
    const type = this.selectedType();
    const unitSystem = this.selectedUnitSystem();
    if (!size || !type || !unitSystem) return [];
    const data = CONTAINER_SIZES[size][type];
    return data ? (Object.keys(data[unitSystem]) as DIMENSION_TYPE[]) : [];
  });

  selectedDimensions = computed(() => {
    const size = this.selectedSize();
    const type = this.selectedType();
    const unitSystem = this.selectedUnitSystem();
    const dimensionType = this.selectedDimensionType();

    if (!size || !type || !unitSystem || !dimensionType) return null;
    return CONTAINER_SIZES[size][type]?.[unitSystem]?.[dimensionType] || null;
  });

  onDimensionChange = output<Container.PresetGeometry>();

  constructor() {
    effect(() => {
      this.onSizeChange(this.selectedSize());
    });

    effect(() => {
      this.onTypeChange(this.selectedType());
    });

    effect(() => {
      this.onUnitSystemChange(this.selectedUnitSystem());
    });

    effect(() => {
      this.onDimensionTypeChange(this.selectedDimensionType());
    });

    effect(() => {
      const geometry = this.selectedDimensions();
      if (!geometry) return;

      const size = untracked(this.selectedSize);
      const type = untracked(this.selectedType);
      const unitSystem = untracked(this.selectedUnitSystem);
      const dimensionType = untracked(this.selectedDimensionType);

      if (!size || !type || !unitSystem || !dimensionType) {
        return;
      }
      this.onDimensionChange.emit({
        size,
        type,
        unitSystem,
        dimensionType,
        geometry,
      });
    });
  }

  // Selection handlers that reset dependent selections
  onSizeChange(size: CONTAINER_SIZE | null) {
    this.selectedSize.set(size);
    this.selectedType.set(null);
    this.selectedUnitSystem.set(null);
    this.selectedDimensionType.set(null);
  }

  onTypeChange(type: CONTAINER_TYPE | null) {
    this.selectedType.set(type);
    this.selectedUnitSystem.set(null);
    this.selectedDimensionType.set(null);
  }

  onUnitSystemChange(unitSystem: UNIT_SYSTEM | null) {
    this.selectedUnitSystem.set(unitSystem);
    this.selectedDimensionType.set(null);
  }

  onDimensionTypeChange(dimensionType: DIMENSION_TYPE | null) {
    this.selectedDimensionType.set(dimensionType);
  }

  // Helper methods for display
  formatSize(size: CONTAINER_SIZE): string {
    const sizeMap = {
      [CONTAINER_SIZE.TWENTY_FT]: '20ft',
      [CONTAINER_SIZE.FORTY_FT]: '40ft',
      [CONTAINER_SIZE.FORTY_FIVE_FT]: '45ft',
    };
    return sizeMap[size];
  }

  formatType(type: CONTAINER_TYPE): string {
    const typeMap = {
      [CONTAINER_TYPE.STANDARD]: 'Standard',
      [CONTAINER_TYPE.HIGH_CUBE]: 'High Cube',
    };
    return typeMap[type];
  }

  formatUnitSystem(unitSystem: UNIT_SYSTEM): string {
    const unitMap = {
      [UNIT_SYSTEM.ENGLISH]: 'Imperial (inches)',
      [UNIT_SYSTEM.METRIC]: 'Metric (meters)',
    };
    return unitMap[unitSystem];
  }

  formatDimensionType(dimensionType: DIMENSION_TYPE): string {
    const dimensionMap = {
      [DIMENSION_TYPE.INTERIOR]: 'Interior',
      [DIMENSION_TYPE.EXTERIOR]: 'Exterior',
    };
    return dimensionMap[dimensionType];
  }
}
