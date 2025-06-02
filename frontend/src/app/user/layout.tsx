import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vote India",
  description: "Vote India - A secure and reliable voting system", 
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen relative`}>
      <div 
        className="absolute inset-0 bg-[url('/images.jpeg')] bg-cover bg-center bg-no-repeat"
      ></div>
      <div 
        className="absolute inset-0 bg-white/30 backdrop-blur-[4px]"
      ></div>
      <div className="relative z-10">
        {children}
      </div>
    </body>

    </html>
  );
}