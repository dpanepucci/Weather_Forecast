import fs from "node:fs/promises";
import { v4 as uuidv4 } from 'uuid'; // used for random id number generator 

// Define a City class with name and id properties
class City { 
  constructor(public name: string, public id: string) {
    this.name = name;
    this.id = id; 
  }
}

// Complete the HistoryService class
class HistoryService {
  private searchHistoryFilePath = 'db/db.json';
  constructor () {
  }

  // Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile(this.searchHistoryFilePath, {
       encoding: 'utf8',
    });
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City []): Promise<any> {
    return await fs.writeFile(this.searchHistoryFilePath, JSON.stringify(cities, null, 2), 'utf-8');
  }
  // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
      const data = await this.read();
      let parsedCities: City[];
      try {
      parsedCities = JSON.parse(data);
      } catch (err) {
      parsedCities = [];
      }
      return parsedCities;
    }

// Define an addCity method that adds a city to the searchHistory.json file
async addCity(city: string): Promise<any> {
  try {
    const data = await fs.readFile(this.searchHistoryFilePath, 'utf8');
    const searchHistory = JSON.parse(data);
    const newCity = {
      id: uuidv4(),
      name: city,
    };
    searchHistory.push(newCity);
    await fs.writeFile(this.searchHistoryFilePath, JSON.stringify(searchHistory, null, 2));
    } catch (error) {
    console.error('Error adding city to search history:', error);
  }
}




  // BONUS- work on later
  // Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const data = await fs.readFile(this.searchHistoryFilePath, 'utf8');
    const cities= JSON.parse(data);
    const updatedCities= cities.filter((city: { id: string }) => city.id !==id);
    await this.write(updatedCities);
    } catch (error: unknown) {
    console.error('Error removing city:', error);
  }
}

export default new HistoryService();

