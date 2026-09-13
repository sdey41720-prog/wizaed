import * as THREE from 'three';
import { GlobeViewMode, WeatherOverlayType } from '../types';

/**
 * Creates canvas-based high-detail textures for the 3D globe,
 * featuring realistic physical geography, biomes (Sahara golden sands,
 * Congo rainforests, Himalayan snow caps, Australian red ochre outback,
 * emerald river valleys), turquoise continental shelves, and crystal graticule lines
 * matching the crystal glass Earth illustration.
 */

export function geoToCanvas(lat: number, lng: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

// ---------------------------------------------------------------------------------
// Accurate continental boundaries [latitude, longitude]
// ---------------------------------------------------------------------------------

// Detailed sovereign boundary coordinates of India
export const INDIA_BOUNDARY: [number, number][] = [
  // Jammu, Kashmir & Ladakh northern crown
  [37.05, 74.85],
  [37.20, 75.80],
  [36.90, 77.10],
  [35.90, 78.00],
  [35.50, 79.20],
  [34.50, 79.30],
  [33.30, 79.40],
  [32.60, 78.90],
  // Himachal & Uttarakhand Himalayan frontier
  [31.30, 78.60],
  [30.90, 79.10],
  [30.40, 79.70],
  [30.20, 81.00],
  // Nepal border
  [28.80, 80.20],
  [27.70, 81.50],
  [26.60, 83.30],
  [26.90, 85.10],
  [26.60, 87.20],
  [26.80, 88.10],
  // Sikkim
  [27.30, 88.10],
  [28.05, 88.60],
  [27.80, 88.90],
  [27.10, 88.90],
  // Arunachal Pradesh & Northeast Seven Sisters
  [26.90, 89.80],
  [27.20, 91.70],
  [27.90, 92.40],
  [28.60, 94.10],
  [29.20, 95.80],
  [28.30, 97.20],
  [27.40, 96.90],
  [26.70, 95.70],
  [25.80, 94.60],
  [24.60, 93.90],
  [23.90, 93.40],
  [22.40, 93.10],
  // Mizoram & Tripura
  [21.90, 92.80],
  [22.80, 92.20],
  [23.50, 91.30],
  [24.30, 92.10],
  [25.10, 92.20],
  // Meghalaya / Assam border
  [25.30, 89.90],
  [26.00, 89.90],
  // Bengal corridor
  [26.10, 88.50],
  [25.10, 88.10],
  [24.20, 88.60],
  [22.60, 89.20],
  // Bay of Bengal Coast
  [21.60, 88.10],
  [21.50, 87.20],
  [20.10, 86.60],
  [19.80, 85.80],
  [19.30, 85.00],
  [18.30, 84.00],
  [17.70, 83.30],
  [16.70, 82.30],
  [15.80, 80.80],
  [14.40, 80.10],
  [13.10, 80.30],
  [12.00, 79.80],
  [10.80, 79.80],
  [9.30, 79.10],
  [8.70, 78.10],
  // Kanyakumari / Cape Comorin
  [8.08, 77.55],
  // Arabian Sea Coast
  [8.50, 76.95],
  [9.50, 76.35],
  [9.96, 76.24],
  [11.25, 75.78],
  [12.50, 75.00],
  [12.90, 74.85],
  [13.40, 74.70],
  [14.80, 74.15],
  [15.30, 73.80], // Goa
  [16.00, 73.40],
  [17.00, 73.30],
  [18.90, 72.80], // Mumbai
  [19.80, 72.75],
  [20.50, 72.85],
  // Gujarat
  [21.10, 72.80],
  [21.70, 72.20],
  [20.70, 70.90],
  [20.90, 70.35],
  [21.60, 69.60],
  [22.25, 68.90],
  [22.80, 70.00],
  [23.00, 68.50],
  [23.70, 68.10], // Kori Creek / Rann of Kutch
  // Rajasthan Thar & Punjab border
  [24.50, 71.00],
  [25.50, 70.20],
  [27.00, 70.50],
  [28.00, 71.50],
  [29.50, 72.50],
  [30.50, 73.80],
  [31.60, 74.60], // Amritsar
  [32.40, 75.00],
  [32.80, 74.40],
  [33.80, 74.00],
  [34.80, 74.10],
  [35.50, 74.80],
  [37.05, 74.85],
];

// Africa Continental Perimeter
export const AFRICA_BOUNDARY: [number, number][] = [
  [35.8, -5.8],  // Tangier / Gibraltar
  [33.5, -7.6],  // Casablanca
  [30.4, -9.6],  // Agadir
  [27.1, -13.2], // Western Sahara
  [20.9, -17.1], // Mauritania
  [14.7, -17.5], // Dakar, Senegal
  [11.8, -15.6], // Guinea-Bissau
  [9.5, -13.7],  // Conakry
  [6.3, -10.8],  // Monrovia, Liberia
  [4.4, -7.5],   // Cape Palmas
  [5.3, -4.0],   // Abidjan
  [5.6, -0.2],   // Accra, Ghana
  [6.1, 1.2],    // Togo
  [6.4, 3.4],    // Lagos, Nigeria
  [4.7, 7.0],    // Niger Delta
  [4.0, 9.7],    // Douala, Cameroon
  [0.4, 9.4],    // Gabon
  [-4.8, 12.0],  // Congo
  [-8.8, 13.2],  // Luanda, Angola
  [-12.5, 13.4], // Benguela
  [-16.0, 11.8],
  [-22.9, 14.5], // Walvis Bay, Namibia
  [-28.6, 16.5], // Orange River
  [-32.5, 18.3],
  [-34.3, 18.5], // Cape of Good Hope
  [-34.8, 20.0], // Cape Agulhas
  [-33.9, 25.6], // Port Elizabeth
  [-31.6, 29.5],
  [-29.8, 31.0], // Durban
  [-26.0, 32.6], // Maputo, Mozambique
  [-20.0, 34.9], // Beira
  [-15.0, 40.5], // Mozambique Channel
  [-10.5, 40.5], // Tanzania border
  [-6.8, 39.3],  // Dar es Salaam
  [-4.0, 39.7],  // Mombasa, Kenya
  [-0.5, 42.8],  // Kismayo, Somalia
  [2.0, 45.3],   // Mogadishu
  [5.0, 48.5],
  [10.5, 51.3],  // Cape Guardafui / Horn of Africa
  [11.8, 51.2],
  [11.6, 43.1],  // Bab-el-Mandeb / Djibouti
  [15.6, 39.5],  // Massawa, Eritrea
  [22.0, 36.9],  // Red Sea coast
  [27.8, 34.3],  // Hurghada
  [30.0, 32.6],  // Suez
  [31.2, 32.3],  // Port Said
  [31.5, 31.0],  // Nile Delta
  [31.2, 29.9],  // Alexandria
  [31.3, 27.2],  // Matruh
  [32.0, 24.0],  // Tobruk, Libya
  [32.1, 20.1],  // Benghazi
  [31.2, 16.5],  // Gulf of Sirte
  [32.9, 13.2],  // Tripoli
  [33.9, 10.0],  // Gabes, Tunisia
  [36.8, 10.3],  // Tunis / Cape Bon
  [37.3, 9.8],   // Bizerte
  [36.9, 7.8],   // Annaba, Algeria
  [36.8, 3.1],   // Algiers
  [35.7, -0.6],  // Oran
  [35.2, -3.9],  // Morocco
  [35.8, -5.3],  // Ceuta
  [35.8, -5.8],
];

// Madagascar
export const MADAGASCAR_BOUNDARY: [number, number][] = [
  [-12.0, 49.3],
  [-15.3, 50.5],
  [-19.0, 49.0],
  [-25.0, 47.0],
  [-25.6, 45.2],
  [-22.0, 43.3],
  [-17.0, 44.2],
  [-13.3, 48.2],
  [-12.0, 49.3],
];

// Arabian Peninsula
export const ARABIA_BOUNDARY: [number, number][] = [
  [30.0, 32.6], // Suez
  [27.8, 34.3], // Sinai
  [21.5, 39.2], // Jeddah
  [16.9, 42.6], // Jizan
  [12.8, 45.0], // Aden, Yemen
  [14.5, 49.1], // Al Mukalla
  [17.0, 54.1], // Salalah, Oman
  [22.5, 59.8], // Ras al Hadd
  [23.6, 58.5], // Muscat
  [26.2, 56.4], // Strait of Hormuz
  [25.3, 55.3], // Dubai, UAE
  [25.3, 51.5], // Qatar
  [26.2, 50.6], // Dammam
  [29.4, 48.0], // Kuwait
  [30.0, 48.0],
  [31.5, 46.0], // Iraq
  [33.5, 44.0], // Baghdad
  [34.0, 40.0], // Syria
  [32.5, 35.8], // Jordan
  [30.0, 32.6],
];

// Europe
export const EUROPE_BOUNDARY: [number, number][] = [
  [36.0, -5.6],  // Tarifa, Spain
  [37.0, -9.0],  // Sagres, Portugal
  [38.7, -9.5],  // Lisbon
  [43.4, -8.4],  // Coruna
  [43.5, -3.8],  // Santander
  [43.4, -1.6],  // Bay of Biscay
  [47.5, -3.0],  // Brittany, France
  [49.7, -1.9],  // Normandy
  [51.0, 2.0],   // Calais
  [53.5, 8.0],   // Netherlands / Germany
  [55.5, 8.5],   // Jutland, Denmark
  [57.7, 10.6],  // Skagen
  [59.0, 11.0],  // Oslofjord
  [58.0, 7.0],   // Southern Norway
  [62.0, 5.0],   // Norwegian Coast
  [68.0, 14.0],  // Lofoten
  [71.2, 25.8],  // North Cape
  [69.0, 33.0],  // Kola Peninsula
  [65.0, 40.0],  // White Sea
  [60.0, 30.0],  // St Petersburg
  [59.5, 24.5],  // Estonia
  [56.9, 24.1],  // Latvia
  [54.5, 19.5],  // Poland
  [54.0, 14.0],
  [48.0, 16.0],  // Central Europe
  [45.6, 13.8],  // Trieste, Adriatic
  [41.1, 16.9],  // Italy (Bari)
  [38.1, 15.6],  // Calabria
  [40.8, 14.2],  // Naples
  [41.9, 12.5],  // Rome
  [44.4, 8.9],   // Genoa
  [43.7, 7.3],   // Nice / France
  [41.4, 2.2],   // Barcelona
  [39.5, -0.4],  // Valencia
  [36.7, -4.4],  // Malaga
  [36.0, -5.6],
];

export const UK_BOUNDARY: [number, number][] = [
  [50.0, -5.2],
  [50.8, -1.3],
  [51.3, 1.4],
  [52.8, 1.7],
  [54.5, -0.6],
  [56.0, -2.7],
  [58.6, -3.1],
  [57.5, -5.7],
  [55.0, -4.5],
  [53.4, -3.0],
  [51.5, -4.0],
  [50.2, -4.8],
  [50.0, -5.2],
];

// Australia
export const AUSTRALIA_BOUNDARY: [number, number][] = [
  [-10.7, 142.5], // Cape York
  [-17.0, 146.0], // Cairns
  [-23.0, 150.5], // Rockhampton
  [-27.5, 153.0], // Brisbane
  [-33.8, 151.2], // Sydney
  [-37.5, 150.0], // Cape Howe
  [-38.3, 145.0], // Melbourne
  [-38.0, 140.5], // Portland
  [-35.0, 136.0], // Spencer Gulf / Adelaide
  [-32.0, 131.0], // Great Australian Bight
  [-32.5, 125.0],
  [-34.4, 115.1], // Cape Leeuwin
  [-31.9, 115.8], // Perth
  [-26.0, 113.2], // Shark Bay
  [-21.8, 114.1], // North West Cape
  [-20.0, 118.5], // Port Hedland
  [-17.9, 122.2], // Broome
  [-14.0, 126.0], // Kimberley
  [-12.4, 130.8], // Darwin
  [-12.0, 135.0], // Arnhem Land
  [-15.0, 136.0], // Gulf of Carpentaria
  [-17.5, 139.5],
  [-14.0, 141.5],
  [-10.7, 142.5],
];

export const TASMANIA_BOUNDARY: [number, number][] = [
  [-40.8, 145.0],
  [-41.0, 148.0],
  [-43.5, 147.5],
  [-43.5, 146.0],
  [-42.0, 145.0],
  [-40.8, 145.0],
];

// Asia Mainland
export const ASIA_MAINLAND_BOUNDARY: [number, number][] = [
  [30.0, 50.0],  // Persian Gulf
  [25.3, 60.5],  // Pakistan Makran
  [24.5, 67.0],  // Karachi / Indus delta
  [31.6, 74.6],  // Punjab
  [35.5, 74.8],  // Karakoram
  [36.0, 77.0],
  [36.0, 85.0],  // Tibetan Plateau
  [38.0, 95.0],  // Qaidam
  [42.0, 105.0], // Gobi Desert
  [48.0, 115.0], // Mongolia
  [52.0, 125.0], // Amur
  [43.0, 132.0], // Vladivostok
  [40.0, 128.0], // North Korea
  [35.0, 129.0], // South Korea
  [37.5, 126.5], // Seoul
  [39.0, 124.0], // Yellow Sea
  [38.0, 118.0], // Bohai Bay
  [36.0, 120.0], // Shandong
  [34.0, 120.0],
  [31.2, 121.5], // Shanghai / Yangtze Delta
  [28.0, 121.0],
  [26.0, 119.5], // Fuzhou
  [22.3, 114.0], // Hong Kong / Pearl River
  [21.0, 110.0],
  [21.0, 107.5], // Gulf of Tonkin
  [16.0, 108.2], // Da Nang
  [10.8, 107.0], // Mekong Delta / Ho Chi Minh
  [8.5, 104.5],  // Ca Mau
  [12.5, 100.0], // Bangkok
  [7.0, 100.5],  // Southern Thailand
  [1.3, 103.8],  // Singapore
  [3.0, 101.4],  // Kuala Lumpur
  [6.0, 100.0],  // Penang
  [10.0, 98.5],  // Myanmar
  [16.8, 96.2],  // Yangon
  [20.0, 93.0],  // Rakhine
  [22.6, 89.2],  // Sundarbans
];

export const SUMATRA_BOUNDARY: [number, number][] = [
  [5.5, 95.3],
  [3.5, 98.7],
  [0.5, 101.5],
  [-3.0, 106.0],
  [-5.8, 105.8],
  [-4.0, 102.5],
  [-0.9, 100.4],
  [2.0, 97.0],
  [5.5, 95.3],
];

export const BORNEO_BOUNDARY: [number, number][] = [
  [7.0, 117.0],
  [5.0, 119.0],
  [1.0, 118.0],
  [-1.2, 116.8],
  [-3.5, 116.0],
  [-3.0, 112.0],
  [-1.0, 109.0],
  [1.5, 109.5],
  [4.5, 114.0],
  [7.0, 117.0],
];

export const JAVA_BOUNDARY: [number, number][] = [
  [-6.0, 106.0],
  [-6.8, 109.0],
  [-7.2, 112.8],
  [-8.5, 114.5],
  [-8.0, 110.5],
  [-7.0, 106.5],
  [-6.0, 106.0],
];

export const JAPAN_HONSHU_BOUNDARY: [number, number][] = [
  [35.0, 132.0],
  [34.7, 135.5],
  [35.0, 137.0],
  [35.5, 140.0],
  [38.0, 141.0],
  [41.5, 141.0],
  [40.0, 139.8],
  [37.0, 137.0],
  [35.5, 133.0],
  [35.0, 132.0],
];

export const SOUTH_AMERICA_BOUNDARY: [number, number][] = [
  [11.0, -75.0],
  [10.5, -67.0],
  [6.0, -58.0],
  [4.0, -51.0],
  [-0.5, -48.0],
  [-5.5, -35.2],
  [-13.0, -38.5],
  [-22.9, -43.2],
  [-24.0, -46.3],
  [-30.0, -50.0],
  [-34.8, -56.2],
  [-36.0, -57.5],
  [-41.0, -63.0],
  [-52.0, -68.0],
  [-55.0, -67.0],
  [-45.0, -74.5],
  [-33.0, -71.5],
  [-20.0, -70.0],
  [-12.0, -77.0],
  [-2.0, -80.0],
  [4.0, -77.5],
  [8.0, -77.5],
  [11.0, -75.0],
];

export const NORTH_AMERICA_BOUNDARY: [number, number][] = [
  [9.0, -79.0],
  [15.0, -88.0],
  [21.0, -87.0],
  [26.0, -97.0],
  [29.0, -90.0],
  [25.0, -80.5],
  [31.0, -81.5],
  [35.0, -75.5],
  [40.7, -74.0],
  [44.0, -69.0],
  [47.0, -65.0],
  [52.0, -56.0],
  [58.0, -62.0],
  [65.0, -70.0],
  [70.0, -135.0],
  [71.0, -156.0],
  [65.0, -168.0],
  [55.0, -160.0],
  [58.0, -135.0],
  [49.0, -123.0],
  [37.8, -122.4],
  [32.7, -117.2],
  [23.0, -110.0],
  [16.0, -98.0],
  [14.0, -92.0],
  [9.0, -79.0],
];

function drawGeoPath(ctx: CanvasRenderingContext2D, coords: [number, number][], width: number, height: number) {
  if (coords.length === 0) return;
  ctx.beginPath();
  const [startX, startY] = geoToCanvas(coords[0][0], coords[0][1], width, height);
  ctx.moveTo(startX, startY);

  for (let i = 1; i < coords.length; i++) {
    const [x, y] = geoToCanvas(coords[i][0], coords[i][1], width, height);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Renders all world continents with the exact crystal glass earth look:
 * - Glowing turquoise continental shelf bathymetry
 * - Sahara golden sands & dunes
 * - Central African tropical rainforests
 * - Arabian sandy deserts
 * - Alpine and Scandinavian temperate greens
 * - Snow-capped Himalayas & Tibetan plateau
 * - Rich verdant Indian subcontinent with Western Ghats & Gangetic plains
 * - Australian red-ochre outback & coastal eucalyptus fringes
 * - Elegant coordinate graticule grid lines (Equator, Tropics, Meridians)
 */
export function createGlobeTexture(mode: GlobeViewMode): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const width = canvas.width;
  const height = canvas.height;

  if (mode === 'realistic') {
    // -----------------------------------------------------------------------------
    // 1. Crystal Oceanic Depths (Glowing turquoise to royal sapphire blue gradient)
    // -----------------------------------------------------------------------------
    const oceanGrad = ctx.createRadialGradient(
      width * 0.72, height * 0.45, 100,  // Focal center on Indian Ocean
      width * 0.72, height * 0.45, width * 0.65
    );
    oceanGrad.addColorStop(0, '#02385e');   // Luminous deep cyan-blue core
    oceanGrad.addColorStop(0.35, '#012a4a'); // Rich sapphire
    oceanGrad.addColorStop(0.65, '#011e38'); // Deep oceanic trench
    oceanGrad.addColorStop(1, '#001224');   // Deep space limb border
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle oceanic light caustic shimmer
    const causticGrad = ctx.createLinearGradient(0, 0, width, height);
    causticGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
    causticGrad.addColorStop(0.5, 'rgba(14, 116, 144, 0.02)');
    causticGrad.addColorStop(1, 'rgba(3, 105, 161, 0.06)');
    ctx.fillStyle = causticGrad;
    ctx.fillRect(0, 0, width, height);

    // -----------------------------------------------------------------------------
    // 2. Translucent Coordinate Graticule Lines (Equator, Tropics, Meridians)
    //    (As prominently featured on the crystal desk globe illustration!)
    // -----------------------------------------------------------------------------
    ctx.save();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)'; // Pale luminous cyan grid lines

    // Latitude Parallels (every 15 degrees)
    for (let lat = -75; lat <= 75; lat += 15) {
      const [, y] = geoToCanvas(lat, 0, width, height);
      ctx.beginPath();
      if (lat === 0) {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1.6;
      } else if (Math.abs(lat) === 30 || Math.abs(lat) === 60) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.26)';
        ctx.lineWidth = 1.0;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.lineWidth = 0.8;
      }
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Longitude Meridians (every 15 degrees)
    for (let lng = -180; lng < 180; lng += 15) {
      const [x] = geoToCanvas(0, lng, width, height);
      ctx.beginPath();
      if (lng === 0 || lng === 90 || lng === 180 || lng === -90) {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.35)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 0.8;
      }
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 3. Glowing Turquoise Continental Shelves (Bathymetry Halo)
    // -----------------------------------------------------------------------------
    const allBoundaries = [
      AFRICA_BOUNDARY,
      MADAGASCAR_BOUNDARY,
      ARABIA_BOUNDARY,
      INDIA_BOUNDARY,
      AUSTRALIA_BOUNDARY,
      TASMANIA_BOUNDARY,
      ASIA_MAINLAND_BOUNDARY,
      SUMATRA_BOUNDARY,
      BORNEO_BOUNDARY,
      JAVA_BOUNDARY,
      JAPAN_HONSHU_BOUNDARY,
      EUROPE_BOUNDARY,
      UK_BOUNDARY,
      SOUTH_AMERICA_BOUNDARY,
      NORTH_AMERICA_BOUNDARY,
    ];

    // Wide soft cyan shelf glow
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
    ctx.lineWidth = 16;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 18;
    allBoundaries.forEach(poly => {
      drawGeoPath(ctx, poly, width, height);
      ctx.stroke();
    });
    ctx.restore();

    // Inner electric turquoise coastal fringe
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    allBoundaries.forEach(poly => {
      drawGeoPath(ctx, poly, width, height);
      ctx.stroke();
    });
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 4. Africa (Sahara Desert Gold + Congo Emerald Rainforest + South Savannas)
    // -----------------------------------------------------------------------------
    ctx.save();
    const africaGrad = ctx.createLinearGradient(
      width * 0.50, height * 0.28,
      width * 0.58, height * 0.70
    );
    africaGrad.addColorStop(0.00, '#e5be82');
    africaGrad.addColorStop(0.18, '#d4a363');
    africaGrad.addColorStop(0.32, '#e0b878');
    africaGrad.addColorStop(0.42, '#85894b');
    africaGrad.addColorStop(0.52, '#1b4d2e');
    africaGrad.addColorStop(0.62, '#2d6a4f');
    africaGrad.addColorStop(0.80, '#736b3b');
    africaGrad.addColorStop(1.00, '#2e5d32');

    ctx.fillStyle = africaGrad;
    drawGeoPath(ctx, AFRICA_BOUNDARY, width, height);
    ctx.fill();

    // Madagascar
    const madagascarGrad = ctx.createLinearGradient(width * 0.62, height * 0.55, width * 0.65, height * 0.70);
    madagascarGrad.addColorStop(0, '#2d6a4f');
    madagascarGrad.addColorStop(0.5, '#855b32');
    madagascarGrad.addColorStop(1, '#1b4d2e');
    ctx.fillStyle = madagascarGrad;
    drawGeoPath(ctx, MADAGASCAR_BOUNDARY, width, height);
    ctx.fill();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 5. Arabian Peninsula (Warm sandy desert dunes)
    // -----------------------------------------------------------------------------
    ctx.save();
    const arabiaGrad = ctx.createLinearGradient(width * 0.58, height * 0.32, width * 0.65, height * 0.44);
    arabiaGrad.addColorStop(0, '#e2bd85');
    arabiaGrad.addColorStop(0.5, '#caa066');
    arabiaGrad.addColorStop(1, '#dfb375');
    ctx.fillStyle = arabiaGrad;
    drawGeoPath(ctx, ARABIA_BOUNDARY, width, height);
    ctx.fill();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 6. Europe (Temperate lush greens & Alps snow caps)
    // -----------------------------------------------------------------------------
    ctx.save();
    const europeGrad = ctx.createLinearGradient(width * 0.48, height * 0.15, width * 0.55, height * 0.32);
    europeGrad.addColorStop(0, '#3f6212');
    europeGrad.addColorStop(0.5, '#4d7c0f');
    europeGrad.addColorStop(1, '#2f5728');
    ctx.fillStyle = europeGrad;
    drawGeoPath(ctx, EUROPE_BOUNDARY, width, height);
    ctx.fill();

    // British Isles
    ctx.fillStyle = '#3f6212';
    drawGeoPath(ctx, UK_BOUNDARY, width, height);
    ctx.fill();

    // Alps Snow Crest
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#93c5fd';
    ctx.shadowBlur = 4;
    const [alpsX, alpsY] = geoToCanvas(46.5, 9.0, width, height);
    ctx.beginPath();
    ctx.ellipse(alpsX, alpsY, 18, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 7. Asia Mainland & Tibetan Plateau & Himalayas
    // -----------------------------------------------------------------------------
    ctx.save();
    const asiaGrad = ctx.createLinearGradient(
      width * 0.65, height * 0.15,
      width * 0.80, height * 0.45
    );
    asiaGrad.addColorStop(0.00, '#4b6043');
    asiaGrad.addColorStop(0.25, '#caa068');
    asiaGrad.addColorStop(0.40, '#a38452');
    asiaGrad.addColorStop(0.60, '#2d5a27');
    asiaGrad.addColorStop(0.85, '#1b4d2e');
    asiaGrad.addColorStop(1.00, '#15803d');
    ctx.fillStyle = asiaGrad;
    drawGeoPath(ctx, ASIA_MAINLAND_BOUNDARY, width, height);
    ctx.fill();

    // Indonesian Archipelago & Japan
    const seaIslandGrad = ctx.createLinearGradient(width * 0.75, height * 0.45, width * 0.88, height * 0.60);
    seaIslandGrad.addColorStop(0, '#166534');
    seaIslandGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = seaIslandGrad;
    drawGeoPath(ctx, SUMATRA_BOUNDARY, width, height);
    ctx.fill();
    drawGeoPath(ctx, BORNEO_BOUNDARY, width, height);
    ctx.fill();
    drawGeoPath(ctx, JAVA_BOUNDARY, width, height);
    ctx.fill();
    drawGeoPath(ctx, JAPAN_HONSHU_BOUNDARY, width, height);
    ctx.fill();

    // The Great Himalayan Mountain Ridge (Snow-white peak crest)
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#e0f2fe';
    ctx.shadowBlur = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const [h1x, h1y] = geoToCanvas(35.5, 75.0, width, height);
    const [h2x, h2y] = geoToCanvas(31.0, 79.5, width, height);
    const [h3x, h3y] = geoToCanvas(28.2, 85.0, width, height); // Mt Everest
    const [h4x, h4y] = geoToCanvas(27.8, 90.0, width, height); // Bhutan
    const [h5x, h5y] = geoToCanvas(28.5, 96.0, width, height); // Namcha Barwa
    ctx.moveTo(h1x, h1y);
    ctx.quadraticCurveTo(h2x, h2y, h3x, h3y);
    ctx.quadraticCurveTo(h4x, h4y, h5x, h5y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 8. India (Sovereign Subcontinent in Verdant Greens, Deccan Terracotta & Western Ghats)
    // -----------------------------------------------------------------------------
    ctx.save();
    const indiaGrad = ctx.createLinearGradient(
      width * 0.70, height * 0.28,
      width * 0.73, height * 0.48
    );
    indiaGrad.addColorStop(0.0, '#3f6212');
    indiaGrad.addColorStop(0.2, '#4d7c0f');
    indiaGrad.addColorStop(0.4, '#7c5a28');
    indiaGrad.addColorStop(0.7, '#1b4d2e');
    indiaGrad.addColorStop(1.0, '#15803d');
    ctx.fillStyle = indiaGrad;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.fill();

    // Sri Lanka teardrop island
    const [slX, slY] = geoToCanvas(7.8, 80.7, width, height);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(slX, slY, 6, 9, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Golden boundary sheen along Indian coastlines
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.stroke();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 9. Australia (Distinctive Red-Ochre Outback & Eucalyptus Green Coastal Rim)
    // -----------------------------------------------------------------------------
    ctx.save();
    const ausGrad = ctx.createRadialGradient(
      width * 0.87, height * 0.65, 20,
      width * 0.87, height * 0.65, 110
    );
    ausGrad.addColorStop(0.0, '#c2410c'); // Red desert sand
    ausGrad.addColorStop(0.4, '#9a3412');
    ausGrad.addColorStop(0.7, '#7c2d12');
    ausGrad.addColorStop(0.9, '#3f5728');
    ausGrad.addColorStop(1.0, '#2d5a27');
    ctx.fillStyle = ausGrad;
    drawGeoPath(ctx, AUSTRALIA_BOUNDARY, width, height);
    ctx.fill();

    // Tasmania
    ctx.fillStyle = '#2d5a27';
    drawGeoPath(ctx, TASMANIA_BOUNDARY, width, height);
    ctx.fill();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 10. The Americas (South America & North America)
    // -----------------------------------------------------------------------------
    ctx.save();
    const samGrad = ctx.createLinearGradient(width * 0.28, height * 0.40, width * 0.35, height * 0.78);
    samGrad.addColorStop(0, '#15803d');
    samGrad.addColorStop(0.3, '#166534');
    samGrad.addColorStop(0.7, '#65532f');
    samGrad.addColorStop(1, '#4a4436');
    ctx.fillStyle = samGrad;
    drawGeoPath(ctx, SOUTH_AMERICA_BOUNDARY, width, height);
    ctx.fill();

    const namGrad = ctx.createLinearGradient(width * 0.20, height * 0.15, width * 0.28, height * 0.40);
    namGrad.addColorStop(0, '#475569');
    namGrad.addColorStop(0.4, '#3f6212');
    namGrad.addColorStop(0.8, '#a16207');
    namGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = namGrad;
    drawGeoPath(ctx, NORTH_AMERICA_BOUNDARY, width, height);
    ctx.fill();
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 11. Antarctica Polar Glacial Ice Cap
    // -----------------------------------------------------------------------------
    ctx.save();
    const iceGrad = ctx.createLinearGradient(0, height * 0.88, 0, height);
    iceGrad.addColorStop(0, 'rgba(224, 242, 254, 0.0)');
    iceGrad.addColorStop(0.2, 'rgba(240, 249, 255, 0.8)');
    iceGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);
    ctx.restore();

    // -----------------------------------------------------------------------------
    // 12. Soft Realistic Atmospheric Swirls & Cloud Formations
    // -----------------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;

    const [c1x, c1y] = geoToCanvas(48.0, 140.0, width, height);
    ctx.beginPath();
    ctx.arc(c1x, c1y, 45, 0, Math.PI * 1.5);
    ctx.arc(c1x + 20, c1y + 10, 30, 0, Math.PI);
    ctx.fill();

    const [c2x, c2y] = geoToCanvas(32.0, 88.0, width, height);
    ctx.beginPath();
    ctx.ellipse(c2x, c2y, 80, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();

    const [c3x, c3y] = geoToCanvas(3.0, 78.0, width, height);
    ctx.beginPath();
    ctx.ellipse(c3x, c3y, 120, 22, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const [c4x, c4y] = geoToCanvas(-6.0, 92.0, width, height);
    ctx.beginPath();
    ctx.ellipse(c4x, c4y, 90, 16, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (mode === 'night') {
    // -----------------------------------------------------------------------------
    // Night Mode: Midnight obsidian waters with glowing city cluster lights
    // -----------------------------------------------------------------------------
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#091322';
    [
      AFRICA_BOUNDARY,
      ARABIA_BOUNDARY,
      EUROPE_BOUNDARY,
      INDIA_BOUNDARY,
      AUSTRALIA_BOUNDARY,
      ASIA_MAINLAND_BOUNDARY,
    ].forEach(poly => {
      drawGeoPath(ctx, poly, width, height);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;

    const metros = [
      { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, count: 240, spread: 26 },
      { name: 'Mumbai MMR', lat: 19.0760, lng: 72.8777, count: 220, spread: 20 },
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, count: 190, spread: 18 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, count: 160, spread: 16 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, count: 170, spread: 18 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, count: 180, spread: 20 },
      { name: 'Ahmedabad / Surat', lat: 23.0225, lng: 72.5714, count: 150, spread: 22 },
      { name: 'Dubai', lat: 25.2048, lng: 55.2708, count: 160, spread: 14 },
      { name: 'Singapore', lat: 1.3521, lng: 103.8198, count: 140, spread: 12 },
      { name: 'London', lat: 51.5074, lng: -0.1278, count: 200, spread: 22 },
      { name: 'Paris', lat: 48.8566, lng: 2.3522, count: 180, spread: 20 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503, count: 250, spread: 24 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, count: 150, spread: 16 },
    ];

    metros.forEach(metro => {
      const [cx, cy] = geoToCanvas(metro.lat, metro.lng, width, height);
      for (let i = 0; i < metro.count; i++) {
        const rad = Math.random() * metro.spread;
        const angle = Math.random() * Math.PI * 2;
        const px = cx + Math.cos(angle) * rad * 1.3;
        const py = cy + Math.sin(angle) * rad;
        const size = Math.random() * 2.0 + 0.6;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.shadowBlur = 0;

  } else if (mode === 'radar') {
    // -----------------------------------------------------------------------------
    // Tactical Radar Mode
    // -----------------------------------------------------------------------------
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;

    for (let y = 0; y < height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x < width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#082f49';
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 12;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;

  } else {
    // -----------------------------------------------------------------------------
    // Topographic Elevation Mode
    // -----------------------------------------------------------------------------
    const topoGrad = ctx.createLinearGradient(0, 0, 0, height);
    topoGrad.addColorStop(0, '#172554');
    topoGrad.addColorStop(0.3, '#1e3a8a');
    topoGrad.addColorStop(0.5, '#0e7490');
    topoGrad.addColorStop(0.7, '#1e3a8a');
    topoGrad.addColorStop(1, '#172554');
    ctx.fillStyle = topoGrad;
    ctx.fillRect(0, 0, width, height);

    const elevGrad = ctx.createLinearGradient(
      width * 0.70, height * 0.28,
      width * 0.73, height * 0.48
    );
    elevGrad.addColorStop(0, '#ffffff'); // Himalayas snow
    elevGrad.addColorStop(0.2, '#f59e0b');
    elevGrad.addColorStop(0.4, '#16a34a');
    elevGrad.addColorStop(0.7, '#ea580c');
    elevGrad.addColorStop(1, '#059669');
    ctx.fillStyle = elevGrad;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates dynamic animated weather overlay texture
 */
export function createWeatherOverlayTexture(type: WeatherOverlayType, timeOffset: number = 0): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  if (type === 'none') {
    return new THREE.CanvasTexture(canvas);
  }

  if (type === 'clouds') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;

    const clouds = [
      { lat: 31.0, lng: 76.0, r: 42 },
      { lat: 26.0, lng: 85.0, r: 55 },
      { lat: 21.0, lng: 73.0, r: 38 },
      { lat: 14.0, lng: 75.0, r: 48 },
      { lat: 10.0, lng: 77.0, r: 35 },
      { lat: 18.0, lng: 86.0, r: 52 },
      { lat: 48.0, lng: 135.0, r: 60 },
      { lat: 5.0, lng: 82.0, r: 45 },
      { lat: -5.0, lng: 95.0, r: 50 },
    ];

    clouds.forEach((cloud, i) => {
      const wobble = Math.sin(timeOffset * 0.8 + i) * 6;
      const [cx, cy] = geoToCanvas(cloud.lat, cloud.lng, width, height);
      ctx.beginPath();
      ctx.arc(cx + wobble, cy, cloud.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

  } else if (type === 'precipitation') {
    const rainCells = [
      { lat: 18.9, lng: 72.8, r: 36, color: 'rgba(34, 197, 94, 0.7)' },
      { lat: 15.3, lng: 73.8, r: 30, color: 'rgba(59, 130, 246, 0.75)' },
      { lat: 9.9, lng: 76.2, r: 42, color: 'rgba(239, 68, 68, 0.65)' },
      { lat: 22.5, lng: 88.3, r: 32, color: 'rgba(234, 179, 8, 0.7)' },
    ];

    rainCells.forEach(cell => {
      const [cx, cy] = geoToCanvas(cell.lat, cell.lng, width, height);
      const radGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, cell.r);
      radGrad.addColorStop(0, cell.color);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cell.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === 'wind') {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.75;

    for (let lat = 8; lat <= 36; lat += 4) {
      for (let lng = 68; lng <= 95; lng += 5) {
        const [x, y] = geoToCanvas(lat, lng, width, height);
        const windAngle = -Math.PI / 4;
        const length = 16;
        const animatedOffset = (timeOffset * 20) % 20;

        const startX = x + Math.cos(windAngle) * animatedOffset;
        const startY = y + Math.sin(windAngle) * animatedOffset;
        const endX = startX + Math.cos(windAngle) * length;
        const endY = startY + Math.sin(windAngle) * length;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  } else if (type === 'temp') {
    const [northX, northY] = geoToCanvas(36, 78, width, height);
    const [southX, southY] = geoToCanvas(8, 78, width, height);

    const tempGrad = ctx.createLinearGradient(northX, northY, southX, southY);
    tempGrad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    tempGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.35)');
    tempGrad.addColorStop(0.65, 'rgba(234, 179, 8, 0.38)');
    tempGrad.addColorStop(1, 'rgba(239, 68, 68, 0.45)');

    ctx.fillStyle = tempGrad;
    drawGeoPath(ctx, INDIA_BOUNDARY, width, height);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
