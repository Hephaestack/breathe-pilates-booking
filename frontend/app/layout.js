import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackArrow from "./components/BackArrow";
import Footer from "./components/Footer";
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
  title: "Breathe Pilates Booking",
  description: "Ετοιμάστε την επόμενη προπόνησή σας με το Breathe Pilates Booking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
           <ShowBackArrow />
        {children}
        <Footer />
      </body>
    </html>
  );
}