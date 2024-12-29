import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Alert, Fade } from '@mui/material';
import BubbleMap from './components/BubbleMap';
import TimeframeFilter from './components/TimeframeFilter';
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

// Loading messages to show in sequence
const loadingMessages = [
  'Fetching token data...',
  'Processing price changes...',
  'Preparing visualization...'
];

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  // Cycle through loading messages
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data from server...');
      const response = await axios.get('/api/prices');
      console.log('Received data:', response.data);
      
      if (response.data && Array.isArray(response.data.tokens)) {
        if (response.data.tokens.length === 0) {
          setError('No data available');
        } else {
          const validData = response.data.tokens.filter(token => 
            token && token.changes && typeof token.changes[selectedTimeframe] === 'number'
          );
          if (validData.length > 0) {
            setData(validData);
            if (response.data.errors) {
              setError({
                severity: 'warning',
                message: 'Some tokens failed to load',
                details: response.data.errors
              });
            }
          } else {
            setError('No valid token data received');
          }
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError({
        severity: 'error',
        message: errorMessage,
        details: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  // Fetch data initially and when timeframe changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderError = () => {
    if (!error) return null;

    const errorObj = typeof error === 'string' ? { message: error, severity: 'error' } : error;
    const details = errorObj.details ? (
      <pre style={{ marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(errorObj.details, null, 2)}
      </pre>
    ) : null;

    return (
      <Alert severity={errorObj.severity || 'error'} sx={{ mb: 2 }}>
        {errorObj.message}
        {details}
      </Alert>
    );
  };

  const handleTimeframeChange = (newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        p: 3,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <TimeframeFilter
          selected={selectedTimeframe}
          onChange={handleTimeframeChange}
        />
        {renderError()}
        {loading ? (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Fade in={true} timeout={500}>
              <Box sx={{ typography: 'h6', color: 'text.secondary' }}>
                {loadingMessage}
              </Box>
            </Fade>
          </Box>
        ) : (
          <BubbleMap data={data} timeframe={selectedTimeframe} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
