"use client";
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{position: 'relative',minHeight: '100vh',px: { xs: 2, sm: 3 },display: 'flex',alignItems: 'center',justifyContent: 'center',background: 'transparent', }} >
      <Paper elevation={6} sx={{   position: 'relative',zIndex: 10, p: { xs: 3, sm: 4 },   maxWidth: 500,   width: '100%',   textAlign: 'center',   borderRadius: 2,   backdropFilter: 'blur(12px)',   backgroundColor: 'rgba(255, 255, 255, 0.3)',   border: '2px solid white', }} >
        {children}
      </Paper>
      <Typography variant="caption" sx={{   position: 'absolute',   bottom: 16,   color: '#000080',   fontSize: { xs: '0.75rem', sm: '0.875rem' }, }} >
        Made with 🇮🇳 in India
      </Typography>
    </Box>
  );
};

export default Card;
