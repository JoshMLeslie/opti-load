import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from 'ol/util/type/container-type';
import { ReactiveGeometry } from './container-factory';

@Component({
  selector: 'ol-shipping-container-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
}
