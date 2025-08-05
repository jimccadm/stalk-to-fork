import { GridReference } from '../types';
// @ts-ignore
import OsGridRef from 'geodesy/osgridref.js';

// UK Grid Reference conversion utilities
// Based on Ordnance Survey National Grid

const GRID_LETTERS = [
  ['SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TW'],
  ['SQ', 'SR', 'SS', 'ST', 'SU', 'TQ', 'TR'],
  ['SL', 'SM', 'SN', 'SO', 'SP', 'TL', 'TM'],
  ['SF', 'SG', 'SH', 'SJ', 'SK', 'TF', 'TG'],
  ['SA', 'SB', 'SC', 'SD', 'SE', 'TA', 'TB'],
  ['NV', 'NW', 'NX', 'NY', 'NZ', 'OV', 'OW'],
  ['NQ', 'NR', 'NS', 'NT', 'NU', 'OQ', 'OR'],
  ['NL', 'NM', 'NN', 'NO', 'NP', 'OL', 'OM'],
  ['NF', 'NG', 'NH', 'NJ', 'NK', 'OF', 'OG'],
  ['NA', 'NB', 'NC', 'ND', 'NE', 'OA', 'OB'],
  ['HV', 'HW', 'HX', 'HY', 'HZ', 'JV', 'JW'],
  ['HQ', 'HR', 'HS', 'HT', 'HU', 'JQ', 'JR'],
  ['HL', 'HM', 'HN', 'HO', 'HP', 'JL', 'JM']
];

/**
 * Parse a UK Grid Reference string into components
 * Supports formats like: SO123456, SO 123 456, SO1234, etc.
 */
export function parseGridReference(gridRef: string): GridReference | null {
  // Remove spaces and convert to uppercase
  const cleanRef = gridRef.replace(/\s/g, '').toUpperCase();
  
  // Match pattern: 2 letters followed by digits
  const match = cleanRef.match(/^([A-Z]{2})(\d+)$/);
  if (!match) return null;

  const [, letters, digits] = match;
  
  // Digits must be even length (equal easting and northing)
  if (digits.length % 2 !== 0) return null;
  
  const precision = digits.length / 2;
  const eastingStr = digits.substring(0, precision);
  const northingStr = digits.substring(precision);
  
  // Find grid square
  let gridSquareEasting = -1;
  let gridSquareNorthing = -1;
  
  for (let row = 0; row < GRID_LETTERS.length; row++) {
    for (let col = 0; col < GRID_LETTERS[row].length; col++) {
      if (GRID_LETTERS[row][col] === letters) {
        gridSquareEasting = col;
        gridSquareNorthing = GRID_LETTERS.length - 1 - row;
        break;
      }
    }
    if (gridSquareEasting !== -1) break;
  }
  
  if (gridSquareEasting === -1) return null;
  
  // Calculate full coordinates
  const multiplier = Math.pow(10, 5 - precision);
  const easting = gridSquareEasting * 100000 + parseInt(eastingStr) * multiplier;
  const northing = gridSquareNorthing * 100000 + parseInt(northingStr) * multiplier;
  
  return {
    easting,
    northing,
    precision
  };
}

/**
 * Convert UK Grid Reference to WGS84 latitude/longitude
 * Uses the accurate geodesy library for proper OSGB36 to WGS84 conversion
 */
export function gridRefToLatLng(gridRef: string): { lat: number; lng: number } | null {
  try {
    // Use the geodesy library for accurate conversion
    const osGridRef = OsGridRef.parse(gridRef);
    const wgs84 = osGridRef.toLatLon();

    return {
      lat: wgs84.lat,
      lng: wgs84.lon
    };
  } catch (error) {
    console.error('Error converting grid reference:', gridRef, error);
    return null;
  }
}

/**
 * Validate UK Grid Reference format
 */
export function isValidGridReference(gridRef: string): boolean {
  return parseGridReference(gridRef) !== null;
}

/**
 * Format grid reference for display
 */
export function formatGridReference(gridRef: string): string {
  const parsed = parseGridReference(gridRef);
  if (!parsed) return gridRef;
  
  const cleanRef = gridRef.replace(/\s/g, '').toUpperCase();
  const match = cleanRef.match(/^([A-Z]{2})(\d+)$/);
  if (!match) return gridRef;
  
  const [, letters, digits] = match;
  const precision = digits.length / 2;
  const easting = digits.substring(0, precision);
  const northing = digits.substring(precision);
  
  return `${letters} ${easting} ${northing}`;
}

/**
 * Get grid reference precision in meters
 */
export function getGridReferencePrecision(gridRef: string): number | null {
  const parsed = parseGridReference(gridRef);
  if (!parsed) return null;
  
  return Math.pow(10, 5 - parsed.precision);
}

/**
 * Check if a grid reference is within Herefordshire bounds (approximate)
 */
export function isInHerefordshire(gridRef: string): boolean {
  const latLng = gridRefToLatLng(gridRef);
  if (!latLng) return false;

  // Approximate bounds for Herefordshire
  const bounds = {
    north: 52.4,
    south: 51.8,
    east: -2.3,
    west: -3.2
  };

  return (
    latLng.lat >= bounds.south &&
    latLng.lat <= bounds.north &&
    latLng.lng >= bounds.west &&
    latLng.lng <= bounds.east
  );
}

/**
 * Test function to debug grid reference conversion
 */
export function testGridRefConversion() {
  // Test known Herefordshire locations
  const testRefs = [
    'SO 600 400', // Should be near Hereford
    'SO 620 390', // Should be east of Hereford
    'SO 580 410', // Should be northwest of Hereford
    'SO 514 398', // Hereford Cathedral (known reference point)
  ];

  console.log('Testing grid reference conversions with geodesy library:');
  testRefs.forEach(ref => {
    const result = gridRefToLatLng(ref);
    console.log(`${ref} -> ${result ? `${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}` : 'null'}`);
  });
}
