"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
  disablebutton?: boolean;
  onGenerate?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  disablebutton,
  onGenerate,
}) => (
  <Box sx={{ position: "relative", width: "100%", mb: 2 }}>
    <TextField
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth
      required
      disabled={disabled}
      inputProps={{
        maxLength: type === "number" ? 12 : 100,
      }}
      variant="outlined"
      sx={{
        backgroundColor: disabled ? "#f5f5f5" : "white",
        "& .MuiOutlinedInput-root": {
          pr: onGenerate ? 5 : 2,
        },
      }}
    />
    {onGenerate && (
      <IconButton
        onClick={!disablebutton ? onGenerate : undefined}
        disabled={disablebutton}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          border: "1px solid",
          borderColor: disablebutton ? "grey.400" : "#000080",
          color: disablebutton ? "grey.400" : "black",
          "&:hover": {
            color: "#FF9933",
            borderColor: "#FF9933",
          },
        }}
      >
        <KeyIcon />
      </IconButton>
    )}
  </Box>
);

export default function RegisterUser() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isdisable, setIsDisable] = useState(true);
  const router = useRouter();

  const fetchUserDetails = async (userId: string) => {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/check-id/?id=${userId}`);
      if (resp.ok) {
        setError("User Already Exist");
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/adhar/?id=${userId}`);
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();
        setState(data.state);
        setName(data.name);
        setEmail(data.email);
        setIsDisable(false);
        setError("");
      }
    } catch (err) {
      console.log(err)
      setError("Invalid ID - User not found");
      setName("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ClipboardEvent<HTMLInputElement>
  ) => {
    let value = "";
    if ("clipboardData" in e) {
      e.preventDefault();
      value = e.clipboardData.getData("text");
    } else {
      value = e.target.value;
    }
    const processedValue = value.slice(0, 12);
    setId(processedValue);
    if (value.length === 12) fetchUserDetails(value);
    else setIsDisable(true);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    setPassword(
      Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
  };

  const generateWalletAddress = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/generate-wallet`);
      if (!response.ok) {
        setError("Unable to generate wallet address");
      } else {
        const data = await response.json();
        setWalletAddress(data.address);
        setError("");
      }
    } catch (err) {
      console.log(err)
      setError("Wallet generation failed");
      setWalletAddress("");
    }
  };

  const onContinue = () => {
    const data = { id, name, password, address: walletAddress, email, state };
    sessionStorage.setItem("user", JSON.stringify(data));
    router.push("/user/face-registration");
  };

  const saveCredentials = () => {
    const data = { password, walletAddress };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credentials.json";
    a.click();
    setIsSaved(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", px: 2 }}>
      <Paper elevation={6} sx={{ width: "100%", maxWidth: 600, p: 4, position: "relative" }}>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, mx: "auto", mb: 2 }}>
            <Image src="/ashoka-chakra.png" alt="Ashoka Chakra" width={60} height={60} />
          </Box>
          <Typography variant="h5" fontWeight={600} color="#000080">User Registration</Typography>
          {error && <Typography color="error" mt={1}>{error}</Typography>}
        </Box>

        <Box component="form" mt={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
           <InputField
            label="ID"
            type="number"
            value={id}
            onChange={handleInputChange}
            placeholder="Enter your unique ID"/>

            <InputField
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              disabled
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Generate strong password"
              onGenerate={generateRandomPassword}
              disabled={isdisable}
              disablebutton={isdisable}
            />
            <InputField
              label="Wallet Address"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Generate wallet address"
              onGenerate={generateWalletAddress}
              disabled
              disablebutton={isdisable}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={saveCredentials}
              disabled={!password || !walletAddress}
              sx={{
                backgroundColor: "#138808",
                "&:hover": { backgroundColor: "#0d5e07" },
              }}
            >
              Save Credentials
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onContinue}
              disabled={!isSaved}
              sx={{
                backgroundColor: "#000080",
                "&:hover": { backgroundColor: "#FF9933" },
              }}
            >
              Continue
            </Button>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#000080",
          }}
        >
          Made with 🇮🇳 in India
        </Typography>
      </Paper>
    </Box>
  );
}
