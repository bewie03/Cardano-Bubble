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

const TimeframeFilter = ({ timeframes, selected, onChange }) => {
  const handleChange = (event, newTimeframe) => {
    if (newTimeframe !== null) {
      onChange(newTimeframe);
    }
  };

  return (
    <Box sx={{ mb: 4, mt: 2 }}>
      <StyledToggleButtonGroup
        value={selected}
        exclusive
        onChange={handleChange}
        aria-label="timeframe selection"
      >
        {timeframes.map((timeframe) => (
          <ToggleButton
            key={timeframe}
            value={timeframe}
            aria-label={`${timeframe} timeframe`}
          >
            {timeframe}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    </Box>
  );
};

export default TimeframeFilter;
