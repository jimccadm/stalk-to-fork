export interface DeerStalkingRecord {
  id?: number;
  date: string; // ISO date string
  species: string;
  sex: 'Male' | 'Female' | 'Unknown';
  maturity: 'Adult' | 'Juvenile' | 'Unknown';
  weight: number; // in kg
  gridRef: string; // UK Grid Reference
  location: string;
  shooter: string;
  remarks?: string;
  timeOfDay: 'Dawn' | 'Morning' | 'Afternoon' | 'Dusk' | 'Night';
  createdAt?: string;
  updatedAt?: string;
}

export interface GridReference {
  easting: number;
  northing: number;
  precision: number;
}

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  record: DeerStalkingRecord;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface AppState {
  theme: Theme;
  records: DeerStalkingRecord[];
  loading: boolean;
  error: string | null;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Species options for dropdown
export const DEER_SPECIES = [
  'Red Deer',
  'Roe Deer',
  'Fallow Deer',
  'Sika Deer',
  'Muntjac',
  'Chinese Water Deer',
  'Other'
] as const;

export type DeerSpecies = typeof DEER_SPECIES[number];

// Time of day options
export const TIME_OF_DAY_OPTIONS = [
  'Dawn',
  'Morning', 
  'Afternoon',
  'Dusk',
  'Night'
] as const;

export type TimeOfDay = typeof TIME_OF_DAY_OPTIONS[number];

// Sex options
export const SEX_OPTIONS = [
  'Male',
  'Female',
  'Unknown'
] as const;

export type Sex = typeof SEX_OPTIONS[number];

// Maturity options
export const MATURITY_OPTIONS = [
  'Adult',
  'Juvenile',
  'Unknown'
] as const;

export type Maturity = typeof MATURITY_OPTIONS[number];
