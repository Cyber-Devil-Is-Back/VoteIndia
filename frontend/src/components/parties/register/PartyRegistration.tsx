'use client'

import { Box, MenuItem, Button, FormHelperText } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import PartySymbolPicker from "./PartySymbolPicker";
import React, { useState } from "react";
import ThickBorderTextField from "@/components/CustomTextField";

interface PartyDetails {
  partyname: string;
  partyabbr: string;
  logo: File | null;
  slogan: string;
  date: string;
  partytype: string;
  state: string;
  desc: string;
}

interface PartyRegistrationProps {
  data: PartyDetails;
  onChange: (field: keyof PartyDetails, value: string | File | null) => void;
  onClick: () => void;
}

const indianStatesWithLegislativeAssembly = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

const PartyRegistration = ({ onClick, data, onChange }: PartyRegistrationProps) => {
  const [icon, setIcon] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof PartyDetails, value: string | File | null) => {
    onChange(field, value);
    if (errors[field] && value) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.partyname) newErrors.partyname = "Party name is required";
    if (!data.partyabbr) newErrors.partyabbr = "Abbreviation is required";
    if (!data.slogan) newErrors.slogan = "Slogan is required";
    if (!data.date) newErrors.date = "Established date is required";
    if (!data.partytype) newErrors.partytype = "Party type is required";
    if (data.partytype === 'state' && !data.state) newErrors.state = "State is required for state parties";
    if (!data.desc) newErrors.desc = "Description is required";
    if (!icon && !data.logo) newErrors.logo = "Party logo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClick = () => {
    if (icon !== null) {
      onChange('logo', icon);
    }
    if (validate()) {
      onClick();
    }
  };

  return (
    <Box width="100%" minHeight="100%" display="flex" alignItems="center" justifyContent='center'>
      <Box display='flex' justifyContent='center' alignItems='center' sx={{ height: '100%', padding: 10, flexDirection: 'column' }}>
        <PartySymbolPicker
          size={200}
          onFileSelect={(file) => {
            setIcon(file);
            handleFieldChange('logo', file as File | null);
          }}
          icon={data.logo}
          defaultIcon={<FlagIcon fontSize="large" sx={{ color: 'black' }} />}
        />
        {errors.logo && <FormHelperText error>{errors.logo}</FormHelperText>}
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='center' gap={3} sx={{ height: '100%' }}>
        <Box width='400px' gap={2} display='flex' flexDirection='column'>
          <ThickBorderTextField
            label="Party Name"
            fullWidth
            value={data.partyname}
            onChange={(e) => handleFieldChange('partyname', e.target.value)}
            error={!!errors.partyname}
            helperText={errors.partyname}
          />
          <ThickBorderTextField
            label="Abbreviation"
            fullWidth
            value={data.partyabbr}
            onChange={(e) => handleFieldChange('partyabbr', e.target.value)}
            error={!!errors.partyabbr}
            helperText={errors.partyabbr}
          />
          <ThickBorderTextField
            label="Slogan"
            fullWidth
            value={data.slogan}
            onChange={(e) => handleFieldChange('slogan', e.target.value)}
            error={!!errors.slogan}
            helperText={errors.slogan}
          />
          <ThickBorderTextField
            label='Established Date'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={data.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
          />
          <ThickBorderTextField
            label="Party Type"
            fullWidth
            select
            value={data.partytype}
            onChange={(e) => handleFieldChange('partytype', e.target.value)}
            error={!!errors.partytype}
            helperText={errors.partytype}
          >
            <MenuItem key='national' value="national">National</MenuItem>
            <MenuItem key='state' value="state">State</MenuItem>
          </ThickBorderTextField>
        </Box>
        <Box width='400px' gap={2} display='flex' flexDirection='column' justifyContent='space-between'>
          {data.partytype === 'state' && (
            <ThickBorderTextField
              label="State"
              fullWidth
              select
              value={data.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              error={!!errors.state}
              helperText={errors.state}
            >
              {indianStatesWithLegislativeAssembly.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </ThickBorderTextField>
          )}
          <ThickBorderTextField
            label='Description'
            multiline
            rows={4}
            fullWidth
            value={data.desc}
            onChange={(e) => handleFieldChange('desc', e.target.value)}
            error={!!errors.desc}
            helperText={errors.desc}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleClick}>Next</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PartyRegistration;
