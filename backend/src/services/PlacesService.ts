import { Client } from '@googlemaps/google-maps-services-js';
import database from '../config/database';

export interface LeadData {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating?: number;
  reviewCount?: number;
  placeId: string;
}

export interface SearchParams {
  businessType: string;
  location: string;
  maxResults?: number;
  radius?: number;
}

export interface SearchProgress {
  found: number;
  total: number;
  isComplete: boolean;
  currentLocation?: string;
}

// 🆕 New interfaces for grid-based search
export interface CityBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: {
    lat: number;
    lng: number;
  };
}

export interface SearchGrid {
  lat: number;
  lng: number;
  radius: number;
  area: string; // "Area 1", "Area 2", etc.
}

/**
 * Google Places API Service
 * Provides legitimate API-based lead generation functionality
 * Replaces Selenium scraping with official Google Places API
 */
export class PlacesService {
  private client: Client;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Client({});
  }

  /**
   * Search for businesses using Google Places API with duplicate prevention
   * Equivalent to the original scraper's main functionality
   */
  async searchBusinesses(
    params: SearchParams,
    progressCallback?: (progress: SearchProgress) => void,
    userId?: number,
    shouldAbort?: () => boolean
  ): Promise<LeadData[]> {
    const { businessType, location, maxResults = 25, radius = 10000 } = params;

    try {
      console.log(`🔍 Starting Places API search: ${businessType} in ${location}`);
      
      // 1. Normalize location for consistent caching
      const normalizedLocation = await this.normalizeLocation(location);
      console.log(`📍 Normalized location: ${normalizedLocation}`);

      // 2. Check cache for existing leads (if userId provided)
      let cachedLeads: LeadData[] = [];
      let cachedPlaceIds = new Set<string>();
      
      if (userId) {
        cachedLeads = await this.getCachedLeads(userId, normalizedLocation, businessType);
        cachedPlaceIds = new Set(cachedLeads.map(lead => lead.placeId));
        console.log(`💾 Found ${cachedLeads.length} cached leads`);
      }

      // 3. Geocode the location to get coordinates
      const geocodeResponse = await this.client.geocode({
        params: {
          address: normalizedLocation,
          key: this.apiKey,
        },
      });

      if (!geocodeResponse.data.results.length) {
        throw new Error(`Location not found: ${location}`);
      }

      const firstResult = geocodeResponse.data.results[0];
      if (!firstResult?.geometry?.location) {
        throw new Error(`Invalid location data for: ${location}`);
      }

      const { lat, lng } = firstResult.geometry.location;
      console.log(`📍 Location geocoded: ${lat}, ${lng}`);

      // 4. Perform nearby search with pagination support
      const allApiPlaces: any[] = [];
      let nextPageToken: string | undefined;
      let pageCount = 0;
      const maxPages = Math.ceil(maxResults / 20); // Each page returns up to 20 results

      do {
        if (shouldAbort?.()) {
          console.log('⏹️ Aborting pagination due to shouldAbort() signal');
          break;
        }

        const nearbyParams: any = {
          location: { lat, lng },
          radius,
          type: businessType,
          key: this.apiKey,
        };

        if (nextPageToken) {
          nearbyParams.pagetoken = nextPageToken;
        }

        const nearbyResponse = await this.client.placesNearby({
          params: nearbyParams,
        });

        const pageResults = nearbyResponse.data.results || [];
        allApiPlaces.push(...pageResults);
        
        console.log(`📊 Page ${pageCount + 1}: Found ${pageResults.length} results (total: ${allApiPlaces.length})`);

        nextPageToken = nearbyResponse.data.next_page_token;
        pageCount++;

        // Google requires a short delay before using next_page_token
        if (nextPageToken && pageCount < maxPages && allApiPlaces.length < maxResults) {
          console.log('⏳ Waiting for next page token...');
          await this.delay(2000); // 2 second delay as required by Google
        }

      } while (nextPageToken && pageCount < maxPages && allApiPlaces.length < maxResults && !shouldAbort?.());

      console.log(`📊 Total API results across ${pageCount} pages: ${allApiPlaces.length}`);

      // 5. Process results and get details for new leads only
      const newLeads: LeadData[] = [];
      const apiPlaces = allApiPlaces.filter(place => place?.place_id && !cachedPlaceIds.has(place.place_id));
      
      console.log(`🆕 Processing ${apiPlaces.length} new places (${allApiPlaces.length - apiPlaces.length} already cached)`);

      for (let i = 0; i < Math.min(apiPlaces.length, maxResults - cachedLeads.length); i++) {
        if (shouldAbort?.()) {
          console.log('⏹️ Aborting details fetch due to shouldAbort() signal');
          break;
        }

        const place = apiPlaces[i];
        
        if (!place?.place_id) {
          console.warn('⚠️ Place missing place_id, skipping');
          continue;
        }
        
        try {
          // Get detailed information for each new place
          const details = await this.getPlaceDetails(place.place_id);
          if (details) {
            newLeads.push(details);
            
            // Send progress update
            if (progressCallback) {
              progressCallback({
                found: cachedLeads.length + newLeads.length,
                total: maxResults,
                isComplete: false,
                currentLocation: details.name
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get details for place ${place.place_id || 'unknown'}:`, error);
          continue;
        }

        // Add small delay to respect rate limits
        await this.delay(100);
      }

      // 6. Cache new leads for future searches
      if (userId && newLeads.length > 0) {
        await this.cacheLeads(userId, normalizedLocation, businessType, newLeads);
        console.log(`💾 Cached ${newLeads.length} new leads`);
      }

      // 7. Combine cached + new leads (up to maxResults)
      const allLeads = [...cachedLeads, ...newLeads].slice(0, maxResults);

      // Final progress update
      if (progressCallback) {
        progressCallback({
          found: allLeads.length,
          total: maxResults,
          isComplete: true
        });
      }

      console.log(`✅ Search completed: ${allLeads.length} total leads (${cachedLeads.length} cached, ${newLeads.length} new)`);
      return allLeads;

    } catch (error) {
      console.error('❌ Places API search failed:', error);
      throw new Error(`Failed to search businesses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize location string for consistent caching
   */
  private async normalizeLocation(location: string): Promise<string> {
    try {
      // Use Google Geocoding API to get the formatted address
      const geocodeResponse = await this.client.geocode({
        params: {
          address: location,
          key: this.apiKey,
        },
      });

      if (geocodeResponse.data.results.length > 0 && geocodeResponse.data.results[0]?.formatted_address) {
        return geocodeResponse.data.results[0].formatted_address;
      }
    } catch (error) {
      console.warn('⚠️ Failed to normalize location, using original:', error);
    }
    
    // Fallback to cleaned up version of original location
    return location.trim().toLowerCase();
  }

  /**
   * Get cached leads for a specific search combination
   */
  private async getCachedLeads(userId: number, location: string, businessType: string): Promise<LeadData[]> {
    try {
      const query = `
        SELECT lead_data 
        FROM search_cache 
        WHERE user_id = $1 AND location_normalized = $2 AND business_type = $3 
        AND expires_at > NOW()
        ORDER BY created_at DESC
      `;
      
      const result = await database.query(query, [userId, location, businessType]);
      return result.rows.map((row: any) => row.lead_data as LeadData);
    } catch (error) {
      console.error('❌ Failed to get cached leads:', error);
      return []; // Return empty array on error, don't fail the search
    }
  }

  /**
   * Cache new leads for future duplicate prevention
   */
  private async cacheLeads(userId: number, location: string, businessType: string, leads: LeadData[]): Promise<void> {
    try {
      for (const lead of leads) {
        const query = `
          INSERT INTO search_cache (user_id, location_normalized, business_type, place_id, lead_data)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, place_id) DO NOTHING
        `;
        
        await database.query(query, [
          userId, 
          location, 
          businessType, 
          lead.placeId, 
          JSON.stringify(lead)
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to cache leads:', error);
      // Don't fail the search if caching fails
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const query = `DELETE FROM search_cache WHERE expires_at < NOW()`;
      const result = await database.query(query);
      const deletedCount = result.rowCount || 0;
      console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup expired cache:', error);
      return 0;
    }
  }

  /**
   * Get detailed information for a specific place
   * Equivalent to detailed data extraction from original scraper
   */
  async getPlaceDetails(placeId: string): Promise<LeadData | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'place_id'
          ],
          key: this.apiKey,
        },
      });

      const place = response.data.result;
      
      return this.formatLeadData(place);
    } catch (error) {
      console.error('❌ Failed to get place details:', error);
      return null;
    }
  }

  /**
   * Format place data into standardized lead format
   * Matches the output structure of the original scraper
   */
  private formatLeadData(place: any): LeadData {
    return {
      name: place.name || 'Unknown Business',
      address: place.formatted_address || '',
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      placeId: place.place_id || ''
    };
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.client.geocode({
        params: {
          address: 'New York, NY',
          key: this.apiKey,
        },
      });
      
      return response.status === 200 && response.data.results.length > 0;
    } catch (error) {
      console.error('❌ API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get available business types for dropdown
   */
  static getBusinessTypes() {
    return [
      // Professional Services
      { value: 'dentist', label: 'Dentists', category: 'Professional Services' },
      { value: 'doctor', label: 'Medical Practices', category: 'Professional Services' },
      { value: 'lawyer', label: 'Law Firms', category: 'Professional Services' },
      { value: 'real_estate_agency', label: 'Real Estate Agencies', category: 'Professional Services' },
      { value: 'insurance_agency', label: 'Insurance Agencies', category: 'Professional Services' },
      { value: 'accounting', label: 'Accounting Firms', category: 'Professional Services' },
      
      // Food & Dining
      { value: 'restaurant', label: 'Restaurants', category: 'Food & Dining' },
      { value: 'cafe', label: 'Cafes', category: 'Food & Dining' },
      { value: 'bar', label: 'Bars & Pubs', category: 'Food & Dining' },
      { value: 'bakery', label: 'Bakeries', category: 'Food & Dining' },
      
      // Retail & Commerce
      { value: 'clothing_store', label: 'Clothing Stores', category: 'Retail & Commerce' },
      { value: 'electronics_store', label: 'Electronics Stores', category: 'Retail & Commerce' },
      { value: 'furniture_store', label: 'Furniture Stores', category: 'Retail & Commerce' },
      { value: 'jewelry_store', label: 'Jewelry Stores', category: 'Retail & Commerce' },
      { value: 'shoe_store', label: 'Shoe Stores', category: 'Retail & Commerce' },
      
      // Health & Beauty
      { value: 'beauty_salon', label: 'Beauty Salons', category: 'Health & Beauty' },
      { value: 'hair_care', label: 'Hair Salons', category: 'Health & Beauty' },
      { value: 'spa', label: 'Spas', category: 'Health & Beauty' },
      { value: 'gym', label: 'Gyms & Fitness Centers', category: 'Health & Beauty' },
      
      // Automotive
      { value: 'car_repair', label: 'Auto Repair Shops', category: 'Automotive' },
      { value: 'car_dealer', label: 'Car Dealerships', category: 'Automotive' },
      { value: 'gas_station', label: 'Gas Stations', category: 'Automotive' },
      
      // Home Services
      { value: 'plumber', label: 'Plumbers', category: 'Home Services' },
      { value: 'electrician', label: 'Electricians', category: 'Home Services' },
      { value: 'general_contractor', label: 'Contractors', category: 'Home Services' },
      { value: 'roofing_contractor', label: 'Roofing Companies', category: 'Home Services' },
      { value: 'locksmith', label: 'Locksmiths', category: 'Home Services' },
    ];
  }

  /**
   * Simple delay utility for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🆕 GRID-BASED SEARCH METHODS

  /**
   * Get city boundaries using Google Geocoding API
   */
  async getCityBounds(location: string): Promise<CityBounds> {
    try {
      const geocodeResponse = await this.client.geocode({
        params: {
          address: location,
          key: this.apiKey,
        },
      });

      const result = geocodeResponse.data.results[0];
      if (!result) {
        throw new Error(`Location not found: ${location}`);
      }

      const bounds = result.geometry.bounds || result.geometry.viewport;
      if (!bounds) {
        throw new Error(`No bounds available for location: ${location}`);
      }

      return {
        north: bounds.northeast.lat,
        south: bounds.southwest.lat,
        east: bounds.northeast.lng,
        west: bounds.southwest.lng,
        center: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        }
      };
    } catch (error) {
      console.error('Error getting city bounds:', error);
      throw new Error(`Failed to get city bounds for: ${location}`);
    }
  }

  /**
   * Estimate city population for grid sizing
   * Uses a simple mapping for now, could be enhanced with real population APIs
   */
  private estimateCityPopulation(location: string): number {
    const city = location.toLowerCase();
    
    // Major metropolitan areas (1M+)
    if (city.includes('los angeles') || city.includes('new york') || 
        city.includes('chicago') || city.includes('houston') || 
        city.includes('phoenix') || city.includes('philadelphia')) {
      return 2000000;
    }
    
    // Large cities (500k-1M)
    if (city.includes('san francisco') || city.includes('boston') || 
        city.includes('washington') || city.includes('denver') || 
        city.includes('seattle') || city.includes('atlanta')) {
      return 750000;
    }
    
    // Medium cities (100k-500k)
    if (city.includes('sacramento') || city.includes('miami') || 
        city.includes('oakland') || city.includes('minneapolis')) {
      return 300000;
    }
    
    // Default for smaller cities
    return 150000;
  }

  /**
   * Calculate optimal grid size based on population
   */
  private getGridSize(population: number): number {
    if (population < 100000) return 2;      // Small cities: ~120 leads
    if (population < 500000) return 4;      // Medium cities: ~240 leads  
    if (population < 1000000) return 6;     // Large cities: ~360 leads
    if (population < 3000000) return 9;     // Major cities: ~540 leads
    return 12;                              // Mega cities: ~720 leads
  }

  /**
   * Generate search grid points across city bounds
   */
  generateSearchGrid(bounds: CityBounds, gridSize: number): SearchGrid[] {
    const grid: SearchGrid[] = [];
    
    // Calculate grid dimensions
    const rows = Math.ceil(Math.sqrt(gridSize));
    const cols = Math.ceil(gridSize / rows);
    
    // Calculate step sizes
    const latStep = (bounds.north - bounds.south) / rows;
    const lngStep = (bounds.east - bounds.west) / cols;
    
    // Calculate optimal radius (ensure coverage with some overlap)
    const avgLatStep = latStep * 111000; // Convert to meters (rough)
    const avgLngStep = lngStep * 111000 * Math.cos(bounds.center.lat * Math.PI / 180);
    const radius = Math.min(Math.max(avgLatStep, avgLngStep) * 0.7, 5000); // Max 5km radius
    
    let areaCount = 1;
    
    for (let row = 0; row < rows && areaCount <= gridSize; row++) {
      for (let col = 0; col < cols && areaCount <= gridSize; col++) {
        const lat = bounds.south + (row + 0.5) * latStep;
        const lng = bounds.west + (col + 0.5) * lngStep;
        
        grid.push({
          lat,
          lng,
          radius,
          area: `Area ${areaCount}`
        });
        
        areaCount++;
      }
    }
    
    return grid.slice(0, gridSize); // Ensure we don't exceed target grid size
  }

  /**
   * Enhanced search with grid-based multi-location approach
   * Searches multiple areas within a city to bypass the 60-lead limitation
   */
  async searchBusinessesGrid(
    params: SearchParams,
    progressCallback?: (progress: SearchProgress) => void,
    userId?: number,
    shouldAbort?: () => boolean
  ): Promise<LeadData[]> {
    try {
      console.log(`🔍 Starting grid-based search for ${params.businessType} in ${params.location}`);
      
      // 1. Get city bounds and estimate population
      const bounds = await this.getCityBounds(params.location);
      const population = this.estimateCityPopulation(params.location);
      const gridSize = this.getGridSize(population);
      
      console.log(`📊 City: ${params.location}, Population: ${population}, Grid Size: ${gridSize}`);
      
      // 2. Generate search grid
      const searchGrid = this.generateSearchGrid(bounds, gridSize);
      console.log(`🗺️ Generated ${searchGrid.length} search areas`);
      
      // 3. Search each grid area
      const allLeads: LeadData[] = [];
      
      for (let i = 0; i < searchGrid.length; i++) {
        if (shouldAbort?.()) {
          console.log('⏹️ Aborting grid search loop due to shouldAbort() signal');
          break;
        }
        const gridPoint = searchGrid[i];
        if (!gridPoint) continue; // Skip if undefined
        
        console.log(`🔍 Searching ${gridPoint.area}: lat=${gridPoint.lat.toFixed(4)}, lng=${gridPoint.lng.toFixed(4)}`);
        
        // Search this specific grid area (max 60 results per area)
        // Pass the progressCallback directly so business names stream through
        const gridLeads = await this.searchBusinesses({
          ...params,
          location: `${gridPoint.lat},${gridPoint.lng}`,
          maxResults: 60,
          radius: gridPoint.radius
        }, progressCallback, userId, shouldAbort);
        
        allLeads.push(...gridLeads);
        console.log(`✅ ${gridPoint.area}: Found ${gridLeads.length} leads (Total: ${allLeads.length})`);
        
        if (shouldAbort?.()) {
          console.log('⏹️ Aborting after area due to shouldAbort() signal');
          break;
        }
        
        // Rate limiting between grid searches
        if (i < searchGrid.length - 1) {
          await this.delay(1000); // 1 second delay between areas
        }
      }
      
      // 4. Final progress update
      progressCallback?.({
        found: allLeads.length,
        total: allLeads.length,
        isComplete: true,
        currentLocation: `${searchGrid.length} areas searched`
      });
      
      console.log(`🎯 Grid search complete: ${allLeads.length} total leads found across ${searchGrid.length} areas`);
      return allLeads;
      
    } catch (error) {
      console.error('Error in grid-based search:', error);
      // Fall back to single-location search if grid search fails
      console.log('⚠️ Falling back to single-location search');
      return this.searchBusinesses(params, progressCallback, userId, shouldAbort);
    }
  }
}

export default PlacesService; 