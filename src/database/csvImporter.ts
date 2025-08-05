import { DeerStalkingRecord } from '../types';
import { getDatabase } from './database';

// Helper functions for data normalization
function parseCSVDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle various date formats from the CSV
    let cleanDate = dateStr.trim();
    
    // Handle dates like "08-Apr-23", "01-Jun-23", etc.
    if (cleanDate.includes('-') && cleanDate.length <= 9) {
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1];
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        
        // Convert month abbreviation to number
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const monthNum = monthMap[month];
        if (monthNum) {
          return `${year}-${monthNum}-${day}`;
        }
      }
    }
    
    // Handle dates like "16-Oct" (missing year)
    if (cleanDate.includes('-') && !cleanDate.includes('2')) {
      const parts = cleanDate.split('-');
      if (parts.length === 2) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1];
        
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const monthNum = monthMap[month];
        if (monthNum) {
          // Assume current year or previous year based on context
          return `2023-${monthNum}-${day}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
}

function normalizeCSVSpecies(species: string): string {
  if (!species || species.trim() === '') return 'Unknown';
  
  const normalized = species.trim().toUpperCase();
  
  // Map CSV species to our standard format
  switch (normalized) {
    case 'FALLOW':
      return 'Fallow Deer';
    case 'MUNTJAC':
      return 'Muntjac';
    case 'ROE':
      return 'Roe Deer';
    case 'FOX':
      return 'Fox';
    default:
      return species.trim();
  }
}

function normalizeCSVSex(sex: string): 'Male' | 'Female' | 'Unknown' {
  if (!sex || sex.trim() === '') return 'Unknown';

  const normalized = sex.trim().toUpperCase();
  if (normalized === 'M' || normalized === 'MALE') return 'Male';
  if (normalized === 'F' || normalized === 'FEMALE') return 'Female';
  return 'Unknown';
}

function normalizeCSVMaturity(maturity: string): 'Adult' | 'Juvenile' | 'Unknown' {
  if (!maturity || maturity.trim() === '') return 'Unknown';

  const normalized = maturity.trim().toUpperCase();

  // Map CSV maturity values to our standard format
  if (normalized.includes('ADULT') || normalized.includes('BUCK') || normalized.includes('DOE') ||
      normalized.includes('STAG') || normalized.includes('HIND') || normalized.includes('SORREL') ||
      normalized.includes('PRICKET') || normalized.includes('SORE') || normalized.includes('BARE')) {
    return 'Adult';
  }

  if (normalized.includes('FAWN') || normalized.includes('JUVENILE') || normalized.includes('YOUNG') ||
      normalized.includes('YEARLING')) {
    return 'Juvenile';
  }

  return 'Unknown';
}

function normalizeCSVGridRef(gridRef: string): string {
  if (!gridRef || gridRef.trim() === '' || gridRef.trim() === 'N/K') return '';
  
  let normalized = gridRef.trim().toUpperCase();
  
  // Handle grid references like "600 393" -> "SO 600 393"
  if (/^\d{3}\s+\d{3}$/.test(normalized)) {
    normalized = 'SO ' + normalized;
  }
  
  // Handle malformed grid refs
  if (normalized.includes('6065 3922')) {
    normalized = 'SO 606 392'; // Fix obvious typo
  }
  
  if (normalized.includes('307 643')) {
    normalized = 'SO 607 643'; // Fix obvious typo
  }
  
  return normalized;
}

function normalizeCSVTimeOfDay(timeOfDay: string): 'Dawn' | 'Morning' | 'Afternoon' | 'Dusk' | 'Night' {
  if (!timeOfDay || timeOfDay.trim() === '') return 'Morning'; // Default to Morning instead of Unknown

  const normalized = timeOfDay.trim().toUpperCase();
  if (normalized === 'AM' || normalized === 'MORNING') return 'Morning';
  if (normalized === 'PM' || normalized === 'AFTERNOON' || normalized === 'EVENING') return 'Afternoon';
  if (normalized === 'DAWN') return 'Dawn';
  if (normalized === 'DUSK') return 'Dusk';
  if (normalized === 'NIGHT') return 'Night';

  // Default to Morning for unknown values
  return 'Morning';
}

function normalizeCSVLocation(location: string): string {
  if (!location || location.trim() === '') return 'Unknown Location';
  
  // Clean up location names
  let normalized = location.trim();
  
  // Fix common variations
  normalized = normalized.replace(/\s+/g, ' '); // Multiple spaces to single space
  normalized = normalized.replace(/LEANING TOWER\s*$/, 'LEANING TOWER');
  normalized = normalized.replace(/FRITH\s*WOODS?/, 'FRITH WOODS');
  normalized = normalized.replace(/DORMINGTON\s*WOODS?/, 'DORMINGTON WOODS');
  
  return normalized;
}

// Function to check if a record already exists (to avoid duplicates)
function recordExists(db: any, record: Omit<DeerStalkingRecord, 'id' | 'createdAt' | 'updatedAt'>): boolean {
  const existingRecords = db.getAllRecords();
  
  return existingRecords.some((existing: DeerStalkingRecord) => 
    existing.date === record.date &&
    existing.species === record.species &&
    existing.sex === record.sex &&
    existing.maturity === record.maturity &&
    existing.weight === record.weight &&
    existing.gridRef === record.gridRef &&
    existing.location === record.location &&
    existing.timeOfDay === record.timeOfDay
  );
}

export function importCSVData(csvContent: string): { imported: number; skipped: number; errors: number } {
  const db = getDatabase();
  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    try {
      const columns = line.split(',');
      
      // Skip lines that don't have enough data
      if (columns.length < 8) {
        skippedCount++;
        continue;
      }
      
      const [ser, dateStr, species, sex, maturity, weightStr, gridRef, location, timeOfDay] = columns;
      
      // Skip entries without species data or empty entries
      if (!species || species.trim() === '' || !dateStr || dateStr.trim() === '') {
        skippedCount++;
        continue;
      }
      
      const parsedDate = parseCSVDate(dateStr);
      if (!parsedDate) {
        console.warn('Could not parse date:', dateStr);
        skippedCount++;
        continue;
      }
      
      const normalizedSpecies = normalizeCSVSpecies(species);
      if (normalizedSpecies === 'Unknown') {
        skippedCount++;
        continue;
      }
      
      const weight = weightStr && weightStr.trim() !== '' && weightStr.trim() !== 'N/A' 
        ? parseFloat(weightStr.replace(/[!"]/g, '')) || 0 
        : 0;
      
      const record: Omit<DeerStalkingRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: parsedDate,
        species: normalizedSpecies,
        sex: normalizeCSVSex(sex),
        maturity: normalizeCSVMaturity(maturity),
        weight: weight,
        gridRef: normalizeCSVGridRef(gridRef),
        location: normalizeCSVLocation(location),
        shooter: 'CSV Import',
        timeOfDay: normalizeCSVTimeOfDay(timeOfDay),
        remarks: ser ? `Serial: ${ser}` : '',
      };
      
      // Check if record already exists
      if (recordExists(db, record)) {
        skippedCount++;
        continue;
      }
      
      db.insertRecord(record);
      importedCount++;
      
    } catch (error) {
      console.error('Error processing line:', line, error);
      errorCount++;
    }
  }
  
  return { imported: importedCount, skipped: skippedCount, errors: errorCount };
}
