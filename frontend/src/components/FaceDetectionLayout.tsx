'use client';
import React from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import Card from './Card'; // Make sure this path matches your folder structure

interface FaceDetectionProps {
  title: string;
  children: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faceStatus: string;
  color: string;
}

export default function FaceDetectionLayout({title,children,videoRef,faceStatus,color,}: FaceDetectionProps) {
  return (
    <Card>
      {/* Ashoka Chakra */}
      <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}>
        <Image src="/ashoka-chakra.png" alt="Ashoka Chakra" width={64} height={64} style={{ width: '100%', height: 'auto' }}/>
      </Box>

      {/* Title */}
      <Typography variant="h6" component="h1" sx={{ color: '#000080', fontWeight: 'bold', mb: 2 }}>
        {title}
      </Typography>

      {/* Video Preview */}
      {videoRef && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', }} >
          <Box component="video" ref={videoRef} autoPlay muted playsInline sx={{   width: '100%',   maxHeight: { xs: 240, sm: 288 },   borderRadius: 2,   boxShadow: 3, }} />
          <Typography variant="subtitle2" sx={{   mt: 2,   fontWeight: 'bold',   color: color || 'text.primary', }} >
            {faceStatus}
          </Typography>
        </Box>
      )}
      {/* Children Content */}
      <Box mt={2}>{children}</Box>
    </Card>
  );
}
