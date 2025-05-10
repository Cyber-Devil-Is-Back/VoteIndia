import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Avatar, Stack } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

interface PartySymbolPickerProps {
  size?: number;
  onFileSelect?: React.Dispatch<React.SetStateAction<File | null>>;
  icon?: File | null;
  defaultIcon: React.ReactElement
}

const PartySymbolPicker: React.FC<PartySymbolPickerProps> = ({ size = 80, onFileSelect, icon, defaultIcon }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when icon prop changes
  useEffect(() => {
    if (icon) {
      const objectUrl = URL.createObjectURL(icon);
      setPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreview(null);
    }
  }, [icon]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      onFileSelect?.(file); // This triggers icon change in parent, which updates preview via useEffect
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect?.(null);
  };

  const handleClick = () => {
    if (preview) {
      console.log(preview)
      setPreview(null)
      handleRemove();
    }
     else {
      fileInputRef.current?.click();
    }
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Box position="relative">
        <Avatar
          src={preview || undefined}
          sx={{
            width: size,
            height: size,
            bgcolor: preview ? 'transparent' : 'grey.200',
            borderRadius: 0,
          }}
        >
          {!preview && defaultIcon}
        </Avatar>

        <IconButton
          color="primary"
          onClick={handleClick}
          sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', width: size * 0.3, height: size * 0.3, padding: 0, zIndex: 1}}>
          {preview ? <DeleteIcon /> : <PhotoCamera />}
        </IconButton>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </Box>
    </Stack>
  );
};

export default PartySymbolPicker;
