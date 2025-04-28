import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Business, InsertBusiness, businesses } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { log } from '../vite';

interface CsvBusinessData {
  business_name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: string;
  longitude: string;
  rating: string;
  review_count: string;
  website: string;
  google_place_id: string;
  google_reviews_url: string;
  facebook_url: string;
  instagram_url: string;
}

export async function seedBusinessesFromCsv(): Promise<void> {
  try {
    if (process.env.SKIP_CSV_SEED === 'true') {
      log('CSV seeding skipped due to SKIP_CSV_SEED=true environment variable', 'seedFromCsv');
      return;
    }

    // Check if we already have businesses in the database
    const existingBusinesses = await db.select().from(businesses);
    
    if (existingBusinesses.length > 0) {
      log(`Found ${existingBusinesses.length} existing businesses, will only seed missing entries`, 'seedFromCsv');
    } else {
      log('No existing businesses found, will seed from CSV', 'seedFromCsv');
    }

    // Read CSV file
    const csvPath = path.resolve('./attached_assets/hvac_sample_outscraper.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV data
    const records: CsvBusinessData[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    log(`Found ${records.length} businesses in CSV file`, 'seedFromCsv');

    // Keep track of how many businesses we've inserted
    let insertedCount = 0;
    let skippedCount = 0;

    // Insert each business
    for (const record of records) {
      // Check if business with this slug already exists
      const existingBusiness = await db.select()
        .from(businesses)
        .where(eq(businesses.slug, record.slug));

      if (existingBusiness.length > 0) {
        log(`Business with slug '${record.slug}' already exists, skipping`, 'seedFromCsv');
        skippedCount++;
        continue;
      }

      // Map CSV data to InsertBusiness schema
      const businessData: InsertBusiness = {
        name: record.business_name,
        slug: record.slug,
        phone: record.phone,
        email: record.email,
        address: record.address,
        city: record.city,
        state: record.state,
        zip: record.zip,
        website: record.website,
        vertical: 'hvac', // Default to HVAC as per requirements
        isProspect: true,
        leadStatus: 'new',
        // Add other optional fields from CSV as available
        settings: JSON.stringify({
          social: {
            facebook: record.facebook_url || null,
            instagram: record.instagram_url || null
          },
          googleMaps: {
            placeId: record.google_place_id || null,
            reviewsUrl: record.google_reviews_url || null,
            rating: parseFloat(record.rating) || null,
            reviewCount: parseInt(record.review_count) || null
          },
          location: {
            latitude: parseFloat(record.latitude) || null,
            longitude: parseFloat(record.longitude) || null
          }
        })
      };

      // Insert into database
      await db.insert(businesses).values(businessData);
      insertedCount++;
      log(`Inserted business: ${record.business_name}`, 'seedFromCsv');
    }

    log(`CSV seeding completed. Inserted ${insertedCount} businesses, skipped ${skippedCount} businesses.`, 'seedFromCsv');
  } catch (error) {
    log(`Error seeding businesses from CSV: ${error}`, 'seedFromCsv');
    throw error;
  }
}