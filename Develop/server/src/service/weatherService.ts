import dotenv from 'dotenv';
dotenv.config();


// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  tempF: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  iconDescription: string;
  icon: string;
  date: string;

  constructor (
  city: string,
  tempF: number,
  humidity: number,
  windSpeed: number,
  condition: string,
  iconDescription: string,
  icon: string,
  date: string
  ) {
    this.city = city;
    this.tempF = tempF;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.condition = condition;
    this.iconDescription = iconDescription;
    this.icon = icon;
    this.date = date;
  }
}


// Complete the WeatherService class
class WeatherService {
  // Define the baseURL, API key, and city name properties
  private baseURL: string= process.env.API_BASE_URL || '';
  private apiKey: string = process.env.API_KEY || '';
  private cityName: string = '';

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const lat = locationData.lat || locationData.latitude;
    const lon = locationData.lon || locationData.longitude;
    return { lat, lon };
  };

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(location: string): string {
    const apiKey = this.apiKey;
    const baseUrl = 'http://api.openweathermap.org/geo/1.0/direct'
    const query = `${baseUrl}?appid=${apiKey}&q=${encodeURIComponent(location)}`;
    return query;
  };

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
  };

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(location: string): Promise<Coordinates> {
    const query = this.buildGeocodeQuery(location);
       try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return this.destructureLocationData(data[0]);
      } else {
        throw new Error('No location data found');
      }
      }
      
      catch (error) {
      console.error('Error:', error);
      throw error;
      }
      };

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQueryUrl = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(weatherQueryUrl);
      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  };

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const temperature = response.main.temp;
    const description = response.weather[0].description;
    const humidity = response.main.humidity;
    const windSpeed = response.wind.speed;
    const date = new Date(response.dt * 1000);
    const condition = 'blank';
    const icon = response.weather[0].icon;
    const newWeather = new Weather(
      this.cityName,
      temperature,
      humidity,
      windSpeed,
      condition,
      description,
      icon,
      date.toLocaleDateString()
    )
    return newWeather
  };

  // Complete buildForecastArray method
  private buildForecastArray(weatherData: any) {
    const forecastArray = [];
    const forecastData = weatherData.list.filter((weather: any) => weather.dt_txt.includes('12:00:00'));
    for (const data of forecastData) {
      if (!data || !data.main || !data.weather || !data.dt) {
        continue;
      }
      const date = new Date(data.dt * 1000);
      const temperature = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
// push weather objects into forecast array
      const weather = new Weather(this.cityName, temperature, humidity, windSpeed, 'blank', weatherDescription, data.weather[0].icon, date.toLocaleDateString());
      forecastArray.push(
        weather 
      );
    }
    return forecastArray;
  };
  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<any> {
    try {
      this.cityName = city;
      const { lat, lon } = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData({ lat, lon });
      const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
      const forecastArray = this.buildForecastArray(weatherData);
      return [currentWeather, ...forecastArray];
      
      } catch (error) {
      console.error('Error fetching weather for city:', error);
      throw error;
    }
  };
}

export default WeatherService;
