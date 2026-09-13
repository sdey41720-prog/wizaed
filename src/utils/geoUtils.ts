import * as THREE from 'three';
import { Coordinate } from '../types';

/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere
 * Radius defaults to Earth globe radius
 */
export function latLngToVector3(lat: number, lng: number, radius: number = 100): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts 3D Cartesian point on a sphere back to Latitude and Longitude
 */
export function vector3ToLatLng(vector: THREE.Vector3): Coordinate {
  const normalized = vector.clone().normalize();
  const lat = 90 - Math.acos(normalized.y) * (180 / Math.PI);
  let lng = ((Math.atan2(normalized.z, -normalized.x) * 180) / Math.PI) - 180;
  
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;

  return { lat, lng };
}

/**
 * Calculates Great Circle distance between two points on Earth in km
 */
export function getGreatCircleDistanceKm(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Generates an arched 3D Great Circle curve between two coordinates
 */
export function createGreatCircleCurve(
  start: Coordinate,
  end: Coordinate,
  globeRadius: number = 100,
  maxAltitude: number = 18
): THREE.CubicBezierCurve3 {
  const vStart = latLngToVector3(start.lat, start.lng, globeRadius);
  const vEnd = latLngToVector3(end.lat, end.lng, globeRadius);

  // Compute distance factor to scale arch altitude
  const distance = vStart.distanceTo(vEnd);
  const altitudeScale = Math.min(1.0, distance / (globeRadius * 1.6));
  const peakHeight = globeRadius + maxAltitude * altitudeScale;

  // Midpoints for control points
  const midPoint = vStart.clone().add(vEnd).multiplyScalar(0.5).normalize().multiplyScalar(peakHeight);

  // Control points angled towards start and end
  const cp1 = vStart.clone().lerp(midPoint, 0.5).normalize().multiplyScalar(peakHeight * 0.95);
  const cp2 = vEnd.clone().lerp(midPoint, 0.5).normalize().multiplyScalar(peakHeight * 0.95);

  return new THREE.CubicBezierCurve3(vStart, cp1, cp2, vEnd);
}

/**
 * Computes heading angle between two coordinates in degrees
 */
export function calculateBearing(start: Coordinate, end: Coordinate): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
