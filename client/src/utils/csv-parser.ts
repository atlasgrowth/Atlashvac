import { OutscraperBusinessData } from '@shared/types';
import { Business } from '@shared/schema';

/**
 * Parse CSV content into array of objects
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  // Split by lines and get headers from first line
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data
  const results: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      console.warn(`Line ${i + 1} has ${values.length} values, expected ${headers.length}`);
      continue;
    }
    
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j];
    }
    results.push(obj);
  }
  
  return results;
}

/**
 * Parse a single CSV line, handling quotes and commas properly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Check if this is a double quote inside quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  return result;
}

/**
 * Transform CSV data to OutscraperBusinessData format
 */
export function transformCSVToBusinessData(csvData: Record<string, string>[]): OutscraperBusinessData[] {
  return csvData.map(record => {
    return {
      name: record.name || record.business_name || record.company || "",
      address: record.address || record.street_address || "",
      city: record.city || record.locality || "",
      state: record.state || record.region || record.province || "",
      zip: record.postal_code || record.zip || record.zip_code || "",
      phone: record.phone || record.phone_number || record.telephone || "",
      website: record.website || record.web || record.url || "",
      category: record.category || record.categories || record.business_type || "",
      description: record.description || record.about || "",
      reviews: parseInt(record.reviews || record.review_count || "0") || 0,
      rating: parseFloat(record.rating || record.stars || "0") || 0
    };
  });
}

/**
 * Import CSV data to the API
 */
export async function importCSV(csvContent: string, userId?: number): Promise<Business[]> {
  try {
    // Parse the CSV
    const csvData = parseCSV(csvContent);
    
    // Post to the API
    const response = await fetch('/api/businesses/import-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csv: csvContent,
        userId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to import CSV: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
}
