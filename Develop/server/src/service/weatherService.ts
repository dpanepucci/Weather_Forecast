import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  constructor(
    public city: string,
    public tempF: number,
    public humidity: number,
    public windSpeed: number,
    public condition: string,
    public iconDescription: string,
    public icon: string,
    public date: string
  ) {}
}

class WeatherService {
  private baseURL = process.env.API_BASE_URL || '';
  private apiKey = process.env.API_KEY || '';
  private cityName = '';

  private extractCoordinates(locationData: any): Coordinates {
    return {
      lat: locationData.lat || locationData.latitude,
      lon: locationData.lon || locationData.longitude,
    };
  }

  private buildQuery(baseUrl: string, params: Record<string, string>): string {
    const queryParams = new URLSearchParams({ ...params, appid: this.apiKey }).toString();
    return `${baseUrl}?${queryParams}`;
  }

  private async fetchData(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async getCoordinates(location: string): Promise<Coordinates> {
    const url = this.buildQuery('http://api.openweathermap.org/geo/1.0/direct', { q: location });
    const data = await this.fetchData(url);
    if (!data.length) throw new Error('No location data found');
    return this.extractCoordinates(data[0]);
  }

  private async getWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildQuery(`${this.baseURL}/data/2.5/forecast`, {
      units: 'imperial',
      lat: coordinates.lat.toString(),
      lon: coordinates.lon.toString(),
    });
    return this.fetchData(url);
  }

  private parseWeather(response: any, date: Date): Weather {
    return new Weather(
      this.cityName,
      response.main.temp,
      response.main.humidity,
      response.wind.speed,
      'N/A',
      response.weather[0].description,
      response.weather[0].icon,
      date.toLocaleDateString()
    );
  }

  private extractForecast(weatherData: any): Weather[] {
    return weatherData.list
      .filter((entry: any) => entry.dt_txt.includes('12:00:00'))
      .map((entry: any) => this.parseWeather(entry, new Date(entry.dt * 1000)));
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      this.cityName = city;
      const coordinates = await this.getCoordinates(city);
      const weatherData = await this.getWeatherData(coordinates);
      const currentWeather = this.parseWeather(weatherData.list[0], new Date(weatherData.list[0].dt * 1000));
      return [currentWeather, ...this.extractForecast(weatherData)];
    } catch (error) {
      console.error('Error fetching weather for city:', error);
      throw error;
    }
  }
}

export default WeatherService;