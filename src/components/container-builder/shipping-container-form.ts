import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	CONTAINER_SIZES,
	DefaultPresetContainer,
} from 'ol/util/const/container-sizes';
import { Container } from 'ol/util/type/container-type';
import { containerFactory, ReactiveGeometry } from './container-factory';
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
        <input type="text" [(ngModel)]="name" class="form-input" />
      </div>
      <div class="form-row">
				<div class="form-group">
					<label class="form-label">Height</label>
					<input
						type="number"
						[(ngModel)]="height"
						step="0.1"
						class="form-input"
					/>
				</div>
        <div class="form-group">
          <label class="form-label">Width</label>
          <input
            type="number"
            [(ngModel)]="width"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Depth</label>
          <input
            type="number"
            [(ngModel)]="depth"
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
  superContainer = model<Container.ContainerDatum>(
    containerFactory({
      name: '',
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      custom_geometry: {
        height: 0,
        width: 0,
        depth: 0,
      },
    })
  );
  presets = CONTAINER_SIZES;
  _preset: Container.PresetGeometry = DefaultPresetContainer;

  set preset(val: Container.PresetGeometry) {
    console.log('todo, track preset data / add a matching check?');
    console.log('todo move inches / metric to a higher level');
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

  get name() {
    return this.superContainer().name;
  }
  set name(value: string) {
    this.superContainer.update((old) => ({ ...old, name: value }));
  }

  private updateVal(key: Container.KeyOfSimpleGeometry, val: number) {
    this.superContainer.update((old) => {
      return {
        ...old,
        geometry: old.geometry.updateSize({ [key]: val }),
      };
    });
  }

  get height() {
    return this.superContainer().geometry.height;
  }
  set height(value: number) {
    this.updateVal('height', value);
  }

  get width() {
    return this.superContainer().geometry.width;
  }
  set width(value: number) {
    this.updateVal('width', value);
  }

  get depth() {
    return this.superContainer().geometry.depth;
  }
  set depth(value: number) {
    this.updateVal('depth', value);
  }
}
