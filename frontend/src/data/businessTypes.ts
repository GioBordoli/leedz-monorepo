import { BusinessCategories } from '../services/leadService';

// Static business types organized by category
// Based on Google Places API supported business types
export const BUSINESS_TYPES: BusinessCategories = {
  "Food & Dining": [
    { value: "restaurant", label: "Restaurant" },
    { value: "meal_takeaway", label: "Takeaway Restaurant" },
    { value: "meal_delivery", label: "Meal Delivery" },
    { value: "cafe", label: "Café" },
    { value: "bakery", label: "Bakery" },
    { value: "bar", label: "Bar" },
    { value: "night_club", label: "Night Club" },
    { value: "food", label: "Food Establishment" }
  ],
  "Health & Medical": [
    { value: "doctor", label: "Doctor" },
    { value: "dentist", label: "Dentist" },
    { value: "hospital", label: "Hospital" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "physiotherapist", label: "Physiotherapist" },
    { value: "veterinary_care", label: "Veterinary Care" },
    { value: "health", label: "Health Services" }
  ],
  "Professional Services": [
    { value: "lawyer", label: "Lawyer" },
    { value: "accounting", label: "Accounting" },
    { value: "real_estate_agency", label: "Real Estate Agency" },
    { value: "insurance_agency", label: "Insurance Agency" },
    { value: "finance", label: "Financial Services" },
    { value: "travel_agency", label: "Travel Agency" }
  ],
  "Beauty & Wellness": [
    { value: "beauty_salon", label: "Beauty Salon" },
    { value: "hair_care", label: "Hair Care" },
    { value: "spa", label: "Spa" },
    { value: "gym", label: "Gym" }
  ],
  "Automotive": [
    { value: "car_dealer", label: "Car Dealer" },
    { value: "car_rental", label: "Car Rental" },
    { value: "car_repair", label: "Car Repair" },
    { value: "car_wash", label: "Car Wash" },
    { value: "gas_station", label: "Gas Station" }
  ],
  "Shopping & Retail": [
    { value: "clothing_store", label: "Clothing Store" },
    { value: "shoe_store", label: "Shoe Store" },
    { value: "jewelry_store", label: "Jewelry Store" },
    { value: "electronics_store", label: "Electronics Store" },
    { value: "furniture_store", label: "Furniture Store" },
    { value: "home_goods_store", label: "Home Goods Store" },
    { value: "supermarket", label: "Supermarket" },
    { value: "convenience_store", label: "Convenience Store" },
    { value: "store", label: "General Store" }
  ],
  "Home & Garden": [
    { value: "plumber", label: "Plumber" },
    { value: "electrician", label: "Electrician" },
    { value: "painter", label: "Painter" },
    { value: "roofing_contractor", label: "Roofing Contractor" },
    { value: "general_contractor", label: "General Contractor" },
    { value: "locksmith", label: "Locksmith" },
    { value: "moving_company", label: "Moving Company" }
  ],
  "Education": [
    { value: "school", label: "School" },
    { value: "university", label: "University" },
    { value: "primary_school", label: "Primary School" },
    { value: "secondary_school", label: "Secondary School" }
  ],
  "Entertainment": [
    { value: "movie_theater", label: "Movie Theater" },
    { value: "amusement_park", label: "Amusement Park" },
    { value: "bowling_alley", label: "Bowling Alley" },
    { value: "casino", label: "Casino" }
  ],
  "Lodging & Hospitality": [
    { value: "lodging", label: "Hotels, Motels & B&Bs" },
    { value: "tourist_attraction", label: "Tourist Attraction" },
    { value: "rv_park", label: "RV Park" },
    { value: "campground", label: "Campground" }
  ],
  "Transportation": [
    { value: "taxi_stand", label: "Taxi Stand" },
    { value: "transit_station", label: "Transit Station" },
    { value: "airport", label: "Airport" },
    { value: "bus_station", label: "Bus Station" },
    { value: "train_station", label: "Train Station" }
  ],
  "Technology & IT": [
    { value: "electronics_store", label: "Electronics Store" },
    { value: "store", label: "Computer/Phone Repair" }
  ],
  "Personal Care": [
    { value: "laundry", label: "Laundromat" },
    { value: "florist", label: "Florist" },
    { value: "pet_store", label: "Pet Store" },
    { value: "funeral_home", label: "Funeral Home" }
  ]
};

// Calculate total number of business types
export const TOTAL_BUSINESS_TYPES = Object.values(BUSINESS_TYPES)
  .reduce((total, types) => total + types.length, 0); 