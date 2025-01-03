import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: 'rgba(97, 218, 251, 0.1)',
      '&:hover': {
        backgroundColor: 'rgba(97, 218, 251, 0.2)',
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
}));

const timeframeOptions = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' }
];

const TimeframeFilter = ({ timeframes = timeframeOptions, selected, onChange }) => {
  const handleChange = (event, newTimeframe) => {
    if (newTimeframe !== null) {
      onChange(newTimeframe);
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <StyledToggleButtonGroup
        value={selected}
        exclusive
        onChange={handleChange}
        aria-label="timeframe"
      >
        {timeframes.map((timeframe) => (
          <ToggleButton
            key={timeframe.value}
            value={timeframe.value}
            aria-label={`${timeframe.label} timeframe`}
          >
            {timeframe.label}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </Box>
  );
};

export default TimeframeFilter;
