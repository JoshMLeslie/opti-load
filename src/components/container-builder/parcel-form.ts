import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from 'ol/util/type/container-type';
import { Vector3 } from 'three';
import { v4 } from 'uuid';
import { containerFactory } from './container-factory';
import { ContainerScene } from './container-scene';
import { DefaultParcel } from './util';

@Component({
  selector: 'ol-parcel-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './container-builder.scss',
  template: `
    <div class="panel child-params-panel">
      <h3 class="panel-title">Parcel Parameters</h3>
      <div class="form-group">
        <label class="form-label">Name</label>
        <input type="text" [(ngModel)]="formData().name" class="form-input" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Width</label>
          <input
            type="number"
            [(ngModel)]="formData().geometry.width"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Height</label>
          <input
            type="number"
            [(ngModel)]="formData().geometry.height"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Depth</label>
          <input
            type="number"
            [(ngModel)]="formData().geometry.depth"
            step="0.1"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">X Position</label>
          <input
            type="number"
            [(ngModel)]="formData().position.x"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Y Position</label>
          <input
            type="number"
            [(ngModel)]="formData().position.y"
            step="0.1"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Z Position</label>
          <input
            type="number"
            [(ngModel)]="formData().position.z"
            step="0.1"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Color</label>
        <input
          type="color"
          [(ngModel)]="formData().geometry.color"
          class="form-input color-input"
        />
      </div>
      <div class="button-group">
        <button (click)="createParcel()" class="btn btn-primary">
          Add Parcel
        </button>
        <button (click)="updateParcel()" class="btn btn-secondary">
          Update Selected
        </button>
        <button (click)="deleteParcel()" class="btn btn-secondary">
          Delete Selected
        </button>
      </div>
    </div>
  `,
})
export class ParcelForm {
  superContainer = input<Container.ContainerDatum>();
  formData = model<Container.ContainerDatum>({ ...DefaultParcel });
  onAddParcel = output<{
    parcel: Container.ContainerDatum;
    mesh: Container.ContainerMesh;
  }>();
	onUpdateParcel = output<Container.ContainerDatum>()
	onDeleteParcel = output<Container.ContainerDatum>()

	constructor() {
		effect(() => {
			console.log(this.formData())
		})
	}

  createParcel(): void {
    if (!this.superContainer()) {
      throw ReferenceError('Super container not defined');
    }

    const parcel: Container.ContainerDatum = containerFactory({
      id: Date.now(),
      name: this.formData().name || v4(),
      position: { ...this.formData().position },
      color: this.formData().geometry.color,
      custom_geometry: this.formData().geometry,
    });
    const mesh = parcel.geometry.mesh!;

    const constrainedPos = ContainerScene.constrainToContainer(
      new Vector3(parcel.position.x, parcel.position.y, parcel.position.z),
      parcel,
      this.superContainer()!
    );
    mesh.position.copy(constrainedPos);
    parcel.position.x = parseFloat(constrainedPos.x.toFixed(1));
    parcel.position.y = parseFloat(constrainedPos.y.toFixed(1));
    parcel.position.z = parseFloat(constrainedPos.z.toFixed(1));

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.onAddParcel.emit({ parcel, mesh });

    this.formData().name = v4();
  }

  updateParcel(): void {
    const { geometry: formDataGeometry, position } = this.formData();
    const { mesh } = formDataGeometry;

    if (mesh && formDataGeometry.color) {
      formDataGeometry.updateColorByHex(formDataGeometry.color);
    }

    const constrainedPos = ContainerScene.constrainToContainer(
      new Vector3(
        position.x,
        position.y,
        position.z
      ),
      this.formData(),
      this.superContainer()!
    );
    mesh?.position.copy(constrainedPos);

    position.x = parseFloat(constrainedPos.x.toFixed(1));
    position.y = parseFloat(constrainedPos.y.toFixed(1));
    position.z = parseFloat(constrainedPos.z.toFixed(1));

		this.onUpdateParcel.emit(this.formData())
  }

	deleteParcel() {
		this.onDeleteParcel.emit(this.formData())
	}
}
