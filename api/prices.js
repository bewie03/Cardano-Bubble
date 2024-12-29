const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'https://openapi.taptools.io/api/v1/token/prices/chg';
const TIMEFRAMES = '1h,4h,24h,7d,30d';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Cache object to store results
let cache = {
  data: null,
  timestamp: null,
  isUpdating: false // Flag to prevent concurrent updates
};

// List of tokens to fetch with correct policy ID + hex name format
const TOP_TOKENS = [
  {
    name: 'Cardano',
    unit: 'lovelace'
  },
  {
    name: 'DJED',
    unit: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344.444a4544'
  },
  {
    name: 'iUSD',
    unit: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.69555344'
  }
];

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with proper error handling
async function fetchTokenData(url, options) {
  const response = await fetch(url, options);
  
  if (!response) {
    throw new Error('No response received from API');
  }

  // Handle rate limiting
  if (response.status === 429) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // Handle other error status codes
  if (response.status !== 200) {
    const errorText = await response.text();
    console.error('API Error:', {
      status: response.status,
      text: errorText
    });
    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Function to check if cache is valid
function isCacheValid() {
  return cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION);
}

// Function to update cache in background
async function updateCacheInBackground() {
  // Prevent concurrent updates
  if (cache.isUpdating) {
    console.log('Cache update already in progress');
    return;
  }

  try {
    cache.isUpdating = true;
    console.log('Starting background cache update');

    const results = [];
    const errors = [];
    
    // Fetch data for each token with delay between requests
    for (const token of TOP_TOKENS) {
      try {
        const url = new URL(API_URL);
        url.searchParams.append('unit', token.unit);
        url.searchParams.append('timeframes', TIMEFRAMES);
        
        console.log('Fetching from URL:', url.toString());
        
        const data = await fetchTokenData(url.toString(), {
          headers: {
            'x-api-key': process.env.TAPTOOLS_API_KEY,
            'Accept': 'application/json'
          }
        });
        
        if (!data || typeof data.changes !== 'object') {
          console.error('Invalid data format for token:', token.name, data);
          errors.push({ token: token.name, error: 'INVALID_DATA_FORMAT' });
          continue;
        }

        results.push({
          name: token.name,
          unit: token.unit,
          changes: data.changes
        });

        // Add delay between requests to avoid rate limits
        if (TOP_TOKENS.indexOf(token) < TOP_TOKENS.length - 1) {
          await delay(1000);
        }
        
      } catch (error) {
        console.error('Error fetching token data:', token.name, error);
        
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          await delay(2000);
        }
        
        errors.push({ token: token.name, error: error.message });
      }
    }

    // Only update cache if we got some results
    if (results.length > 0) {
      cache = {
        data: {
          tokens: results,
          errors: errors.length > 0 ? errors : undefined,
          lastUpdated: new Date().toISOString()
        },
        timestamp: Date.now(),
        isUpdating: false
      };
      console.log('Cache updated successfully');
    } else {
      console.error('Cache update failed - no valid results');
      cache.isUpdating = false;
    }
  } catch (error) {
    console.error('Cache update failed:', error);
    cache.isUpdating = false;
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Validate API key
    if (!process.env.TAPTOOLS_API_KEY) {
      throw new Error('API_KEY_MISSING');
    }

    // If cache is expired, trigger background update but still return old cache
    if (!isCacheValid() && !cache.isUpdating) {
      console.log('Cache expired, triggering background update');
      updateCacheInBackground().catch(console.error);
    }

    // Always return cache if it exists, even if expired
    if (cache.data) {
      console.log('Returning cached data from:', new Date(cache.timestamp).toISOString());
      return res.json(cache.data);
    }

    // If no cache exists yet, wait for initial fetch
    console.log('No cache exists, waiting for initial fetch');
    await updateCacheInBackground();

    if (!cache.data) {
      throw new Error('Failed to fetch initial data');
    }

    res.json(cache.data);
    
  } catch (error) {
    console.error('API Error:', error);
    const statusCode = getStatusCode(error.message);
    const message = getErrorMessage(error.message);
    res.status(statusCode).json({ message, error: error.message });
  }
};

function getErrorMessage(errorCode) {
  const messages = {
    'API_KEY_MISSING': 'API key is required but not provided',
    'INVALID_API_KEY': 'Invalid API key',
    'TOKEN_NOT_FOUND': 'Token not found',
    'RATE_LIMIT_EXCEEDED': 'Rate limit exceeded, please try again later',
    'API_ERROR': 'Error fetching data from API',
    'INVALID_DATA_FORMAT': 'Invalid data format received',
    'NO_DATA': 'No data available'
  };
  return messages[errorCode] || 'An unexpected error occurred';
}

function getStatusCode(errorCode) {
  const codes = {
    'API_KEY_MISSING': 400,
    'INVALID_API_KEY': 401,
    'TOKEN_NOT_FOUND': 404,
    'RATE_LIMIT_EXCEEDED': 429,
    'API_ERROR': 500,
    'INVALID_DATA_FORMAT': 500,
    'NO_DATA': 404
  };
  return codes[errorCode] || 500;
}
