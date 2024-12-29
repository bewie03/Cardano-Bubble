import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, CircularProgress } from '@mui/material';
import BubbleMap from './components/BubbleMap';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
    },
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
  },
});

const TIMEFRAMES = ['6h', '1d', '7d', '30d', '60d', '1y'];

function App() {
  const [data, setData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data from server...');
        const response = await axios.get('/api/prices');
        console.log('Received data:', response.data);
        if (response.data.tokens) {
          setData(response.data.tokens);
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ 
        minHeight: '100vh', 
        py: 4, 
        backgroundColor: '#121212'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <h1 style={{ 
            color: '#4caf50', 
            marginBottom: '0.5rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Cardano Token Bubble Map
          </h1>
          <p style={{ 
            color: '#666', 
            margin: 0,
            fontSize: '1.1rem'
          }}>
            Visualizing price changes across the Cardano ecosystem
          </p>
        </Box>

        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1,
          backgroundColor: '#1a1a1a',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              style={{
                background: selectedTimeframe === tf ? '#4caf50' : '#2a2a2a',
                color: selectedTimeframe === tf ? '#fff' : '#888',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {tf}
            </button>
          ))}
        </Box>

        <Box sx={{ 
          position: 'relative', 
          height: 'calc(100vh - 250px)',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <CircularProgress style={{ color: '#4caf50' }} />
            </Box>
          ) : error ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: '#f44336',
              padding: '2rem'
            }}>
              Error: {error}
            </Box>
          ) : (
            <BubbleMap data={data} timeframe={selectedTimeframe} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
