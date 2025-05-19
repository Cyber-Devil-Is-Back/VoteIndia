'use client'
import { Box, Button, TextField, Typography, Link, Alert } from "@mui/material";
import AuthBase from "@/components/parties/AuthBase";
import React from "react";
import { useRouter } from "next/navigation";

interface Cred {
  party_email: string;
  party_password: string;
}
export default function PartyLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [credintials, setCredentials] = React.useState<Cred>({
    party_email: "",
    party_password: "",
  });
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/party/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credintials),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data)
        sessionStorage.setItem("partyId", data.party_id);
        sessionStorage.setItem("status", data.status);
        sessionStorage.setItem("partyType", data.party_type);
        if (data.party_type === "State") {
          sessionStorage.setItem("stateId", data.state);
        }
        setLoginError(null); 
        router.push("/party/dashboard");
      } else {
        setIsLoading(false);
        setLoginError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error during login", error);
      setLoginError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <AuthBase>
      <Box marginLeft={3} display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold" mb={4}>Party Login Portal 🏛️</Typography>
        {loginError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {loginError}
          </Alert>
        )}
        <TextField  label="Party ID / Email"  variant="standard"  autoComplete="on"  fullWidth  margin="normal"  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCredentials({ ...credintials, party_email: e.target.value })
          }
        />
        <TextField label="Password" variant="standard" type="password" fullWidth margin="normal" onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCredentials({ ...credintials, party_password: e.target.value })
          }
        />
        <Box width="100%" textAlign="right" mt={3} mb={2}>
          <Link href="/party-forgot-password" underline="hover" fontSize="0.9rem">
            Forgot Password?
          </Link>
        </Box>

        <Button variant="contained" color="primary" fullWidth sx={{ mb: 2, textTransform: "none", fontWeight: "bold" }} loading={isLoading} onClick={handleLogin}>
          Login
        </Button>

        <Typography variant="body2">
          Not registered yet?{" "}
          <Link href="/party/register" underline="hover">
            Register your party
          </Link>
        </Typography>
      </Box>
    </AuthBase>
  );
}
