'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputLabel,
} from '@mui/material';
import Card from './Card';

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, placeholder }) => (
  <Box>
    <InputLabel sx={{ color: '#000080', fontWeight: 500, mb: 1 }}>{label}</InputLabel>
    <TextField
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth
      required
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '& fieldset': { borderColor: '#000080' },
          '&:hover fieldset': { borderColor: '#FF9933' },
          '&.Mui-focused fieldset': { borderColor: '#FF9933' },
        },
      }}
    />
  </Box>
);

interface LoginPageProps {
  header: string;
  input: string;
  placeholder: string;
  inputfield: string;
  password: string;
  setPassword: (value: string) => void;
  setinputfield: (value: string) => void;
  handlesubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <Card>
      {/* Logo */}
      <Box sx={{ position: 'relative', width: 60, height: 70, mx: 'auto', mb: 2 }}>
        <Image src="/electionLogo.png" alt="Election Logo" fill style={{ objectFit: 'contain' }} />
      </Box>

      {/* Header */}
      <Typography variant="h6" sx={{ color: '#000080', fontWeight: 600, mb: 2 }}>
        {props.header}
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={props.handlesubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
        <InputField label={props.input} type="text" value={props.inputfield} onChange={(e) => props.setinputfield(e.target.value)} placeholder={props.placeholder}/>

        <InputField label="Password" type="password" value={props.password} onChange={(e) => props.setPassword(e.target.value)} placeholder="••••••••"/>
        <Button type="submit" fullWidth sx={{py: 1.5,backgroundColor: '#000080', color: '#fff',fontWeight: 'bold',borderRadius: 2,'&:hover': {backgroundColor: '#FF9933',transform: 'translateY(-2px)',},transition: 'all 0.2s ease-in-out', }} >
          Login
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Link href="#" passHref legacyBehavior>
            <Typography component="a" sx={{ fontSize: 14, color: '#000080', '&:hover': { color: '#138808' } }}>
              Forgot Password?
            </Typography>
          </Link>
        </Box>
      </Box>
    </Card>
  );
}
