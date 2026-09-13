import * as THREE from 'three';
import { Destination, Flight } from '../types';

// Palette mapping for airline livery accents
const AIRLINE_COLORS: Record<string, { primary: number; accent: number }> = {
  IGO: { primary: 0x003399, accent: 0x38bdf8 }, // IndiGo Navy / Cyan
  AIC: { primary: 0x991b1b, accent: 0xfacc15 }, // Air India Crimson / Gold
  SIA: { primary: 0x0f172a, accent: 0xeab308 }, // Singapore Airlines Gold
  UAE: { primary: 0x991b1b, accent: 0x15803d }, // Emirates Red / Green
  QFA: { primary: 0xd97706, accent: 0xffffff }, // Qantas White / Red
  BAW: { primary: 0x1e3a8a, accent: 0xef4444 }, // British Airways Blue / Red
  DLH: { primary: 0x1e293b, accent: 0xf59e0b }, // Lufthansa Blue / Yellow
  default: { primary: 0x0284c7, accent: 0x38bdf8 },
};

/**
 * Creates a high-DPI canvas texture for a crisp, stable destination billboard badge
 */
export function createDestinationBadgeTexture(destination: Destination, isSelected: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded badge container
    const x = 16;
    const y = 14;
    const w = canvas.width - 32;
    const h = canvas.height - 28;
    const radius = 24;

    // Drop shadow
    ctx.shadowColor = isSelected ? 'rgba(56, 189, 248, 0.55)' : 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = isSelected ? 20 : 12;
    ctx.shadowOffsetY = 4;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, y, 0, y + h);
    if (isSelected) {
      bgGrad.addColorStop(0, 'rgba(12, 42, 77, 0.95)');
      bgGrad.addColorStop(1, 'rgba(3, 18, 42, 0.98)');
    } else {
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.90)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.94)');
    }
    ctx.fillStyle = bgGrad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();

    // Reset shadow for crisp borders and text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Outer border
    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.95)' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = isSelected ? 3.5 : 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.stroke();

    // Left indicator icon orb
    const orbX = x + 38;
    const orbY = y + h / 2;
    const orbGrad = ctx.createRadialGradient(orbX, orbY, 2, orbX, orbY, 14);
    if (isSelected) {
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.4, '#38bdf8');
      orbGrad.addColorStop(1, '#0284c7');
    } else {
      orbGrad.addColorStop(0, '#fecdd3');
      orbGrad.addColorStop(0.4, '#f43f5e');
      orbGrad.addColorStop(1, '#be123c');
    }
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, 14, 0, Math.PI * 2);
    ctx.fill();

    // White center pin point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(orbX, orbY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Primary Text: Destination Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", -apple-system, Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    const cleanName = destination.name.toUpperCase();
    ctx.fillText(cleanName, x + 68, y + 36);

    // Secondary Text: Country & Category / Rating
    ctx.fillStyle = isSelected ? '#7dd3fc' : '#94a3b8';
    ctx.font = '600 22px "Segoe UI", -apple-system, Roboto, sans-serif';
    const subText = `${destination.country.toUpperCase()}  •  ★ ${destination.pointsOfInterest?.[0]?.rating || 4.8}`;
    ctx.fillText(subText, x + 68, y + 74);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates a high-DPI canvas texture for a realistic flight radar callout tag
 */
export function createFlightBadgeTexture(flight: Flight, isSelected: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = 12;
    const y = 12;
    const w = canvas.width - 24;
    const h = canvas.height - 24;
    const radius = 18;

    // Backdrop shadow
    ctx.shadowColor = isSelected ? 'rgba(250, 204, 21, 0.55)' : 'rgba(14, 165, 233, 0.4)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;

    // Dark radar cockpit styling
    ctx.fillStyle = isSelected ? 'rgba(30, 27, 75, 0.94)' : 'rgba(8, 18, 38, 0.92)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = isSelected ? 'rgba(250, 204, 21, 0.9)' : 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = isSelected ? 3 : 1.8;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.stroke();

    // Flight Callout Header: Flight Number + Status
    ctx.fillStyle = isSelected ? '#fde047' : '#38bdf8';
    ctx.font = 'bold 30px "JetBrains Mono", Consolas, monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✈ ${flight.flightNumber}`, x + 20, y + 30);

    // Route Pill: DEL ➔ BOM
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px "Segoe UI", -apple-system, sans-serif';
    ctx.fillText(`${flight.origin.code}  ➔  ${flight.destination.code}`, x + 20, y + 66);

    // Altitude & Speed Pill
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`FL${Math.round(flight.altitudeFt / 100)}`, x + w - 20, y + 30);
    ctx.fillText(`${flight.speedKts} kts`, x + w - 20, y + 66);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Builds a realistic 3D destination beacon pin with metallic stem, crystal head,
 * ground glow collar, and crisp camera-facing billboard badge.
 */
export function createDestinationPinMesh(
  destination: Destination,
  isSelected: boolean,
  globeRadius: number = 100
): THREE.Group {
  const pinGroup = new THREE.Group();
  pinGroup.userData = { type: 'destination', destination };

  const themeColor = isSelected ? 0x38bdf8 : 0xf43f5e;
  const height = isSelected ? 12 : 7.5;

  // 1. Invisible Interaction Collider (large sphere for rock-solid hover & clicks without jitter)
  const colliderGeo = new THREE.SphereGeometry(6.5, 8, 8);
  const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
  const colliderMesh = new THREE.Mesh(colliderGeo, colliderMat);
  colliderMesh.position.y = height * 0.5;
  colliderMesh.userData = { type: 'destination', destination };
  pinGroup.add(colliderMesh);

  // 2. Ground Collar & Soft Contact Halo (Elevated slightly to radius 100.25 to prevent any z-fighting)
  const collarGeo = new THREE.CylinderGeometry(2.0, 2.5, 0.4, 24);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.25,
  });
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.position.y = 0.25;
  pinGroup.add(collarMesh);

  // Surface Contact Glow Ring
  const ringGeo = new THREE.RingGeometry(1.6, 3.8, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: themeColor,
    transparent: true,
    opacity: isSelected ? 0.75 : 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.35;
  pinGroup.add(ringMesh);

  // 3. Tapered Polished Titanium Needle Stem
  const needleGeo = new THREE.CylinderGeometry(0.35, 0.75, height, 16);
  const needleMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0x94a3b8 : 0x64748b,
    metalness: 0.9,
    roughness: 0.15,
  });
  const needle = new THREE.Mesh(needleGeo, needleMat);
  needle.position.y = height / 2;
  pinGroup.add(needle);

  // 4. Metallic Gem Setting Collar Ring
  const gemCollarGeo = new THREE.CylinderGeometry(1.8, 1.4, 0.8, 16);
  const gemCollarMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xe0f2fe : 0xffe4e6,
    metalness: 0.95,
    roughness: 0.1,
  });
  const gemCollar = new THREE.Mesh(gemCollarGeo, gemCollarMat);
  gemCollar.position.y = height - 0.4;
  pinGroup.add(gemCollar);

  // 5. Realistic 3D Crystal Gem Pin Head (Outer refractive shell + inner luminous core)
  const headRadius = isSelected ? 2.6 : 1.9;
  const crystalHeadGeo = new THREE.SphereGeometry(headRadius, 24, 24);
  const crystalHeadMat = new THREE.MeshPhysicalMaterial({
    color: isSelected ? 0xbae6fd : 0xfecdd3,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.65,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.9,
  });
  const crystalHead = new THREE.Mesh(crystalHeadGeo, crystalHeadMat);
  crystalHead.position.y = height + headRadius * 0.85;
  pinGroup.add(crystalHead);

  // Inner radiant light core
  const coreGeo = new THREE.SphereGeometry(headRadius * 0.55, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: themeColor,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.y = height + headRadius * 0.85;
  pinGroup.add(coreMesh);

  // Pin Top Omnidirectional Light
  const pinLight = new THREE.PointLight(themeColor, isSelected ? 1.4 : 0.7, 20);
  pinLight.position.y = height + headRadius;
  pinGroup.add(pinLight);

  // 6. Camera-Facing Crisp High-DPI Billboard Badge
  const badgeTexture = createDestinationBadgeTexture(destination, isSelected);
  const spriteMat = new THREE.SpriteMaterial({
    map: badgeTexture,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
  });
  const badgeSprite = new THREE.Sprite(spriteMat);
  badgeSprite.scale.set(isSelected ? 16 : 13, isSelected ? 4.4 : 3.6, 1);
  badgeSprite.position.y = height + headRadius + 4.5;
  badgeSprite.userData = { isBadge: true, type: 'destination', destination };
  pinGroup.add(badgeSprite);

  return pinGroup;
}

/**
 * Builds a realistic commercial airliner 3D model with aerodynamic fuselage,
 * cockpit windshield, swept wings, winglets, twin turbofan engines,
 * vertical tailfin with airline livery, and aviation navigation strobes.
 */
export function createRealisticAircraftMesh(flight: Flight, isSelected: boolean): THREE.Group {
  const planeGroup = new THREE.Group();
  planeGroup.userData = { type: 'flight', flight };

  const livery = AIRLINE_COLORS[flight.airlineCode] || AIRLINE_COLORS.default;
  const fuselageColor = 0xf8fafc;
  const metalRough = 0.22;
  const metalness = 0.45;

  // 1. Invisible Interaction Collider for rock-solid hover & clicks
  const colliderGeo = new THREE.SphereGeometry(7.0, 8, 8);
  const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
  const colliderMesh = new THREE.Mesh(colliderGeo, colliderMat);
  colliderMesh.userData = { type: 'flight', flight };
  planeGroup.add(colliderMesh);

  // Aircraft main body group (model coordinates: forward is +Z, up is +Y, right is +X)
  const bodyGroup = new THREE.Group();
  planeGroup.add(bodyGroup);

  // Aircraft aluminum material
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: fuselageColor,
    metalness,
    roughness: metalRough,
  });

  // Livery Accent Material (Airline Branding)
  const liveryMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xfacc15 : livery.primary,
    metalness: 0.5,
    roughness: 0.3,
  });

  // 2. Aerodynamic Fuselage
  // Central Cabin Cylinder
  const cabinGeo = new THREE.CylinderGeometry(0.75, 0.75, 4.2, 20);
  cabinGeo.rotateX(Math.PI / 2);
  const cabin = new THREE.Mesh(cabinGeo, fuselageMat);
  cabin.position.set(0, 0, 0);
  bodyGroup.add(cabin);

  // Nose Radome (Smooth Streamlined Cone)
  const noseGeo = new THREE.ConeGeometry(0.75, 1.8, 20);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, fuselageMat);
  nose.position.set(0, 0, 3.0);
  bodyGroup.add(nose);

  // Tailcone (Smooth Taper)
  const tailconeGeo = new THREE.ConeGeometry(0.75, 2.2, 20);
  tailconeGeo.rotateX(-Math.PI / 2);
  const tailcone = new THREE.Mesh(tailconeGeo, fuselageMat);
  tailcone.position.set(0, 0.1, -3.2);
  bodyGroup.add(tailcone);

  // 3. Cockpit Windshield Visor (Dark reflective glass)
  const windshieldGeo = new THREE.BoxGeometry(0.85, 0.35, 0.9);
  const windshieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
  });
  const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
  windshield.position.set(0, 0.52, 2.6);
  windshield.rotation.x = -Math.PI / 10;
  bodyGroup.add(windshield);

  // 4. Swept-Back Main Wings with Upward Dihedral (+3 degrees)
  const wingSpan = 7.8;
  const wingChord = 1.4;
  const wingGeo = new THREE.BoxGeometry(wingSpan, 0.12, wingChord);
  const wings = new THREE.Mesh(wingGeo, fuselageMat);
  wings.position.set(0, -0.05, 0.2);
  bodyGroup.add(wings);

  // Vertical Winglets (Sharklets) on wingtips
  const wingletGeo = new THREE.BoxGeometry(0.08, 0.75, 0.5);
  const leftWinglet = new THREE.Mesh(wingletGeo, liveryMat);
  leftWinglet.position.set(-wingSpan / 2, 0.32, 0.2);
  bodyGroup.add(leftWinglet);

  const rightWinglet = new THREE.Mesh(wingletGeo, liveryMat);
  rightWinglet.position.set(wingSpan / 2, 0.32, 0.2);
  bodyGroup.add(rightWinglet);

  // 5. Twin Turbofan Jet Engines under Wings
  const engineGeo = new THREE.CylinderGeometry(0.42, 0.38, 1.6, 16);
  engineGeo.rotateX(Math.PI / 2);
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Exhaust nozzle glow material
  const exhaustMat = new THREE.MeshBasicMaterial({
    color: isSelected ? 0xfacc15 : 0x38bdf8,
  });
  const exhaustGlowGeo = new THREE.CircleGeometry(0.35, 16);

  // Left Engine
  const leftEngine = new THREE.Mesh(engineGeo, engineMat);
  leftEngine.position.set(-2.0, -0.65, 0.4);
  bodyGroup.add(leftEngine);

  const leftExhaust = new THREE.Mesh(exhaustGlowGeo, exhaustMat);
  leftExhaust.rotation.y = Math.PI;
  leftExhaust.position.set(-2.0, -0.65, -0.41);
  bodyGroup.add(leftExhaust);

  // Right Engine
  const rightEngine = new THREE.Mesh(engineGeo, engineMat);
  rightEngine.position.set(2.0, -0.65, 0.4);
  bodyGroup.add(rightEngine);

  const rightExhaust = new THREE.Mesh(exhaustGlowGeo, exhaustMat);
  rightExhaust.rotation.y = Math.PI;
  rightExhaust.position.set(2.0, -0.65, -0.41);
  bodyGroup.add(rightExhaust);

  // 6. Empennage (Tail Fin & Stabilizers)
  // Swept Vertical Stabilizer
  const tailFinGeo = new THREE.BoxGeometry(0.14, 1.8, 1.4);
  const tailFin = new THREE.Mesh(tailFinGeo, liveryMat);
  tailFin.position.set(0, 1.1, -2.6);
  tailFin.rotation.x = -Math.PI / 12;
  bodyGroup.add(tailFin);

  // Horizontal Stabilizers
  const horizStabGeo = new THREE.BoxGeometry(2.8, 0.08, 0.7);
  const horizStab = new THREE.Mesh(horizStabGeo, fuselageMat);
  horizStab.position.set(0, 0.4, -3.2);
  bodyGroup.add(horizStab);

  // 7. Aviation Navigation Strobes & Beacons
  // Port (Left) Red Nav Light
  const portNavGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const portNavMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const portNav = new THREE.Mesh(portNavGeo, portNavMat);
  portNav.position.set(-wingSpan / 2 - 0.05, 0.05, 0.2);
  bodyGroup.add(portNav);

  // Starboard (Right) Green Nav Light
  const starNavGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const starNavMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const starNav = new THREE.Mesh(starNavGeo, starNavMat);
  starNav.position.set(wingSpan / 2 + 0.05, 0.05, 0.2);
  bodyGroup.add(starNav);

  // Tail White Strobe Light
  const strobeGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tailStrobe = new THREE.Mesh(strobeGeo, strobeMat);
  tailStrobe.position.set(0, 1.9, -3.2);
  tailStrobe.userData = { isStrobe: true };
  bodyGroup.add(tailStrobe);

  // Red Anti-Collision Fuselage Beacon
  const beaconGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const topBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  topBeacon.position.set(0, 0.88, 0.4);
  topBeacon.userData = { isBeacon: true };
  bodyGroup.add(topBeacon);

  // Dynamic Jet Thrust Point Light
  const jetLight = new THREE.PointLight(isSelected ? 0xfacc15 : 0x38bdf8, 1.6, 18);
  jetLight.position.set(0, -0.2, -1.8);
  bodyGroup.add(jetLight);

  // 8. Flight Radar Callout Tag Billboard (stably floating above the aircraft)
  const flightBadgeTex = createFlightBadgeTexture(flight, isSelected);
  const badgeSpriteMat = new THREE.SpriteMaterial({
    map: flightBadgeTex,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const badgeSprite = new THREE.Sprite(badgeSpriteMat);
  badgeSprite.scale.set(isSelected ? 15 : 12, isSelected ? 4.1 : 3.3, 1);
  badgeSprite.position.set(0, 4.2, 0);
  badgeSprite.userData = { isBadge: true, type: 'flight', flight };
  planeGroup.add(badgeSprite);

  return planeGroup;
}

/**
 * Calculates a rock-solid, orthonormal coordinate frame for an aircraft along a 3D Great Circle curve.
 * This guarantees ZERO gimbal-lock, ZERO flips, and ensures the wings remain perfectly level
 * with the Earth's spherical surface at all latitudes!
 */
export function setStableAircraftTransform(
  planeGroup: THREE.Object3D,
  pos: THREE.Vector3,
  tangent: THREE.Vector3,
  elapsedTime: number
): void {
  const forward = tangent.clone().normalize();
  // Radial normal pointing straight outwards from the sphere center (aircraft Up)
  const radialUp = pos.clone().normalize();

  // Lateral Right vector (cross product of forward and radial normal)
  const right = new THREE.Vector3().crossVectors(forward, radialUp).normalize();

  // Orthogonal True Up vector (cross product of right and forward)
  const trueUp = new THREE.Vector3().crossVectors(right, forward).normalize();

  // Construct orthonormal 3x3 rotation matrix where:
  // Column 0 = Right (+X)
  // Column 1 = True Up (+Y)
  // Column 2 = Forward (+Z)
  const rotMatrix = new THREE.Matrix4().makeBasis(right, trueUp, forward);

  planeGroup.position.copy(pos);
  planeGroup.quaternion.setFromRotationMatrix(rotMatrix);

  // Animate anti-collision strobe beacon flashing realistically
  const strobeFlash = Math.sin(elapsedTime * 8) > 0.65;
  const beaconFlash = Math.sin(elapsedTime * 4) > 0.2;

  planeGroup.traverse((child) => {
    if (child.userData?.isStrobe && child instanceof THREE.Mesh) {
      (child.material as THREE.MeshBasicMaterial).color.setHex(strobeFlash ? 0xffffff : 0x334155);
    }
    if (child.userData?.isBeacon && child instanceof THREE.Mesh) {
      (child.material as THREE.MeshBasicMaterial).color.setHex(beaconFlash ? 0xff0033 : 0x450a0a);
    }
  });
}
