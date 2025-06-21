import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShowBackArrow from "./components/ShowBackArrow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Breathe Pilates Efi Zikou",
  description: "Booking system for Breathe Pilates by Efi Zikou",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" type="image/png" href="/icon.png" />
    </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ShowBackArrow />
        {children}
      </body>
    </html>
  );
}