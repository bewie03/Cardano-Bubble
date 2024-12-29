const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'https://openapi.taptools.io/api/v1/token/prices/chg';
const TIMEFRAMES = '1h,4h,24h,7d,30d';

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

// Helper function to fetch data with retries
async function fetchWithRetry(url, options, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) { // Rate limit exceeded
        console.log(`Rate limit hit, attempt ${i + 1}/${retries}, waiting ${delayMs}ms`);
        await delay(delayMs);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs);
    }
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

    const results = [];
    const errors = [];
    
    // Fetch data for each token with delay between requests
    for (const token of TOP_TOKENS) {
      try {
        const url = new URL(API_URL);
        url.searchParams.append('unit', token.unit);
        url.searchParams.append('timeframes', TIMEFRAMES);
        
        console.log('Fetching from URL:', url.toString());
        
        const response = await fetchWithRetry(url.toString(), {
          headers: {
            'x-api-key': process.env.TAPTOOLS_API_KEY,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });

          switch (response.status) {
            case 401:
              throw new Error('INVALID_API_KEY');
            case 404:
              throw new Error('TOKEN_NOT_FOUND');
            case 429:
              throw new Error('RATE_LIMIT_EXCEEDED');
            default:
              throw new Error('API_ERROR');
          }
        }

        const data = await response.json();
        
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
        await delay(500);
        
      } catch (error) {
        console.error('Error fetching token data:', token.name, error);
        errors.push({ token: token.name, error: error.message });
      }
    }

    if (results.length === 0) {
      const statusCode = getStatusCode(errors[0]?.error || 'NO_DATA');
      const message = getErrorMessage(errors[0]?.error || 'NO_DATA');
      res.status(statusCode).json({ message, errors });
      return;
    }

    res.json({ tokens: results, errors: errors.length > 0 ? errors : undefined });
    
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
