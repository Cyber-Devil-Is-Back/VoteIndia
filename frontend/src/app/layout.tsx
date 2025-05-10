import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Vote India",
  description: "Created By Priyanshu and Pranjal",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body  >
        {children}
      </body>
    </html>
  );
}
