const fetch = require('node-fetch');

const API_URL = 'https://openapi.taptools.io/api/v1/token/prices/chg';

// List of tokens to fetch
const TOP_TOKENS = [
  {
    name: 'Cardano',
    unit: 'lovelace'
  },
  {
    name: 'DJED',
    unit: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344'
  },
  {
    name: 'iUSD',
    unit: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753494453'
  }
  // Add more tokens as needed
];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const results = [];
    
    for (const token of TOP_TOKENS) {
      try {
        const url = new URL(API_URL);
        url.searchParams.append('unit', token.unit);
        
        const response = await fetch(url.toString(), {
          headers: {
            'x-api-key': process.env.TAPTOOLS_API_KEY,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`API error for ${token.name}:`, await response.text());
          continue;
        }

        const data = await response.json();
        results.push({
          id: token.unit,
          name: token.name,
          changes: data || {}
        });
      } catch (tokenError) {
        console.error(`Error fetching ${token.name}:`, tokenError);
        // Continue with other tokens even if one fails
        continue;
      }
    }

    // Always return an array, even if empty
    res.json({ tokens: results });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price data',
      message: error.message,
      tokens: [] // Always include tokens array
    });
  }
};