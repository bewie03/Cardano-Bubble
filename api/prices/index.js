const fetch = require('node-fetch');

const API_URL = 'https://openapi.taptools.io/api/v1/token/prices/chg';
const TIMEFRAMES = '1h,4h,24h,7d,30d';

// List of tokens to fetch with correct policy ID + hex name format
const TOP_TOKENS = [
  {
    name: 'Cardano',
    unit: 'lovelace'  // ADA is special case, uses 'lovelace'
  },
  {
    name: 'DJED',
    // Format: policyId + hex name for "DJED"
    unit: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344.444a4544' // .444a4544 is hex for "DJED"
  },
  {
    name: 'iUSD',
    // Format: policyId + hex name for "iUSD"
    unit: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.69555344' // .69555344 is hex for "iUSD"
  }
];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const results = [];
    
    // Test with just one token first
    const token = TOP_TOKENS[0];
    try {
      const url = new URL(API_URL);
      url.searchParams.append('unit', token.unit); // Required parameter
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
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw API Response:', data);

      // Map timeframes to match our frontend expectations
      const mappedChanges = {
        '4h': data['4h'] || 0,
        '1d': data['24h'] || 0,
        '7d': data['7d'] || 0,
        '30d': data['30d'] || 0
      };

      results.push({
        id: token.unit,
        name: token.name,
        changes: mappedChanges
      });

    } catch (tokenError) {
      console.error(`Error fetching ${token.name}:`, tokenError);
      results.push({
        id: token.unit,
        name: token.name,
        changes: {
          '4h': 0,
          '1d': 0,
          '7d': 0,
          '30d': 0
        },
        error: tokenError.message
      });
    }

    console.log('Sending response:', { tokens: results });
    res.json({ tokens: results });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price data',
      message: error.message,
      tokens: []
    });
  }
};
