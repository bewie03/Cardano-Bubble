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
    
    // Fetch data for each token
    for (const token of TOP_TOKENS) {
      try {
        const url = new URL(API_URL);
        url.searchParams.append('unit', token.unit);
        url.searchParams.append('timeframes', TIMEFRAMES);
        
        console.log('Fetching from URL:', url.toString());
        
        const response = await fetch(url.toString(), {
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
              throw new Error(`API_ERROR_${response.status}`);
          }
        }

        const data = await response.json();
        console.log('Raw API Response:', data);

        if (!data || typeof data !== 'object') {
          throw new Error('INVALID_RESPONSE_FORMAT');
        }

        // Keep the timeframes as they come from the API
        const changes = {
          '1h': parseFloat(data['1h']) || 0,
          '4h': parseFloat(data['4h']) || 0,
          '24h': parseFloat(data['24h']) || 0,
          '7d': parseFloat(data['7d']) || 0,
          '30d': parseFloat(data['30d']) || 0
        };

        results.push({
          id: token.unit,
          name: token.name,
          changes
        });

      } catch (error) {
        console.error(`Error fetching ${token.name}:`, error);
        errors.push({
          token: token.name,
          error: error.message
        });
      }
    }

    // Send response with any successfully fetched tokens
    const response = {
      tokens: results
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Server Error:', error);
    const errorCode = error.message || 'UNKNOWN_ERROR';
    res.status(getStatusCode(errorCode)).json({
      error: errorCode,
      message: getErrorMessage(errorCode)
    });
  }
};

function getErrorMessage(errorCode) {
  const messages = {
    'API_KEY_MISSING': 'API key is required but not provided',
    'INVALID_API_KEY': 'Invalid API key',
    'TOKEN_NOT_FOUND': 'Token not found',
    'RATE_LIMIT_EXCEEDED': 'Rate limit exceeded',
    'INVALID_RESPONSE_FORMAT': 'Invalid response format from API',
    'UNKNOWN_ERROR': 'An unknown error occurred'
  };
  return messages[errorCode] || `An error occurred: ${errorCode}`;
}

function getStatusCode(errorCode) {
  const codes = {
    'API_KEY_MISSING': 401,
    'INVALID_API_KEY': 401,
    'TOKEN_NOT_FOUND': 404,
    'RATE_LIMIT_EXCEEDED': 429,
    'INVALID_RESPONSE_FORMAT': 502,
    'UNKNOWN_ERROR': 500
  };
  return codes[errorCode] || 500;
}
