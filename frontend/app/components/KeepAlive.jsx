"use client";
import { useEffect } from "react";

export default function KeepAlive() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000"); // Replace with your backend root or a lightweight endpoint
    }, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(interval);
  }, []);
  return null;
}
