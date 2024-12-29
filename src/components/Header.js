import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Header = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #61dafb 30%, #4CAF50 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(97, 218, 251, 0.3)',
              my: 2,
            }}
          >
            Cardano Token Bubble Map
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.secondary',
              mb: 2,
            }}
          >
            Visualizing price changes across the Cardano ecosystem
          </Typography>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
