import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Test the API connection
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/test`);
    console.log('API connection test:', response.data);
    return response.data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};

// Fetch price data from backend
export const fetchPriceData = async () => {
  try {
    console.log('Fetching price data from backend...');
    const response = await axios.get('/api/prices');  // Use proxy path
    console.log('Price data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  }
};
