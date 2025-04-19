export interface ClothingItem {
  id: number;
  name: string;
  category: string;
  color: string;
  size: string;
  brand?: string;
  image?: string;
  weather_suitability: string;
  created_at: string;
  last_worn?: string;
}

export interface WeatherLog {
  id: number;
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  humidity: number;
  conditions: {
    primary: string;
    all: string[];
    metrics: {
      avg_temp: number;
      temp_range: string;
      precipitation: string;
      humidity: string;
    };
  };
  created_at: string;
}

export interface WearLog {
  id: number;
  items: ClothingItem[];
  item_ids?: number[];
  date_worn: string;
  weather_log: WeatherLog | null;
  notes: string;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: number;
}

export interface WeatherSuggestion {
  weather: WeatherData;
  suggestions: ClothingItem[];
}

export interface Weather {
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  humidity: number;
  conditions: {
    primary: string;
    all: string[];
    metrics: {
      avg_temp: number;
      temp_range: string;
      precipitation: string;
      humidity: string;
    };
  };
  last_updated: string;
} 