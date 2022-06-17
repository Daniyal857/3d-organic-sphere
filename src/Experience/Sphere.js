import * as THREE from 'three';
import Experience from './Experience';

export default class Sphere {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.SphereBufferGeometry(1, 32, 32);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
}
