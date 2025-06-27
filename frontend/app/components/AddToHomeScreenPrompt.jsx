"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../i18n/i18n";

export default function AddToHomeScreenPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if app is not installed
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    // Hide prompt if app is installed
    const onAppInstalled = () => {
      setShowPrompt(false);
      localStorage.setItem("a2hsPrompted", "true");
    };
    window.addEventListener("appinstalled", onAppInstalled);
    return () => window.removeEventListener("appinstalled", onAppInstalled);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        localStorage.setItem("a2hsPrompted", "true");
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Do NOT set localStorage here, so it will show again next time
  };

  if (!showPrompt) return null;

  return (
    <div>
      {/* Overlay for blur effect */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 transition-opacity duration-300"
        aria-hidden="true"
      />
      {/* Centered popup with animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] shadow-2xl rounded-2xl p-6 w-[90vw] max-w-sm flex flex-col items-center border border-[#b3b18f] animate-fadeIn scale-95 opacity-0 animate-popup"
          style={{
            animation: "popup 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        >
          <button
            className="absolute top-3 right-4 text-white text-2xl font-bold hover:text-[#b3b18f] focus:outline-none"
            aria-label="Close"
            onClick={handleClose}
            style={{ background: "none", border: "none" }}
          >
            ×
          </button>
          <p className="px-2 mb-4 text-base font-bold leading-snug text-center text-white sm:text-lg drop-shadow-lg">
            {t("add_to_home_title")}
          </p>
          <button
            className="w-full px-4 py-3 text-base font-semibold shadow-md sm:text-lg btn-primary rounded-xl max-w-xs"
            onClick={handleInstallClick}
            style={{ minWidth: 0 }}
          >
            {t("add_to_home_button")}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes popup {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
