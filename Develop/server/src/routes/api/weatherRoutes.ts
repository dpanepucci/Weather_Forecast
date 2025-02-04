import express, { type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js'; 

const router = express.Router();
const weatherService = new WeatherService();

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response): Promise<any> => {
  const { cityName } = req.body;
  if (!cityName) {
    res.status(400).json({ error: 'City name is required' });
    return;
  }
// GET weather data from city name
  try {
    const weatherData = await weatherService.getWeatherForCity(cityName);
    // save city to search history
    await HistoryService.addCity(cityName);

    res.status(200).json(weatherData);
    } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET search history
interface City {
  id: string;
  name: string;
}

interface ErrorResponse {
  error: string;
}

router.get('/history', async (_: Request, res: Response): Promise<any> => {
  try {
    const cities: City[] = await HistoryService.getCities();
    res.status(200).json(cities);
    } catch (error) {
    console.error('Error fetching search history:', error);
    const errorResponse: ErrorResponse = { error: 'Failed to fetch search history' };
    res.status(500).json(errorResponse);
  }
});

// BONUS - work on later
// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await HistoryService.removeCity(id);
    res.status(200).json({ message: 'City removed from search history' });
    } catch (error) {
    console.error('Error removing city from search history:', error);
    res.status(500).json({ error: 'Failed to remove city from search history' });
  }
});

export default router;

