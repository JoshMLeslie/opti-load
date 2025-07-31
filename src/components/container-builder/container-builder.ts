import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from 'ol/util/type/container-type';
import * as THREE from 'three';
import { containerFactory } from './container-factory';
import { ContainerScene } from './container-scene';
import { ParcelForm } from './parcel-form';
import { ShippingContainerForm } from './shipping-container-form';
import { DefaultParcel } from './util';

@Component({
  selector: 'ol-container-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ShippingContainerForm, ParcelForm],
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

  superContainer: Container.ContainerDatum = containerFactory({
    name: 'MainContainer',
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    custom_geometry: {
      width: 10,
      height: 6,
      depth: 10,
    },
  });

  parcels: Container.ContainerDatum[] = [];
  selectedParcel: Container.ContainerDatum | null = null;
  parcelForm: Container.ContainerDatum = { ...DefaultParcel };

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

    const superGeometry = this.superContainer.geometry;
    const geometry = new THREE.BoxGeometry(
      superGeometry.width,
      superGeometry.height,
      superGeometry.depth
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    this.superContainerMesh = new THREE.Mesh(geometry, material);
    this.superContainerMesh.position.set(0, superGeometry.height / 2, 0);
    this.scene.add(this.superContainerMesh);
  }

  private createGumball(parcel: Container.ContainerDatum): void {
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

          const constrainedPos = ContainerScene.constrainToContainer(
            newPos,
            this.selectedParcel,
            this.superContainer
          );
          this.selectedParcel.geometry.mesh.position.copy(constrainedPos);

          // Update the parcel's position data
          this.selectedParcel.position.x = parseFloat(
            constrainedPos.x.toFixed(1)
          );
          this.selectedParcel.position.y = parseFloat(
            constrainedPos.y.toFixed(1)
          );
          this.selectedParcel.position.z = parseFloat(
            constrainedPos.z.toFixed(1)
          );

          this.updateGumball();
        }
      } else {
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.drag.dragPlane, intersectPoint);

        if (intersectPoint) {
          const newPosition = ContainerScene.constrainToContainer(
            intersectPoint,
            this.selectedParcel,
            this.superContainer
          );
          this.selectedParcel.geometry.mesh.position.copy(newPosition);

          // Update the parcel's position data
          this.selectedParcel.position.x = parseFloat(newPosition.x.toFixed(1));
          this.selectedParcel.position.y = parseFloat(newPosition.y.toFixed(1));
          this.selectedParcel.position.z = parseFloat(newPosition.z.toFixed(1));

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

  private getMeshMaterial(parcel: Container.ContainerDatum) {
    return parcel?.geometry.mesh?.material;
  }

  handleSelectParcel(parcel?: Container.ContainerDatum): void {
    if (!parcel) {
      this.removeGumball();
    }

    if (parcel !== this.selectedParcel && this.selectedParcel) {
      this.getMeshMaterial(this.selectedParcel)?.emissive.setHex(0x000000);
    }

    if (!parcel && this.selectedParcel) {
      // Remove illumination from selected parcel
      this.getMeshMaterial(this.selectedParcel)?.emissive.setHex(0x000000);
      this.selectedParcel = null;
      this.parcelForm = { ...DefaultParcel };
    } else if (parcel) {
      // Illuminate selected parcel
      this.getMeshMaterial(parcel)?.emissive.setHex(0x444444);
      this.createGumball(parcel);

      this.selectedParcel = parcel;
      this.parcelForm = parcel;
    }

    this.cdr.detectChanges();
  }

  onAddParcel({
    parcel,
    mesh,
  }: {
    parcel: Container.ContainerDatum;
    mesh: Container.ContainerMesh;
  }): void {
    this.parcels.push(parcel);
    this.scene.add(mesh);
  }

  private updateParcel(parcel: Container.ContainerDatum): void {
    this.updateGumball();
    console.log(
      parcel.geometry.mesh?.geometry.parameters,
      this.selectedParcel?.geometry.mesh?.geometry.parameters
    );
    // this.onDeleteParcel(parcel);
    this.onAddParcel({
      parcel,
      mesh: parcel.geometry.mesh as Container.ContainerMesh,
    });
    this.cdr.detectChanges();
  }

  onUpdateParcel(parcel: Container.ContainerDatum): void {
    this.updateParcel(parcel);
  }

  private deleteParcel(parcel: Container.ContainerDatum) {
    if (!parcel.geometry.mesh) return;

    this.scene.remove(parcel.geometry.mesh);
    parcel.geometry.dispose();

    this.parcels = this.parcels.filter((p) => p.id !== parcel!.id);
    this.removeGumball();
    this.selectedParcel = null;
    this.cdr.detectChanges();
  }

  onDeleteParcel(parcel: Container.ContainerDatum): void {
    this.deleteParcel(parcel);
  }
}
