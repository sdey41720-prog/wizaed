import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass } from 'lucide-react';
import { Destination, Flight, GlobeViewMode, WeatherOverlayType, Coordinate, Itinerary } from '../types';
import { latLngToVector3, createGreatCircleCurve } from '../utils/geoUtils';
import { createGlobeTexture, createWeatherOverlayTexture } from '../utils/globeTextures';
import { playRadarBeep, playFlyTransitionSound } from '../utils/audio';
import {
  createDestinationPinMesh,
  createRealisticAircraftMesh,
  setStableAircraftTransform,
} from '../utils/globeIcons';

interface Globe3DProps {
  destinations: Destination[];
  flights: Flight[];
  selectedDestination: Destination | null;
  selectedFlight: Flight | null;
  activeItinerary: Itinerary | null;
  viewMode: GlobeViewMode;
  weatherOverlay: WeatherOverlayType;
  isAutoRotating: boolean;
  onSelectDestination: (dest: Destination) => void;
  onSelectFlight: (flight: Flight) => void;
  onClearSelection: () => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  destinations,
  flights,
  selectedDestination,
  selectedFlight,
  activeItinerary,
  viewMode,
  weatherOverlay,
  isAutoRotating,
  onSelectDestination,
  onSelectFlight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const weatherMeshRef = useRef<THREE.Mesh | null>(null);
  const outerAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const innerAtmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const coronaBloomMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const planesGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const itineraryGroupRef = useRef<THREE.Group | null>(null);

  // Interaction & Camera tracking refs
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: -0.22, y: 0.12 });
  const currentRotation = useRef({ x: -0.22, y: 0.12 });
  const cameraDistance = useRef(235);
  const targetCameraDistance = useRef(235);
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isAnimatingToTarget = useRef(false);

  // Flight curves cache
  const flightCurvesRef = useRef<Map<string, { curve: THREE.CubicBezierCurve3; flight: Flight }>>(new Map());

  // Hover state for cursor
  const [hoveredEntity, setHoveredEntity] = useState<{ type: 'dest' | 'flight'; name: string; x: number; y: number } | null>(null);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

  // Fly-to camera helper
  const flyToCoordinate = useCallback((coord: Coordinate, distance: number = 190) => {
    isAnimatingToTarget.current = true;
    playFlyTransitionSound();

    const phi = (90 - coord.lat) * (Math.PI / 180);
    const theta = (coord.lng + 180) * (Math.PI / 180);

    // Calculate rotation to bring this point to face camera (along -Z / positive Z)
    targetRotation.current = {
      x: phi - Math.PI / 2,
      y: -theta - Math.PI / 2,
    };
    targetCameraDistance.current = distance;
  }, []);

  // Sync fly to selected destination
  useEffect(() => {
    if (selectedDestination) {
      flyToCoordinate(selectedDestination.coord, 185);
    }
  }, [selectedDestination, flyToCoordinate]);

  // Sync fly to selected flight
  useEffect(() => {
    if (selectedFlight) {
      const start = selectedFlight.origin.coord;
      const end = selectedFlight.destination.coord;
      const midCoord = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };
      flyToCoordinate(midCoord, 230);
    }
  }, [selectedFlight, flyToCoordinate]);

  // Main Three.js setup
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = Math.max(10, container.clientWidth || window.innerWidth || 800);
    const height = Math.max(10, container.clientHeight || window.innerHeight || 600);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 40, cameraDistance.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with safe initialization
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      rendererRef.current = renderer;
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to 2D orbital radar:', err);
      setWebGlAvailable(false);
      return;
    }

    // 4. Studio Lighting (Key light from top-left creating realistic specular gloss curve on crystal globe)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Studio Key Light positioned top-left/front to match specular gloss highlight on crystal globe
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(-160, 200, 220);
    scene.add(keyLight);

    // Studio Fill Light for soft realistic depth
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    fillLight.position.set(220, 90, -80);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-150, -120, -180);
    scene.add(rimLight);

    // 5. Starfield Background particles
    const starCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 600 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 1.5,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5B. Studio Floor Contact Shadow & Caustic Light Spot beneath Globe
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      // Soft elliptical contact shadow
      const grad = sCtx.createRadialGradient(256, 256, 12, 256, 256, 220);
      grad.addColorStop(0, 'rgba(2, 6, 23, 0.92)');
      grad.addColorStop(0.3, 'rgba(3, 18, 42, 0.65)');
      grad.addColorStop(0.65, 'rgba(6, 32, 65, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.beginPath();
      sCtx.arc(256, 256, 220, 0, Math.PI * 2);
      sCtx.fill();

      // Sparkling caustic light droplet under bottom pole (as visible in reference image)
      const causticGrad = sCtx.createRadialGradient(256, 256, 0, 256, 256, 38);
      causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      causticGrad.addColorStop(0.25, 'rgba(186, 230, 253, 0.85)');
      causticGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.45)');
      causticGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      sCtx.fillStyle = causticGrad;
      sCtx.beginPath();
      sCtx.arc(256, 256, 38, 0, Math.PI * 2);
      sCtx.fill();
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(240, 240);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -102;
    scene.add(shadowPlane);

    // 6. Main Earth Globe
    const globeRadius = 100;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeTexture = createGlobeTexture(viewMode);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.35,
      metalness: 0.12,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // 6B. Crystal Glass Outer Shell (Glossy refractive finish with clearcoat & specular highlights)
    const crystalGlassGeometry = new THREE.SphereGeometry(globeRadius * 1.006, 64, 64);
    const crystalGlassMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0.06,
      metalness: 0.05,
      transmission: 0.60,
      ior: 1.48,
      reflectivity: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transparent: true,
      opacity: 0.75,
      color: new THREE.Color(0xf0f9ff),
    });
    const crystalGlassMesh = new THREE.Mesh(crystalGlassGeometry, crystalGlassMaterial);
    globeMesh.add(crystalGlassMesh);

    // 7. Multi-Layered Atmospheric Glow & Bloom Effect (Space-travel aesthetic)
    // 7A. Outer Volumetric Atmospheric Bloom Halo (Backside Fresnel)
    const outerAtmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.20, 64, 64);
    const outerAtmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunPosition: { value: new THREE.Vector3(300, 150, 200) },
        uColorCore: { value: new THREE.Color(0x38bdf8) }, // Radiant cyan
        uColorOuter: { value: new THREE.Color(0x0284c7) }, // Deep space cobalt
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunPosition;
        uniform vec3 uColorCore;
        uniform vec3 uColorOuter;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float rim = clamp(dot(vNormal, viewDir), 0.0, 1.0);
          
          // Exponential bloom falloff
          float intensity = pow(rim, 2.3);
          
          // Sun illumination on the planetary limb
          vec3 sunDir = normalize(uSunPosition);
          vec3 worldNormal = normalize(vWorldPosition);
          float sunDot = dot(worldNormal, sunDir);
          float sunFactor = smoothstep(-0.35, 0.75, sunDot);
          
          // Gentle celestial pulse
          float shimmer = 1.0 + 0.04 * sin(uTime * 1.8 + vWorldPosition.y * 0.04);
          
          vec3 bloomColor = mix(uColorOuter, uColorCore, pow(rim, 1.5));
          float alpha = intensity * (0.35 + 0.65 * sunFactor) * shimmer * 1.05;
          alpha = clamp(alpha, 0.0, 1.0);
          
          gl_FragColor = vec4(bloomColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const outerAtmosphereMesh = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    scene.add(outerAtmosphereMesh);
    outerAtmosphereMatRef.current = outerAtmosphereMaterial;

    // 7B. Inner Horizon Limb Fresnel (Sharp electric-cyan rim line)
    const innerAtmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.018, 64, 64);
    const innerAtmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - max(0.0, dot(vNormal, viewDir));
          // Sharp luminous rim line
          float limb = pow(fresnel, 3.4);
          
          vec3 cyanGlow = vec3(0.38, 0.85, 1.0);
          vec3 deepGlow = vec3(0.08, 0.42, 0.95);
          vec3 limbColor = mix(deepGlow, cyanGlow, fresnel);
          
          gl_FragColor = vec4(limbColor, limb * 0.92);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    const innerAtmosphereMesh = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial);
    scene.add(innerAtmosphereMesh);
    innerAtmosphereMatRef.current = innerAtmosphereMaterial;

    // 7C. Deep Space Corona Bloom Aura (Soft outer radial halo)
    const coronaBloomGeometry = new THREE.SphereGeometry(globeRadius * 1.35, 48, 48);
    const coronaBloomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float rim = clamp(dot(vNormal, viewDir), 0.0, 1.0);
          float corona = pow(rim, 3.8);
          vec3 spaceAura = vec3(0.04, 0.38, 0.82);
          float breath = 1.0 + 0.03 * sin(uTime * 1.2);
          gl_FragColor = vec4(spaceAura, corona * 0.45 * breath);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const coronaBloomMesh = new THREE.Mesh(coronaBloomGeometry, coronaBloomMaterial);
    scene.add(coronaBloomMesh);
    coronaBloomMatRef.current = coronaBloomMaterial;

    // 8. Cloud Layer
    const cloudsGeometry = new THREE.SphereGeometry(globeRadius * 1.015, 48, 48);
    const cloudsTexture = createWeatherOverlayTexture('clouds', 0);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 9. Weather Overlay Mesh
    const weatherGeometry = new THREE.SphereGeometry(globeRadius * 1.025, 48, 48);
    const weatherTexture = createWeatherOverlayTexture(weatherOverlay, 0);
    const weatherMaterial = new THREE.MeshBasicMaterial({
      map: weatherTexture,
      transparent: true,
      opacity: weatherOverlay === 'none' ? 0 : 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const weatherMesh = new THREE.Mesh(weatherGeometry, weatherMaterial);
    scene.add(weatherMesh);
    weatherMeshRef.current = weatherMesh;

    // 10. Groups for dynamic items
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const planesGroup = new THREE.Group();
    scene.add(planesGroup);
    planesGroupRef.current = planesGroup;

    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    const itineraryGroup = new THREE.Group();
    scene.add(itineraryGroup);
    itineraryGroupRef.current = itineraryGroup;

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(10, containerRef.current.clientWidth || window.innerWidth || 800);
      const h = Math.max(10, containerRef.current.clientHeight || window.innerHeight || 600);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        try {
          renderer.dispose();
        } catch {}
      }
      try {
        globeGeometry.dispose();
        globeMaterial.dispose();
        cloudsGeometry.dispose();
        cloudsMaterial.dispose();
        outerAtmosphereGeometry.dispose();
        outerAtmosphereMaterial.dispose();
        innerAtmosphereGeometry.dispose();
        innerAtmosphereMaterial.dispose();
        coronaBloomGeometry.dispose();
        coronaBloomMaterial.dispose();
      } catch {}
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      globeMeshRef.current = null;
      cloudsMeshRef.current = null;
      weatherMeshRef.current = null;
      outerAtmosphereMatRef.current = null;
      innerAtmosphereMatRef.current = null;
      coronaBloomMatRef.current = null;
      arcsGroupRef.current = null;
      planesGroupRef.current = null;
      pinsGroupRef.current = null;
      itineraryGroupRef.current = null;
    };
  }, []);

  // Update globe texture on viewMode change
  useEffect(() => {
    if (globeMeshRef.current) {
      const newTexture = createGlobeTexture(viewMode);
      const mat = globeMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.map = newTexture;
      mat.needsUpdate = true;
    }
  }, [viewMode]);

  // Update weather overlay on weatherOverlay change
  useEffect(() => {
    if (weatherMeshRef.current) {
      const mat = weatherMeshRef.current.material as THREE.MeshBasicMaterial;
      if (weatherOverlay === 'none') {
        mat.opacity = 0;
      } else {
        const newTex = createWeatherOverlayTexture(weatherOverlay, 0);
        mat.map?.dispose();
        mat.map = newTex;
        mat.opacity = 0.85;
      }
      mat.needsUpdate = true;
    }
  }, [weatherOverlay]);

  // Render Destination Pins
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    const group = pinsGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const globeRadius = 100;

    destinations.forEach((dest) => {
      const pinPos = latLngToVector3(dest.coord.lat, dest.coord.lng, globeRadius);
      const normal = pinPos.clone().normalize();
      const isSelected = selectedDestination?.id === dest.id;

      // Create realistic 3D pin mesh with titanium stem, crystal head, ground collar, and billboard tag
      const pinObj = createDestinationPinMesh(dest, isSelected, globeRadius);
      pinObj.position.copy(pinPos);
      // Align Y-axis radially outwards from Earth center
      pinObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      group.add(pinObj);
    });
  }, [destinations, selectedDestination]);

  // Render 3D Flight Arcs & Aircraft
  useEffect(() => {
    if (!arcsGroupRef.current || !planesGroupRef.current) return;
    const arcsGroup = arcsGroupRef.current;
    const planesGroup = planesGroupRef.current;

    while (arcsGroup.children.length > 0) arcsGroup.remove(arcsGroup.children[0]);
    while (planesGroup.children.length > 0) planesGroup.remove(planesGroup.children[0]);

    flightCurvesRef.current.clear();

    flights.forEach((flight) => {
      const isSelected = selectedFlight?.id === flight.id;
      const curve = createGreatCircleCurve(flight.origin.coord, flight.destination.coord, 100, 18);
      flightCurvesRef.current.set(flight.id, { curve, flight });

      // Arc curve geometry (smooth 100 segments)
      const points = curve.getPoints(100);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

      // Realistic dashed aviation trajectory line
      const arcMat = new THREE.LineDashedMaterial({
        color: isSelected ? 0xfacc15 : 0x38bdf8,
        dashSize: 2.5,
        gapSize: 1.2,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.55,
        linewidth: 2,
      });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      arcLine.computeLineDistances();
      arcLine.userData = { type: 'flight', flight };
      arcsGroup.add(arcLine);

      // Realistic Commercial Jet Airliner 3D Mesh
      const planeGroup = createRealisticAircraftMesh(flight, isSelected);
      const planePos = curve.getPointAt(flight.progress);
      const tangent = curve.getTangentAt(flight.progress).normalize();
      setStableAircraftTransform(planeGroup, planePos, tangent, 0);

      planesGroup.add(planeGroup);
    });
  }, [flights, selectedFlight]);

  // Render Itinerary Polyline if active
  useEffect(() => {
    if (!itineraryGroupRef.current) return;
    const group = itineraryGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (!activeItinerary || activeItinerary.items.length < 2) return;

    // Connect sequential itinerary items that have coordinates
    const validItems = activeItinerary.items.filter((item) => !!item.coord);
    for (let i = 0; i < validItems.length - 1; i++) {
      const p1 = validItems[i].coord!;
      const p2 = validItems[i + 1].coord!;
      const curve = createGreatCircleCurve(p1, p2, 100, 10);
      const points = curve.getPoints(50);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x10b981,
        dashSize: 2,
        gapSize: 1,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      group.add(line);
    }
  }, [activeItinerary]);

  // Animation Frame Loop
  useEffect(() => {
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const elapsedTime = clock.getElapsedTime();

      // Update atmospheric glow and bloom breathing animation
      if (outerAtmosphereMatRef.current) {
        outerAtmosphereMatRef.current.uniforms.uTime.value = elapsedTime;
      }
      if (innerAtmosphereMatRef.current) {
        innerAtmosphereMatRef.current.uniforms.uTime.value = elapsedTime;
      }
      if (coronaBloomMatRef.current) {
        coronaBloomMatRef.current.uniforms.uTime.value = elapsedTime;
      }

      // Rotate clouds slowly
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0006;
      }

      // Smooth camera interpolation towards target
      const lerpSpeed = isAnimatingToTarget.current ? 0.05 : 0.08;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpSpeed;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpSpeed;
      cameraDistance.current += (targetCameraDistance.current - cameraDistance.current) * lerpSpeed;

      // Auto rotation if enabled and not dragging
      if (isAutoRotating && !isDraggingRef.current && !isAnimatingToTarget.current) {
        targetRotation.current.y += 0.0015;
      }

      // Check if animation to target is nearly complete
      if (
        isAnimatingToTarget.current &&
        Math.abs(targetRotation.current.x - currentRotation.current.x) < 0.005 &&
        Math.abs(targetRotation.current.y - currentRotation.current.y) < 0.005
      ) {
        isAnimatingToTarget.current = false;
      }

      // Clamp X rotation to prevent flipping over poles
      currentRotation.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, currentRotation.current.x));

      // Calculate camera position from spherical rotations
      if (cameraRef.current) {
        const x = cameraDistance.current * Math.cos(currentRotation.current.x) * Math.sin(currentRotation.current.y);
        const y = cameraDistance.current * Math.sin(currentRotation.current.x);
        const z = cameraDistance.current * Math.cos(currentRotation.current.x) * Math.cos(currentRotation.current.y);

        cameraRef.current.position.set(x, y, z);
        cameraRef.current.lookAt(targetLookAt.current);
      }

      // 1. Stable Destination Pins Horizon Occlusion & Ground Shimmer
      if (pinsGroupRef.current && cameraRef.current) {
        const camDir = cameraRef.current.position.clone().normalize();

        pinsGroupRef.current.children.forEach((pinGroup) => {
          const pinPos = pinGroup.position;
          const pinNormal = pinPos.clone().normalize();
          const dot = pinNormal.dot(camDir);

          // Horizon culling threshold: if on far side of globe, hide completely to avoid raycast/visual noise
          const isVisible = dot > 0.05;
          pinGroup.visible = isVisible;

          if (isVisible) {
            const alpha = Math.min(1, (dot - 0.05) / 0.15);
            pinGroup.traverse((child) => {
              if (child instanceof THREE.Sprite) {
                child.material.opacity = alpha * 0.96;
              }
            });
          }
        });
      }

      // 2. Stable Flight Aircraft Motion & Horizon Occlusion
      if (planesGroupRef.current && cameraRef.current) {
        const camDir = cameraRef.current.position.clone().normalize();

        planesGroupRef.current.children.forEach((planeGroup) => {
          const flight = planeGroup.userData?.flight as Flight | undefined;
          if (flight && flightCurvesRef.current.has(flight.id)) {
            const entry = flightCurvesRef.current.get(flight.id);
            if (!entry) return;
            const { curve } = entry;

            // Advance progress smoothly based on continuous time
            const animatedProgress = (flight.progress + elapsedTime * 0.0035) % 1.0;
            const newPos = curve.getPointAt(animatedProgress);
            const tangent = curve.getTangentAt(animatedProgress).normalize();

            // Set rock-solid orthonormal coordinate frame (never flips, wings level with earth curvature)
            setStableAircraftTransform(planeGroup, newPos, tangent, elapsedTime);

            // Aircraft Horizon Occlusion
            const planeNormal = newPos.clone().normalize();
            const dot = planeNormal.dot(camDir);
            const isVisible = dot > -0.05;
            planeGroup.visible = isVisible;

            if (isVisible) {
              const alpha = Math.min(1, (dot + 0.05) / 0.15);
              planeGroup.traverse((child) => {
                if (child instanceof THREE.Sprite) {
                  child.material.opacity = alpha * 0.95;
                }
              });
            }
          }
        });
      }

      try {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      } catch (renderErr) {
        console.warn('Three.js render cycle warning:', renderErr);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAutoRotating]);

  // Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isAnimatingToTarget.current = false;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.y += deltaX * 0.005;
      targetRotation.current.x += deltaY * 0.005;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycasting for interactive hover
      try {
        if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        const hitObjects: THREE.Object3D[] = [];
        if (pinsGroupRef.current) hitObjects.push(...pinsGroupRef.current.children);
        if (planesGroupRef.current) hitObjects.push(...planesGroupRef.current.children);

        const intersects = raycaster.intersectObjects(hitObjects, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData?.type && topObj.parent) {
            topObj = topObj.parent;
          }

          if (topObj?.userData?.type === 'destination') {
            const dest = topObj.userData.destination as Destination;
            setHoveredEntity({
              type: 'dest',
              name: `${dest.name}, ${dest.country}`,
              x: e.clientX,
              y: e.clientY,
            });
            return;
          } else if (topObj?.userData?.type === 'flight') {
            const flight = topObj.userData.flight as Flight;
            setHoveredEntity({
              type: 'flight',
              name: `${flight.flightNumber} (${flight.origin.code} ➔ ${flight.destination.code})`,
              x: e.clientX,
              y: e.clientY,
            });
            return;
          }
        }
        setHoveredEntity(null);
      } catch {
        setHoveredEntity(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    // Check click raycast
    try {
      if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const hitObjects: THREE.Object3D[] = [];
      if (pinsGroupRef.current) hitObjects.push(...pinsGroupRef.current.children);
      if (planesGroupRef.current) hitObjects.push(...planesGroupRef.current.children);

      const intersects = raycaster.intersectObjects(hitObjects, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData?.type && topObj.parent) {
          topObj = topObj.parent;
        }

        if (topObj?.userData?.type === 'destination') {
          const dest = topObj.userData.destination as Destination;
          playRadarBeep();
          onSelectDestination(dest);
        } else if (topObj?.userData?.type === 'flight') {
          const flight = topObj.userData.flight as Flight;
          playRadarBeep();
          onSelectFlight(flight);
        }
      }
    } catch (err) {
      console.warn('Click raycast error:', err);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetCameraDistance.current = Math.max(130, Math.min(380, targetCameraDistance.current + e.deltaY * 0.25));
  };

  if (!webGlAvailable) {
    return (
      <div id="globe-fallback-view" className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200 select-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">2D Flight Radar Navigation</h2>
          <p className="text-xs text-slate-400 mb-6 max-w-md leading-relaxed">
            Hardware 3D WebGL context is operating in streamlined mode. Select any destination below to view interactive travel points of interest, weather forecasts, and flight routes.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-h-64 overflow-y-auto p-1">
            {destinations.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDestination(d)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold text-white truncate">{d.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{d.country}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="globe-canvas-container"
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Planetary Atmospheric Ambient Bloom Aura */}
      <div 
        id="globe-ambient-bloom-glow"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 animate-pulse"
        style={{
          width: 'min(68vw, 68vh, 580px)',
          height: 'min(68vw, 68vh, 580px)',
          background: 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(14,116,144,0.14) 45%, rgba(2,132,199,0.06) 70%, transparent 85%)',
          filter: 'blur(36px)',
          animationDuration: '6s',
        }}
      />

      <canvas
        id="globe-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* 3D Hover Tooltip */}
      {hoveredEntity && (
        <div
          id="globe-hover-tooltip"
          className="fixed pointer-events-none z-30 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-2 -translate-x-1/2 -translate-y-12 transition-all duration-75"
          style={{ left: hoveredEntity.x, top: hoveredEntity.y }}
        >
          <span className={`w-2 h-2 rounded-full animate-ping ${hoveredEntity.type === 'dest' ? 'bg-rose-400' : 'bg-sky-400'}`} />
          <span>{hoveredEntity.name}</span>
        </div>
      )}

      {/* Viewport Nav Telemetry Compass Overlay */}
      <div id="telemetry-compass" className="absolute bottom-6 left-6 z-10 pointer-events-none flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-sky-500/30 bg-slate-950/70 backdrop-blur-md flex items-center justify-center relative shadow-lg">
          <div
            className="w-0.5 h-7 bg-gradient-to-t from-transparent via-sky-400 to-rose-500 rounded-full transition-transform duration-75"
            style={{ transform: `rotate(${-currentRotation.current.y * (180 / Math.PI)}deg)` }}
          />
          <span className="absolute top-1 text-[8px] font-bold text-rose-400">N</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 leading-tight">
          <div className="text-sky-400 font-semibold tracking-wider">3D ORBIT TELEMETRY</div>
          <div>ALT: {Math.round(cameraDistance.current * 32)} KM</div>
          <div>ROT: {(currentRotation.current.y * (180 / Math.PI) % 360).toFixed(1)}°</div>
        </div>
      </div>
    </div>
  );
};
