import "./globals.css";
import ShowBackArrow from "./components/ShowBackArrow";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import AddToHomeScreenPrompt from "./components/AddToHomeScreenPrompt";

export const metadata = {
  title: "Breathe Pilates Efi Zikou",
  description: "Booking system for Breathe Pilates by Efi Zikou",
};

export default function RootLayout({ children, params }) {
  // Get locale from params or fallback to 'en'
  const locale = params?.locale || 'el';
  return (
    <html lang={locale === 'el' ? 'el' : 'en'} translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b3b18f" />
      </head>
      <body className="antialiased">
        <ShowBackArrow />
        <ServiceWorkerRegister />
        <AddToHomeScreenPrompt />
        {children}
      </body>
    </html>
  );
}