import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from 'ol/util/type/container-type';
import * as THREE from 'three';
import { ContainerScene } from './container-scene';
import { ShippingContainerForm } from './shipping-container-form/shipping-container-form';

const DefaultParcel: Container.Parcel = {
  id: 0,
  name: 'Container1',
  containerPosition: { x: 0, y: 1, z: 0 },
  geometry: { width: 2, height: 2, depth: 2, color: '#0167d3' },
};

@Component({
  selector: 'ol-container-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ShippingContainerForm],
  templateUrl: './container-builder.html',
  styleUrl: './container-builder.scss',
  styles: `	
		:host {
			display: block;
			height: 100vh;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		}
	`,
})
export class ContainerBuilder
  extends ContainerScene
  implements AfterViewInit, OnDestroy
{
  // as canvasRef from super
  @ViewChild('canvas', { static: true }) set setRef(
    ref: ElementRef<HTMLCanvasElement>
  ) {
    super.init(ref);
  }

  superContainer: Container.ShippingContainer = {
    name: 'MainContainer',
    width: 10,
    height: 6,
    depth: 10,
  };

  parcels: Container.Parcel[] = [];
  selectedParcel: Container.Parcel | null = null;
  parcelForm: Container.Parcel = { ...DefaultParcel };

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    this.updateSuperContainerMesh();
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  updateSuperContainerMesh(): void {
    if (this.superContainerMesh) {
      this.scene.remove(this.superContainerMesh);
      this.superContainerMesh.geometry.dispose();
      (this.superContainerMesh.material as THREE.Material).dispose();
    }

    const geometry = new THREE.BoxGeometry(
      this.superContainer.width,
      this.superContainer.height,
      this.superContainer.depth
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    this.superContainerMesh = new THREE.Mesh(geometry, material);
    this.superContainerMesh.position.set(0, this.superContainer.height / 2, 0);
    this.scene.add(this.superContainerMesh);
  }

  private constrainToContainer(
    position: THREE.Vector3,
    parcel: Container.Parcel
  ): THREE.Vector3 {
    const half = {
      width: parcel.geometry.width / 2,
      height: parcel.geometry.height / 2,
      depth: parcel.geometry.depth / 2,
    };

    const bounds = {
      minX: -this.superContainer.width / 2 + half.width,
      maxX: this.superContainer.width / 2 - half.width,
      minY: half.height,
      maxY: this.superContainer.height - half.height,
      minZ: -this.superContainer.depth / 2 + half.depth,
      maxZ: this.superContainer.depth / 2 - half.depth,
    };

    return new THREE.Vector3(
      Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
      Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
      Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
    );
  }

  private createGumball(parcel: Container.Parcel): void {
    this.removeGumball();

    const gumballGroup = new THREE.Group();
    const arrows: THREE.Mesh[] = [];

    const arrowLength = 1.5;
    const arrowRadius = 0.05;

    const axes = [
      { axis: 'x', color: 0xff0000, direction: new THREE.Vector3(1, 0, 0) },
      { axis: 'y', color: 0x00ff00, direction: new THREE.Vector3(0, 1, 0) },
      { axis: 'z', color: 0x0000ff, direction: new THREE.Vector3(0, 0, 1) },
    ];

    axes.forEach((axisData) => {
      const shaftGeometry = new THREE.CylinderGeometry(
        arrowRadius,
        arrowRadius,
        arrowLength,
        8
      );
      const shaftMaterial = new THREE.MeshLambertMaterial({
        color: axisData.color,
      });
      const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);

      const headGeometry = new THREE.ConeGeometry(
        arrowRadius * 3,
        arrowRadius * 6,
        8
      );
      const headMaterial = new THREE.MeshLambertMaterial({
        color: axisData.color,
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);

      if (axisData.axis === 'x') {
        shaft.rotation.z = -Math.PI / 2;
        head.rotation.z = -Math.PI / 2;
        shaft.position.x = arrowLength / 2;
        head.position.x = arrowLength + arrowRadius * 3;
      } else if (axisData.axis === 'y') {
        shaft.position.y = arrowLength / 2;
        head.position.y = arrowLength + arrowRadius * 3;
      } else if (axisData.axis === 'z') {
        shaft.rotation.x = Math.PI / 2;
        head.rotation.x = Math.PI / 2;
        shaft.position.z = arrowLength / 2;
        head.position.z = arrowLength + arrowRadius * 3;
      }

      shaft.userData = { axis: axisData.axis };
      head.userData = { axis: axisData.axis };

      arrows.push(shaft, head);
      gumballGroup.add(shaft);
      gumballGroup.add(head);
    });

    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    gumballGroup.add(sphere);

    gumballGroup.position.copy(parcel.geometry.mesh!.position);
    this.gumball = { gumball: gumballGroup, arrows };
    this.scene.add(gumballGroup);
  }

  private updateGumball(): void {
    if (this.gumball.gumball && this.selectedParcel?.geometry.mesh) {
      this.gumball.gumball.position.copy(
        this.selectedParcel.geometry.mesh.position
      );
    }
  }

  private removeGumball(): void {
    if (this.gumball.gumball) {
      this.scene.remove(this.gumball.gumball);
      this.gumball.gumball.traverse((child) => {
        if ((child as THREE.Mesh).geometry)
          (child as THREE.Mesh).geometry.dispose();
        if ((child as THREE.Mesh).material)
          ((child as THREE.Mesh).material as THREE.Material).dispose();
      });
      this.gumball = { gumball: null, arrows: [] };
    }
  }

  handleMouseDown(event: MouseEvent): void {
    event.preventDefault();

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (event.button === 0) {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.gumball.arrows.length > 0) {
        const gumballIntersects = this.raycaster.intersectObjects(
          this.gumball.arrows
        );
        if (gumballIntersects.length > 0) {
          this.drag.activeGumballAxis =
            gumballIntersects[0].object.userData['axis'];
          this.drag.isDragging = true;
          return;
        }
      }

      const intersects = this.raycaster.intersectObjects(
        this.parcels.map((p) => p.geometry.mesh!)
      );

      if (intersects.length <= 0) {
        this.handleSelectParcel();
      } else {
        const clickedParcel = this.parcels.find(
          (p) => p.geometry.mesh === intersects[0].object
        );
        if (clickedParcel) {
          this.handleSelectParcel(clickedParcel);
          this.drag.isDragging = true;
          this.drag.dragPlane.setFromNormalAndCoplanarPoint(
            new THREE.Vector3(0, 1, 0),
            intersects[0].point
          );
        }
      }
    } else if (event.button === 2) {
      this.controls.isRotating = true;
      this.controls.mouseX = event.clientX;
      this.controls.mouseY = event.clientY;
    }
  }

  handleMouseMove(event: MouseEvent): void {
    if (this.drag.isDragging && this.selectedParcel?.geometry.mesh) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.drag.activeGumballAxis) {
        const direction = new THREE.Vector3();
        (direction as any)[this.drag.activeGumballAxis] = 1;

        const intersectPoint = new THREE.Vector3();
        const plane = new THREE.Plane(
          direction.clone().cross(this.camera.position.clone().normalize()),
          0
        );
        plane.setFromNormalAndCoplanarPoint(
          plane.normal,
          this.selectedParcel.geometry.mesh.position
        );

        if (this.raycaster.ray.intersectPlane(plane, intersectPoint)) {
          const newPos = this.selectedParcel.geometry.mesh.position.clone();
          const delta = intersectPoint
            .clone()
            .sub(this.selectedParcel.geometry.mesh.position);
          (newPos as any)[this.drag.activeGumballAxis] =
            (this.selectedParcel.geometry.mesh.position as any)[
              this.drag.activeGumballAxis
            ] + (delta as any)[this.drag.activeGumballAxis];

          const constrainedPos = this.constrainToContainer(
            newPos,
            this.selectedParcel
          );
          this.selectedParcel.geometry.mesh.position.copy(constrainedPos);

          // Update the parcel's position data
          this.selectedParcel.containerPosition.x = parseFloat(
            constrainedPos.x.toFixed(1)
          );
          this.selectedParcel.containerPosition.y = parseFloat(
            constrainedPos.y.toFixed(1)
          );
          this.selectedParcel.containerPosition.z = parseFloat(
            constrainedPos.z.toFixed(1)
          );

          this.updateGumball();
        }
      } else {
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.drag.dragPlane, intersectPoint);

        if (intersectPoint) {
          const newPosition = this.constrainToContainer(
            intersectPoint,
            this.selectedParcel
          );
          this.selectedParcel.geometry.mesh.position.copy(newPosition);

          // Update the parcel's position data
          this.selectedParcel.containerPosition.x = parseFloat(
            newPosition.x.toFixed(1)
          );
          this.selectedParcel.containerPosition.y = parseFloat(
            newPosition.y.toFixed(1)
          );
          this.selectedParcel.containerPosition.z = parseFloat(
            newPosition.z.toFixed(1)
          );

          this.updateGumball();
        }
      }
    } else if (this.controls.isRotating) {
      const deltaX = event.clientX - this.controls.mouseX;
      const deltaY = event.clientY - this.controls.mouseY;

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi -= deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);

      this.controls.mouseX = event.clientX;
      this.controls.mouseY = event.clientY;
    }
  }

  handleMouseUp(): void {
    this.drag.isDragging = false;
    this.controls.isRotating = false;
    this.drag.activeGumballAxis = null;
  }

  handleMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    this.camera.position.multiplyScalar(scale);
  }

  handleSelectParcel(parcel?: Container.Parcel): void {
    const material = (parcel?.geometry.mesh?.material ||
      this.selectedParcel?.geometry.mesh
        ?.material) as THREE.MeshLambertMaterial;

    if (!parcel) {
      this.removeGumball();
    }

    if (!parcel && this.selectedParcel) {
      // Remove illumination from selected parcel
      material?.emissive.setHex(0x000000);
      this.selectedParcel = null;
    } else if (parcel) {
      // Illuminate selected parcel
      material.emissive.setHex(0x444444);
      this.createGumball(parcel);

      this.selectedParcel = parcel;
    }
    this.cdr.detectChanges();
  }

  addParcel(): void {
    const nextName = `Container${this.parcels.length + 1}`;

    const geometry = new THREE.BoxGeometry(
      this.parcelForm.geometry.width,
      this.parcelForm.geometry.height,
      this.parcelForm.geometry.depth
    );
    const material = new THREE.MeshLambertMaterial({
      color: this.parcelForm.geometry.color,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const parcel: Container.Parcel = {
      id: Date.now(),
      name: nextName,
      containerPosition: { ...this.parcelForm.containerPosition },
      geometry: {
        width: this.parcelForm.geometry.width,
        height: this.parcelForm.geometry.height,
        depth: this.parcelForm.geometry.depth,
        color: this.parcelForm.geometry.color,
        mesh: mesh,
      },
    };

    const constrainedPos = this.constrainToContainer(
      new THREE.Vector3(
        parcel.containerPosition.x,
        parcel.containerPosition.y,
        parcel.containerPosition.z
      ),
      parcel
    );
    mesh.position.copy(constrainedPos);

    // Update parcel position to constrained values
    parcel.containerPosition.x = parseFloat(constrainedPos.x.toFixed(1));
    parcel.containerPosition.y = parseFloat(constrainedPos.y.toFixed(1));
    parcel.containerPosition.z = parseFloat(constrainedPos.z.toFixed(1));

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.parcels.push(parcel);
    this.scene.add(mesh);
  }

  updateParcel(): void {
    if (!this.selectedParcel?.geometry.mesh) return;

    const { geometry } = this.selectedParcel;
    const { mesh } = geometry;

    // Update geometry if dimensions changed
    if (mesh?.geometry instanceof THREE.BoxGeometry) {
      const currentSize = mesh.geometry.parameters;
      if (
        currentSize.width !== geometry.width ||
        currentSize.height !== geometry.height ||
        currentSize.depth !== geometry.depth
      ) {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(
          geometry.width,
          geometry.height,
          geometry.depth
        );
      }
    }

    if (mesh && geometry.color) {
      (mesh.material as THREE.MeshLambertMaterial).color.setHex(
        parseInt(geometry.color.replace('#', '0x'))
      );
    }

    const constrainedPos = this.constrainToContainer(
      new THREE.Vector3(
        this.selectedParcel.containerPosition.x,
        this.selectedParcel.containerPosition.y,
        this.selectedParcel.containerPosition.z
      ),
      this.selectedParcel
    );
    mesh?.position.copy(constrainedPos);

    this.selectedParcel.containerPosition.x = parseFloat(
      constrainedPos.x.toFixed(1)
    );
    this.selectedParcel.containerPosition.y = parseFloat(
      constrainedPos.y.toFixed(1)
    );
    this.selectedParcel.containerPosition.z = parseFloat(
      constrainedPos.z.toFixed(1)
    );

    this.updateGumball();
    this.cdr.detectChanges();
  }

  deleteParcel(): void {
    if (!this.selectedParcel?.geometry.mesh) return;

    this.scene.remove(this.selectedParcel.geometry.mesh);
    this.selectedParcel.geometry.mesh.geometry.dispose();
    (this.selectedParcel.geometry.mesh.material as THREE.Material).dispose();

    this.parcels = this.parcels.filter((p) => p.id !== this.selectedParcel!.id);
    this.removeGumball();
    this.selectedParcel = null;
    this.cdr.detectChanges();
  }
}
