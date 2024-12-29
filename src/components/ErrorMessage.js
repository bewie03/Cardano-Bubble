import React from 'react';
import { Alert, Box } from '@mui/material';
import { motion } from 'framer-motion';

const ErrorMessage = ({ message }) => {
  return (
    <Box sx={{ m: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {message}
        </Alert>
      </motion.div>
    </Box>
  );
};

export default ErrorMessage;
