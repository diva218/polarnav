/**
 * Antarctic Station CSV Parser & Normalizer
 * Robust CSV parsing handling quoted values, clean UTF-8 strings, and geospatial coordinate verification.
 */

import rawCsvText from './antarctic_facilities.csv?raw';

/**
 * Standard CSV line parser that properly handles quotes with commas inside
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Clean numeric string (e.g. "1,382" -> 1382)
 */
function cleanNumber(val) {
  if (!val) return null;
  const cleaned = val.replace(/["',]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse raw CSV string into normalized station records
 */
export function parseStationCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length < 12) continue; // Skip malformed rows

    const recordId = row[0] || `row-${i}`;
    const englishName = (row[1] || '').trim();
    const officialName = (row[2] || '').trim();
    const operatorPrimary = (row[3] || '').trim();
    const operatorAdditional = (row[4] || '').trim();
    const type = (row[5] || 'Station').trim();
    const seasonality = (row[6] || 'Seasonal').trim();
    const status = (row[7] || 'Open').trim();
    const yearEstablished = cleanNumber(row[8]);
    const region = (row[9] || '').trim();
    
    // Parse latitude & longitude (ensure Antarctic latitudes are South, i.e. negative)
    let rawLat = parseFloat(row[10]);
    let rawLng = parseFloat(row[11]);
    if (isNaN(rawLat) || isNaN(rawLng)) continue;

    // Antarctica is entirely south of 60°S (all latitudes must be negative)
    const lat = rawLat > 0 ? -rawLat : rawLat;
    const lng = rawLng;

    const latDDM = (row[12] || '').trim();
    const lngDDM = (row[13] || '').trim();
    const elevation = cleanNumber(row[14]);
    const elevationDatum = (row[15] || '').trim();
    const peakPopulation = cleanNumber(row[16]);
    const powerSupply = (row[17] || '').trim();
    const photoUrl = (row[18] || '').trim();
    const webcamUrl = (row[19] || '').trim();

    // Standard normalized facility model
    records.push({
      id: `station-${recordId}`,
      recordId,
      name: englishName || officialName || `Facility ${recordId}`,
      officialName: officialName || englishName,
      country: operatorPrimary || 'International',
      operator: operatorPrimary + (operatorAdditional ? ` / ${operatorAdditional}` : ''),
      operatorPrimary,
      operatorAdditional: operatorAdditional || null,
      type: type || 'Facility',
      isResearchStation: type.toLowerCase() === 'station',
      seasonality: seasonality || 'Seasonal',
      isYearRound: seasonality.toLowerCase() === 'year-round',
      isSeasonal: seasonality.toLowerCase() === 'seasonal',
      status: status || 'Open',
      isOpen: status.toLowerCase() === 'open',
      yearEstablished,
      region: region || null,
      latitude: lat,
      longitude: lng,
      coordinates: [lat, lng],
      latitudeDDM: latDDM || null,
      longitudeDDM: lngDDM || null,
      elevation,
      elevationDatum: elevationDatum || null,
      peakPopulation,
      powerSupply: powerSupply || null,
      photoUrl: photoUrl || null,
      webcamUrl: webcamUrl || null
    });
  }

  return records;
}

// Pre-parsed static station dataset
export const ANTARCTIC_FACILITIES = parseStationCsv(rawCsvText);
