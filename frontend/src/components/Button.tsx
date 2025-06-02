'use client';

import RightArrow from '@/components/icon/RightArrow';
import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface ButtonProps {
  isModelLoaded: boolean;
  status: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MuiButton: React.FC<ButtonProps> = ({ isModelLoaded, status, onClick }) => {
  const isEnabled = isModelLoaded && status.includes('green');

  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      disabled={!isEnabled}
      onClick={onClick}
      sx={{
        width: '100%',
        py: 1.5,
        textTransform: 'none',
        fontWeight: 'bold',
        gap: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.2s ease-in-out',
        ...(isEnabled && {
          bgcolor: '#000080',
          '&:hover': {
            bgcolor: '#FF9933',
            transform: 'translateY(-4px)',
          },
          cursor: 'pointer',
        }),
        ...(!isEnabled && {
          bgcolor: 'grey.400',
          cursor: 'not-allowed',
        }),
      }}
    >
      {isModelLoaded ? (
        <>
          Continue
          <RightArrow />
        </>
      ) : (
        <>
          <CircularProgress size={20} color="inherit" />
          Loading...
        </>
      )}
    </Button>
  );
};

export default MuiButton;
