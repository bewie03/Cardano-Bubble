import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
          }}
        >
          Loading Token Data...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingOverlay;
