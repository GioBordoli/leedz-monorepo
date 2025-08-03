import { Client } from '@googlemaps/google-maps-services-js';

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
   * Search for businesses using Google Places API
   * Equivalent to the original scraper's main functionality
   */
  async searchBusinesses(
    params: SearchParams,
    progressCallback?: (progress: SearchProgress) => void
  ): Promise<LeadData[]> {
    const results: LeadData[] = [];
    const { businessType, location, maxResults = 25, radius = 10000 } = params;

    try {
      console.log(`🔍 Starting Places API search: ${businessType} in ${location}`);
      
      // First, geocode the location to get coordinates
      const geocodeResponse = await this.client.geocode({
        params: {
          address: location,
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

      // Perform nearby search
      const nearbyResponse = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          type: businessType,
          key: this.apiKey,
        },
      });

      console.log(`📊 Found ${nearbyResponse.data.results.length} initial results`);

      // Process results and get details
      for (let i = 0; i < Math.min(nearbyResponse.data.results.length, maxResults); i++) {
        const place = nearbyResponse.data.results[i];
        
        if (!place?.place_id) {
          console.warn('⚠️ Place missing place_id, skipping');
          continue;
        }
        
        try {
          // Get detailed information for each place
          const details = await this.getPlaceDetails(place.place_id);
          if (details) {
            results.push(details);
            
            // Send progress update
            if (progressCallback) {
              progressCallback({
                found: results.length,
                total: maxResults,
                isComplete: false,
                currentLocation: details.name
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get details for place ${place.place_id}:`, error);
          continue;
        }

        // Add small delay to respect rate limits
        await this.delay(100);
      }

      // Final progress update
      if (progressCallback) {
        progressCallback({
          found: results.length,
          total: maxResults,
          isComplete: true
        });
      }

      console.log(`✅ Search completed: ${results.length} leads found`);
      return results;

    } catch (error) {
      console.error('❌ Places API search failed:', error);
      throw new Error(`Failed to search businesses: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}

export default PlacesService; 