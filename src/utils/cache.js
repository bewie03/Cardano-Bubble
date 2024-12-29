const CACHE_KEY = 'taptools_price_data';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = new Date().getTime();

    // Check if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const setCachedData = (data) => {
  try {
    const cacheObject = {
      data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};
