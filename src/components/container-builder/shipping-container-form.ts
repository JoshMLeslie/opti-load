import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	CONTAINER_SIZES,
	DefaultPresetContainer,
} from 'ol/util/const/container-sizes';
import { Container } from 'ol/util/type/container-type';
import { ReactiveGeometry } from './container-factory';
import { ContainerPresetSelector } from './container-preset-selector';

@Component({
  selector: 'ol-shipping-container-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ContainerPresetSelector],
  styleUrl: './container-builder.scss',
  template: `
    <div class="panel super-container-panel">
      <h3 class="panel-title">Super Container</h3>
      <div class="form-group">
        <label class="form-label">Name</label>
        <input
          type="text"
          [(ngModel)]="superContainer().name"
          class="form-input"
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Width</label>
          <input
            type="number"
            [(ngModel)]="superContainer().geometry.width"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Height</label>
          <input
            type="number"
            [(ngModel)]="superContainer().geometry.height"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Depth</label>
          <input
            type="number"
            [(ngModel)]="superContainer().geometry.depth"
            step="0.1"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-row">
        <ol-container-selector (onDimensionChange)="this.preset = $event" />
      </div>
    </div>
  `,
})
export class ShippingContainerForm {
  superContainer = model<Container.ContainerDatum>({
    id: 0,
    name: '',
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    geometry: new ReactiveGeometry({
      height: 0,
      width: 0,
      depth: 0,
    }),
  });
  presets = CONTAINER_SIZES;
  _preset: Container.PresetGeometry = DefaultPresetContainer;

  set preset(val: Container.PresetGeometry) {
		console.log("todo, track preset data / add a matching check?")
		console.log("todo move inches / metric to a higher level")
    this._preset = val;
    this.superContainer.update((old) => {
      const newData = { ...old };
      newData.geometry = new ReactiveGeometry(val.geometry);
      return newData;
    });
  }
  get preset(): Container.PresetGeometry {
    return this._preset;
  }
}
