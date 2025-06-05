// app/layout.tsx (or wherever your RootLayout is)

// Imports
import { Box } from "@mui/material";
import "../globals.css";
import "./user.css";
import ThemeRegistry from "@/components/provider/ThemeRegistry";

// RootLayout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <Box width="100vw" height="100vh" sx={{ position: 'relative', overflow: 'hidden' }}> {/* Background Image */}
    <Box sx={{position: 'absolute',width: '100%',height: '100%',backgroundImage: "url('/backgroung.webp')",backgroundSize: 'cover',backgroundPosition: 'center',backgroundRepeat: 'no-repeat',filter: 'blur(8px)',}}/>
    <Box sx={{position: 'relative',zIndex: 1, width: '100%', height: '100%',bgcolor:"transparent",padding:5 }}> 
      <ThemeRegistry>
        {children}
      </ThemeRegistry>
    </Box>
</Box>

        

  );
}

