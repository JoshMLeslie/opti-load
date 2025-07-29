import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from 'ol/util/type/container-type';

@Component({
  selector: 'ol-shipping-container-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel super-container-panel">
      <h3 class="panel-title">Super Container</h3>
      <div class="form-group">
        <label class="form-label">Name</label>
        <input
          type="text"
          [(ngModel)]="superContainer.name"
          class="form-input"
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Width</label>
          <input
            type="number"
            [(ngModel)]="superContainer().width"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Height</label>
          <input
            type="number"
            [(ngModel)]="superContainer().height"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Depth</label>
          <input
            type="number"
            [(ngModel)]="superContainer().depth"
            step="0.1"
            class="form-input"
          />
        </div>
      </div>
    </div>
  `,
  styleUrl: '../container-builder.scss',
})
export class ShippingContainerForm {
  superContainer = model<Container.ShippingContainer>({
    name: 'MainContainer',
    width: 10,
    height: 6,
    depth: 10,
  });
}
