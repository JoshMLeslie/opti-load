import { ElementRef } from '@angular/core';
import { Container } from 'ol/util/type/container-type';
import * as THREE from 'three';

export class ContainerScene {
  canvasRef!: ElementRef<HTMLCanvasElement>;

  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  raycaster!: THREE.Raycaster;
  mouse = new THREE.Vector2();
  controls = { mouseX: 0, mouseY: 0, isRotating: false };
  drag = {
    isDragging: false,
    dragPlane: new THREE.Plane(),
    activeGumballAxis: null as string | null,
  };
  superContainerMesh: THREE.Mesh | null = null;
  gumball: { gumball: THREE.Group | null; arrows: THREE.Mesh[] } = {
    gumball: null,
    arrows: [],
  };
  animationId!: number;

  init(canvasRef: ElementRef<HTMLCanvasElement>) {
    this.canvasRef = canvasRef;
    this.initThreeJS();
  }

  handleResize = (): void => {
    const width = window.innerWidth * 0.6;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  }

  static constrainToContainer(
    position: THREE.Vector3,
    contained: Container.ContainerDatum,
    container: Container.ContainerDatum
  ): THREE.Vector3 {
    const containedHalves = {
      width: contained.geometry.width / 2,
      height: contained.geometry.height / 2,
      depth: contained.geometry.depth / 2,
		}
    const containerHalves = {
      width: container.geometry.width / 2,
      height: container.geometry.height / 2,
      depth: container.geometry.depth / 2,
    };

    const bounds = {
      minX: -containerHalves.width + containedHalves.width,
      maxX: containerHalves.width - containedHalves.width,
      minY: containedHalves.height,
      maxY: container.geometry.height - containedHalves.height,
      minZ: -containerHalves.depth + containedHalves.depth,
      maxZ: containerHalves.depth - containedHalves.depth,
    };

    return new THREE.Vector3(
      Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
      Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
      Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
    );
  }

  private initThreeJS(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      (window.innerWidth * 0.6) / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(8, 8, 8);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
    this.scene.add(gridHelper);

    // Raycaster and drag plane
    this.raycaster = new THREE.Raycaster();
    this.drag.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Animation loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
