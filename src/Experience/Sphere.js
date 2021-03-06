import * as THREE from 'three';
import Experience from './Experience';
import vertexShader from './shaders/sphere/vertex.glsl';
import fragmentShader from './shaders/sphere/fragment.glsl';

export default class Sphere {
  constructor() {
    this.experience = new Experience();
    this.debugPane = this.experience.debugPane;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.timeFrequency = 0.0003;

    if (this.debugPane) {
      this.debugFolder = this.debugPane.addFolder({
        title: 'sphere',
        expanded: true
      });

      this.debugFolder.addInput(this, 'timeFrequency', {
        min: 0,
        max: 0.001,
        step: 0.000001
      });
    }

    this.setGeometry();
    this.setLights();
    this.setOffset();
    this.setMaterial();
    this.setMesh();
  }

  setLights() {
    this.lights = {};

    // Light A
    this.lights.a = {};

    this.lights.a.intensity = 4.5;

    this.lights.a.color = {};
    this.lights.a.color.value = '#ff3e00';
    this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value);

    this.lights.a.spherical = new THREE.Spherical(1, 0.615, 2.049);

    // Light B
    this.lights.b = {};

    this.lights.b.intensity = 2;

    this.lights.b.color = {};
    this.lights.b.color.value = '#0063ff';
    this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value);

    this.lights.b.spherical = new THREE.Spherical(1, 2.561, -1.844);

    // Debug
    if (this.debugPane) {
      for (const _lightName in this.lights) {
        const light = this.lights[_lightName];

        const debugFolder = this.debugFolder.addFolder({
          title: _lightName,
          expanded: true
        });

        debugFolder
          .addInput(light.color, 'value', {
            view: 'color',
            label: 'color'
          })
          .on('change', () => {
            light.color.instance.set(light.color.value);
          });

        debugFolder
          .addInput(light, 'intensity', {
            min: 0,
            max: 5
          })
          .on('change', () => {
            this.material.uniforms[
              `uLight${_lightName.toUpperCase()}Intensity`
            ].value = light.intensity;
          });

        debugFolder
          .addInput(light.spherical, 'phi', {
            label: 'phi',
            min: 0,
            max: Math.PI,
            step: 0.001
          })
          .on('change', () => {
            this.material.uniforms[
              `uLight${_lightName.toUpperCase()}Position`
            ].value.setFromSpherical(light.spherical);
          });
        debugFolder
          .addInput(light.spherical, 'theta', {
            label: 'theta',
            min: -Math.PI,
            max: Math.PI,
            step: 0.001
          })
          .on('change', () => {
            this.material.uniforms.uLightAPosition.value.setFromSpherical(
              light.spherical
            );
          });
      }
    }
  }

  setOffset() {
    this.offset = {};
    this.offset.spherical = new THREE.Spherical(
      1,
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );
    this.offset.direction = new THREE.Vector3();
    this.offset.direction.setFromSpherical(this.offset.spherical);
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 512, 512);
    this.geometry.computeTangents();
    console.log('this.geometry', this.geometry);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uLightAColor: { value: this.lights.a.color.instance },
        uLightAPosition: { value: new THREE.Vector3(1.0, 1.0, 0.0) },
        uLightAIntensity: { value: this.lights.a.intensity },

        uLightBColor: { value: this.lights.b.color.instance },
        uLightBPosition: { value: new THREE.Vector3(-1.0, -1.0, 0.0) },
        uLightBIntensity: { value: this.lights.b.intensity },

        uSubdivision: {
          value: new THREE.Vector2(
            this.geometry.parameters.widthSegments,
            this.geometry.parameters.heightSegments
          )
        },

        uOffset: { value: new THREE.Vector3() },

        uDistortionFrequency: { value: 1.5 },
        uDistortionStrength: { value: 0.65 },
        uDisplacementFrequency: { value: 2.12 },
        uDisplacementStrength: { value: 0.152 },

        uFresnelOffset: { value: -1.0 },
        uFresnelMultiplier: { value: 2.12 },
        uFresnelPower: { value: 1.793 },

        uTime: { value: 0 }
      },
      defines: {
        USE_TANGENT: ''
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    this.material.uniforms.uLightAPosition.value.setFromSpherical(
      this.lights.a.spherical
    );
    this.material.uniforms.uLightBPosition.value.setFromSpherical(
      this.lights.b.spherical
    );

    if (this.debugPane) {
      this.debugFolder.addInput(
        this.material.uniforms.uDistortionFrequency,
        'value',
        { label: 'uDistortionFrequency', min: 0, max: 10, step: 0.001 }
      );
      this.debugFolder.addInput(
        this.material.uniforms.uDistortionStrength,
        'value',
        { label: 'uDistortionStrength', min: 0, max: 10, step: 0.001 }
      );
      this.debugFolder.addInput(
        this.material.uniforms.uDisplacementFrequency,
        'value',
        { label: 'uDisplacementFrequency', min: 0, max: 5, step: 0.001 }
      );
      this.debugFolder.addInput(
        this.material.uniforms.uDisplacementStrength,
        'value',
        { label: 'uDisplacementStrength', min: 0, max: 1, step: 0.001 }
      );
      // Fresnel
      this.debugFolder.addInput(
        this.material.uniforms.uFresnelOffset,
        'value',
        { label: 'uFresnelOffset', min: -2, max: 2, step: 0.001 }
      );
      this.debugFolder.addInput(
        this.material.uniforms.uFresnelMultiplier,
        'value',
        { label: 'uFresnelMultiplier', min: 0, max: 5, step: 0.001 }
      );
      this.debugFolder.addInput(this.material.uniforms.uFresnelPower, 'value', {
        label: 'uFresnelPower',
        min: 0,
        max: 5,
        step: 0.001
      });
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  update() {
    const offsetTime = this.time.elapsed * 0.3;
    this.offset.spherical.phi =
      ((Math.sin(offsetTime * 0.001) + Math.sin(offsetTime * 0.00321)) * 0.5 +
        0.5) *
      Math.PI;
    this.offset.spherical.theta =
      ((Math.sin(offsetTime * 0.0001) + Math.sin(offsetTime * 0.000321)) * 0.5 +
        0.5) *
      Math.PI *
      2;
    this.offset.direction.setFromSpherical(this.offset.spherical);
    this.offset.direction.multiplyScalar(0.01);

    this.material.uniforms.uOffset.value.add(this.offset.direction);
    this.material.uniforms.uTime.value += this.time.delta * this.timeFrequency;
  }
}
