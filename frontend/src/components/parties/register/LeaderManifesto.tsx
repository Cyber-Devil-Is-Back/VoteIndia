import { Box, Button, FormHelperText } from "@mui/material";
import PartySymbolPicker from "./PartySymbolPicker";
import React, { useState } from "react";
import { PartyContactAndLeaderDetails } from "@/components/parties/register/structs";
import ThickBorderTextField from "@/components/CustomTextField";
import AccountBoxIcon from '@mui/icons-material/AccountBox';

interface Props {
  onNext: () => void | null;
  onBack: () => void | null;
  data: PartyContactAndLeaderDetails;
  onChange: (field: keyof PartyContactAndLeaderDetails, value: string | File | null) => void;
}

export default function LeaderManifesto({ onNext, onBack, data, onChange }: Props) {
  const [icon, setIcon] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof PartyContactAndLeaderDetails, value: string | File | null) => {
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
    if (!data.leadername) newErrors.leadername = "Leader name is required";
    if (!data.foundername) newErrors.foundername = "Founder name is required";
    if (!data.manifesto) newErrors.manifesto = "Manifesto text is required";
    if (!icon && !data.image) newErrors.image = "Leader image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClick = () => {
    if (icon !== null) {
      onChange('image', icon);
    }
    if (validate()) {
      onNext();
    }
  };

  return (
    <Box width="100%" minHeight="100%" display="flex" alignItems="center" justifyContent='center'>
      <Box display='flex' flexDirection={'column'} sx={{ height: '100%', padding: 10 }}>
        <PartySymbolPicker
          size={200}
          onFileSelect={(file) => {
            setIcon(file);
            handleFieldChange('image', file as File | null);
          }}
          icon={data.image}
          defaultIcon={<AccountBoxIcon fontSize="large" sx={{ color: 'black' }} />}
        />
        {errors.image && <FormHelperText error>{errors.image}</FormHelperText>}
      </Box>
      <Box display='flex' flexDirection='row' justifyContent='center' gap={3} sx={{ height: '100%' }}>
        <Box width='400px' gap={2} display='flex' flexDirection='column'>
          <ThickBorderTextField
            label="Leader Name"
            fullWidth
            value={data.leadername}
            onChange={(e) => handleFieldChange('leadername', e.target.value)}
            error={!!errors.leadername}
            helperText={errors.leadername}
          />
          <ThickBorderTextField
            label="Founder Name"
            fullWidth
            value={data.foundername}
            onChange={(e) => handleFieldChange('foundername', e.target.value)}
            error={!!errors.foundername}
            helperText={errors.foundername}
          />
          <ThickBorderTextField
            label="Manifesto Text"
            fullWidth
            multiline
            rows={4}
            value={data.manifesto}
            onChange={(e) => handleFieldChange('manifesto', e.target.value)}
            error={!!errors.manifesto}
            helperText={errors.manifesto}
          />

          <Box display="flex" width='100%' justifyContent="space-between" mt={2}>
            <Button variant="outlined" onClick={onBack}> Back </Button>
            <Button variant="contained" onClick={handleClick}> Next </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
