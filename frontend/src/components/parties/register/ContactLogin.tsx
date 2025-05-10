"use client";

import React, { useState } from "react";
import { Box, Button, IconButton, InputAdornment, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ThickBorderTextField from "@/components/CustomTextField";
import { PartyContactAndLeaderDetails } from "@/components/parties/register/structs";

interface Props {
  onNext: () => void;
  onBack: () => void;
  data: PartyContactAndLeaderDetails;
  onChange: (field: keyof PartyContactAndLeaderDetails, value: string | File | null) => void;
}

const ContactDetails: React.FC<Props> = ({ onNext, onBack, data, onChange }) => {
  const [form, setForm] = useState({
    email: data.email || "",
    password: data.password || "",
    confirmPassword: data.confirmPassword || "",
    phone: data.phone || "",
    website: data.website || "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [PasswordFocused, setPasswordFocused] = useState(false);
  const [PasswordFocused2, setPasswordFocused2] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    };

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Valid email required";
      isValid = false;
    }

    if (!form.password || form.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
      isValid = false;
    }

    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!form.phone || !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    onChange(name as keyof PartyContactAndLeaderDetails, value);

    // Clear errors for the changed field if it has content
    if (errors[name as keyof typeof errors] && value) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log(data);
      onNext();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%" alignItems="center" justifyContent="center">
      <Box width="500px" display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography variant="h6">Contact & Login Details</Typography>

        <ThickBorderTextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
        />

        <ThickBorderTextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((show) => !show)}
                  edge="end"
                  sx={{ color: PasswordFocused ? "primary.main" : "gray" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <ThickBorderTextField
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          fullWidth
          onFocus={() => setPasswordFocused2(true)}
          onBlur={() => setPasswordFocused2(false)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((show) => !show)}
                  edge="end"
                  sx={{ color: PasswordFocused2 ? "primary.main" : "gray" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <ThickBorderTextField
          label="Phone Number"
          name="phone"
          type="number"
          value={form.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          fullWidth
          InputProps={{
            sx: {
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "& input[type=number]::-webkit-outer-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
              "& input[type=number]::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
            },
          }}
        />

        <ThickBorderTextField
          label="Website (optional)"
          name="website"
          value={form.website}
          onChange={handleChange}
          fullWidth
        />

        <Box display="flex" width="100%" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={onBack}> Back </Button>
          <Button variant="contained" onClick={handleSubmit}> Next </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactDetails;
