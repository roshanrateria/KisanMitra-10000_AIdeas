// API integrations for weather, soil, market prices, satellite imagery
// Weather proxied through Lambda server — NO API keys on client
// Soil data stays client-side (public API, no key needed)

import { serverGet } from '@/lib/serverApi';

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  coord?: {
    lat: number;
    lon: number;
  };
}

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const data = await serverGet<WeatherData>('/api/weather', {
      lat: lat.toString(),
      lon: lon.toString(),
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
};

export const getSoilData = async (lat: number, lon: number): Promise<any> => {
  try {
    // ISRIC SoilGrids — public API, no key needed, stays client-side
    const properties = ['bdod', 'cec', 'cfvo', 'clay', 'nitrogen', 'ocd', 'ocs', 'phh2o', 'sand', 'silt', 'soc', 'wv0010', 'wv0033', 'wv1500'];
    const depths = ['0-5cm', '0-30cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm'];
    const values = ['Q0.5', 'Q0.05', 'Q0.95', 'mean', 'uncertainty'];

    const propertyParams = properties.map(p => `property=${p}`).join('&');
    const depthParams = depths.map(d => `depth=${d}`).join('&');
    const valueParams = values.map(v => `value=${v}`).join('&');

    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&${propertyParams}&${depthParams}&${valueParams}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch soil data:', error);
    return null;
  }
};

// Commodity mapping for Agmarknet
const COMMODITY_CODES: { [key: string]: number } = {
  'Wheat': 14, 'Rice': 1, 'Bajra': 28, 'Jowar': 31, 'Maize': 32,
  'Barley': 29, 'Cotton': 15, 'Jute': 16, 'Groundnut': 10, 'Mustard': 118,
  'Soyabean': 122, 'Sunflower': 127, 'Sugarcane': 141, 'Potato': 151,
  'Onion': 23, 'Tomato': 24, 'Cabbage': 154, 'Cauliflower': 34,
  'Brinjal': 35, 'Apple': 17, 'Banana': 19, 'Mango': 20, 'Grapes': 22,
  'Chilli': 26, 'Turmeric': 152, 'Coriander': 43, 'Garlic': 25,
  'Ginger': 27, 'Arhar': 49, 'Moong': 9, 'Urad': 8, 'Gram': 6,
  'Masoor': 7, 'Coffee': 45, 'Tea': 46, 'Cardamom': 40,
  'Black Pepper': 38, 'Cashew': 36, 'Coconut': 138
};

export interface MarketPrice {
  slNo: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceDate: string;
}

export const getMarketPrices = async (commodity: string): Promise<MarketPrice[]> => {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB').split('/').join('-');

    // Mock data (would be done via backend in production — Agmarknet has CORS issues)
    const indianStates = [
      { district: 'Jaipur', market: 'Jaipur (Grain)' },
      { district: 'Delhi', market: 'Azadpur' },
      { district: 'Mumbai', market: 'Vashi APMC' },
      { district: 'Bangalore', market: 'Bangalore' },
      { district: 'Hyderabad', market: 'Hyderabad' },
      { district: 'Chennai', market: 'Koyambedu' },
      { district: 'Kolkata', market: 'Kolkata' },
      { district: 'Lucknow', market: 'Lucknow' },
      { district: 'Ahmedabad', market: 'Ahmedabad' },
      { district: 'Pune', market: 'Pune' }
    ];

    const varieties = ['Local', 'Premium', 'Grade A', 'FAQ', 'Medium', 'Superior'];
    const grades = ['FAQ', 'A', 'B', 'Local', 'Premium'];

    const mockPrices: MarketPrice[] = indianStates.map((location, index) => {
      const basePrice = 2000 + Math.floor(Math.random() * 1000);
      const variation = 300 + Math.floor(Math.random() * 500);

      return {
        slNo: (index + 1).toString(),
        district: location.district,
        market: location.market,
        commodity: commodity,
        variety: varieties[Math.floor(Math.random() * varieties.length)],
        grade: grades[Math.floor(Math.random() * grades.length)],
        minPrice: basePrice,
        maxPrice: basePrice + variation + 500,
        modalPrice: basePrice + Math.floor(variation / 2),
        priceDate: dateStr
      };
    });

    return mockPrices;
  } catch (error) {
    console.error('Failed to fetch market prices:', error);
    return [];
  }
};

// Satellite imagery — now uses server proxy if available
export const getSatelliteImagery = async (
  coordinates: [number, number][],
  date?: string,
  type: 'true-color' | 'ndvi' | 'moisture' = 'true-color'
): Promise<string | null> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/satellite`
      : (import.meta.env.PROD ? '/api/satellite' : 'http://localhost:5173/api/satellite');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, date, type }),
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to fetch satellite imagery:', error);
    return null;
  }
};

export const getCropRecommendations = async (soilData: any, weather: WeatherData | null): Promise<string[]> => {
  const crops = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Bajra', 'Jowar'];
  return crops.slice(0, 3);
};
