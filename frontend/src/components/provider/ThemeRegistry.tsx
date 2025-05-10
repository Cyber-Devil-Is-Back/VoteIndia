// app/ThemeRegistry.tsx
"use client"; // 👈 VERY IMPORTANT

import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme } from "@/components/provider/theme";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
