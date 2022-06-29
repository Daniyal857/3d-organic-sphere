#define M_PI 3.1415926535897932384626433832795

uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform float uTime;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

varying vec3 vColor;
varying vec3 vNormal;
varying float vPerlinStrength;

#pragma glslify: perlin4d = require('../partials/perlin4d.glsl');

vec4 getDisplacedPosition(vec3 _position) {
  vec3 displacementPosition = _position;
  displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime)) * uDistortionStrength;

  float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime));

  vec3 displacedposition = _position;
  displacedposition += normalize(_position) * perlinStrength * uDisplacementStrength;

  return vec4(displacedposition, perlinStrength);
}

void main() {

  // Position
  vec4 displacedposition = getDisplacedPosition(position);
  vec4 viewPosition = viewMatrix * vec4(displacedposition.xyz, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  // Bi tangent
  float neighbourTangentDistance = (M_PI * 2.0) / 512.0;
  float neighbourBiTangentDistance = M_PI / 512.0;

  vec3 biTangent = cross(normal, tangent.xyz);
  vec3 tangentNeighbour = position + tangent.xyz * neighbourTangentDistance;
  tangentNeighbour = getDisplacedPosition(tangentNeighbour).xyz;

  vec3 biTangentNeighbour = position + biTangent.xyz * neighbourBiTangentDistance;
  biTangentNeighbour = getDisplacedPosition(biTangentNeighbour).xyz;

  vec3 computedNormal = cross(tangentNeighbour, biTangentNeighbour);
  computedNormal = normalize(computedNormal);

  // Color - this as an old way of creating light and its super performant
  float lightAIntensity = max(0.0, -dot(normal.xyz, normalize(- uLightAPosition))) * uLightAIntensity;
  float lightBIntensity = max(0.0, -dot(normal.xyz, normalize(- uLightBPosition))) * uLightBIntensity;

  vec3 color = vec3(0.0);
  color = mix(color, uLightAColor, lightAIntensity);
  color = mix(color, uLightBColor, lightBIntensity);

  // Varying
  vNormal = normal;
  vPerlinStrength = displacedposition.a;
  vColor = color;
}
