// app/layout.tsx (or wherever your RootLayout is)

// Imports
import { Box } from "@mui/material";
import "../globals.css";
import './parties.css';
import ThemeRegistry from "@/components/provider/ThemeRegistry";

// RootLayout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box width='100vw' height='100vh'>
      <ThemeRegistry>
          {children}
        </ThemeRegistry>
    </Box>
        

  );
}
