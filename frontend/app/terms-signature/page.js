'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { useTermsSignature } from '../hooks/useTermsSignature';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function TermsSignaturePage() {
  const sigCanvas = useRef(null);
  const router = useRouter();
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [canvasHeight, setCanvasHeight] = useState('256px');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { markTermsAsSigned } = useTermsSignature();
  const { toasts, hideToast, showError, showSuccess } = useToast();

  // Check if user has already signed terms and redirect if so
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.has_accepted_terms) {
          // User has already signed terms, redirect to appropriate dashboard
          if (user.role === 'instructor') {
            router.push('/instructor-dashboard');
          } else if (user.role === 'Admin') {
            router.push('/admin-dashboard');
          } else {
            router.push('/client-dashboard');
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  // Set canvas height based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) { // xl screens
        setCanvasHeight('288px'); // xl:h-72
      } else if (width >= 1024) { // lg screens  
        setCanvasHeight('256px'); // lg:h-64
      } else if (width >= 768) { // md screens
        setCanvasHeight('192px'); // md:h-48
      } else if (width >= 640) { // sm screens
        setCanvasHeight('160px'); // sm:h-40
      } else { // mobile
        setCanvasHeight('128px'); // h-32
      }
    };
    
    handleResize(); // Set initial height
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const termsText = `
Όροι Συμμετοχής – Breathe Pilates Efi Zikou

Το Breathe Pilates – Efi Zikou είναι χώρος ομαδικής και ατομικής άσκησης, που προσφέρει:

• Pilates Mat
• Pilates Equipment (Reformer, Wunda Chair, Cadillac, Ladder Barrel)
• Κυκλική ομαδική προπόνηση
• Yoga
• Προγράμματα Pilates για ειδικές πληθυσμιακές ομάδες (ορθοπροβλήματα, οστεοπόρωση, εγκυμοσύνη, σχολική ηλικία, αθλητές, κ.ά.)

ΙΑΤΡΙΚΉ ΒΕΒΑΊΩΣΗ

• Για να εγγραφεί κάποιος απαιτείται ιατρική βεβαίωση καταλληλότητας
• Η βεβαίωση μπορεί να προέρχεται από παθολόγο, καρδιολόγο ή ορθοπεδικό
• Σε περίπτωση προβλήματος υγείας, η άσκηση επιτρέπεται μόνο με άδεια του γιατρού

ΌΡΟΙ ΠΡΟΠΌΝΗΣΗΣ

• Τα μαθήματα ξεκινούν στην ώρα τους και διαρκούν 50 λεπτά
• Η συμμετοχή γίνεται μόνο με κράτηση θέσης
• Ακυρώσεις γίνονται το αργότερο 30 ώρες πριν το μάθημα
• Οι συνδρομές δεν μεταφέρονται σε άλλους και δεν επιστρέφονται
• Ακυρώσεις εκτός προθεσμίας ή απουσίες δεν αναπληρώνονται

ΛΕΙΤΟΥΡΓΊΑ ΧΏΡΟΥ

• Να έρχεστε 5-10 λεπτά πριν την ώρα του μαθήματος
• Χρήση καθαρών καλτσών κατά την προπόνηση
• Αποφυγή χρήσης κινητού κατά τη διάρκεια
• Οι τσάντες και προσωπικά αντικείμενα φυλάσσονται στα ντουλάπια

ΤΙΜΟΚΑΤΆΛΟΓΟΣ

Συνδρομές μηνιαίες:
• 2 φορές/εβδομάδα → 80€
• 3 φορές/εβδομάδα → 110€

Πακέτα μαθημάτων:
• 10 μαθήματα → 120€
• 15 μαθήματα → 170€

Cadillac Flow / Clinical Pilates:
• 1 μάθημα → 15€
• 5 μαθήματα → 70€
• 10 μαθήματα → 130€

• Drop in (Μεμονωμένο μάθημα): 15€
• Personal: 25€

  `;

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignaturePreview(null);
  };

  const saveSignature = async () => {
    if (sigCanvas.current.isEmpty()) {
      showError('Παρακαλώ υπογράψτε πριν συνεχίσετε');
      return;
    }

    setIsSubmitting(true);
    const dataURL = sigCanvas.current.toDataURL();
    setSignaturePreview(dataURL);
    
    try {
      // Get user data
      const userData = localStorage.getItem('user');
      if (!userData) {
        showError('Δεν βρέθηκαν στοιχεία χρήστη. Παρακαλώ συνδεθείτε ξανά.');
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // Call the backend API to accept terms
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/accept_terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you're using tokens
          // 'Authorization': `Bearer ${user.token}`,
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Use the custom hook to save signature locally (for backup/display)
        markTermsAsSigned(dataURL);
        
        // Show success message briefly
        showSuccess('Οι όροι χρήσης αποδέχθηκαν επιτυχώς!');
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          // Redirect based on user role
          if (user.role === 'instructor') {
            router.push('/instructor-dashboard');
          } else if (user.role === 'Admin') {
            router.push('/admin-dashboard');
          } else {
            router.push('/client-dashboard');
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        showError(errorData.detail || 'Σφάλμα κατά την αποδοχή των όρων. Παρακαλώ δοκιμάστε ξανά.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      showError('Σφάλμα σύνδεσης. Παρακαλώ ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #b3b18f;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A5957E;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        .signature-container canvas {
          background: transparent !important;
        }
        .terms-container {
          scrollbar-width: thin;
          scrollbar-color: #b3b18f transparent;
          padding-right: 8px;
          margin-right: -8px;
        }
        /* Mobile specific scrollbar adjustments */
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          .terms-container {
            padding-right: 6px;
            margin-right: -6px;
          }
        }
      `}</style>
      <div className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-4 sm:py-6 lg:py-8 sm:px-4 lg:px-6">
      <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-lg bg-white/80 shadow-[#3a2826] rounded-3xl shadow-2xl px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 w-full flex flex-col items-center">
          
          {/* Logo and Title */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-4 shadow-[#3a2826]">
            <img
              src="/logo.svg"
              alt="Logo"
              className="object-cover w-16 h-12 sm:w-20 sm:h-16 md:w-24 md:h-18"
              style={{ background: 'none' }}
            />
          </div>
          
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-[#4A2C2A] text-center mb-1 tracking-tight drop-shadow">
            Όροι και Προϋποθέσεις Χρήσης
          </h1>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#4A2C2A] text-center tracking-tight drop-shadow mb-4 sm:mb-6">
            Breathe Pilates - Efi Zikou
          </h2>
        
          {/* Terms Text Box */}
          <div className="h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-y-scroll border-2 border-[#b3b18f] rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 mb-4 sm:mb-6 bg-white/60 backdrop-blur-sm shadow-inner custom-scrollbar terms-container">
            <div className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed whitespace-pre-line text-[#4A2C2A] font-semibold">
              {termsText}
            </div>
          </div>

          {/* Signature Section */}
          <div className="w-full mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#4A2C2A] mb-3 sm:mb-4 text-center">
              Υπογραφή Αποδοχής
            </h2>
          
            <div className="border-2 border-[#b3b18f] rounded-2xl mb-3 sm:mb-4 bg-white/90 shadow-inner overflow-hidden relative signature-container">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#4A2C2A"
                canvasProps={{ 
                  className: "w-full h-32 sm:h-40 md:h-48 lg:h-64 xl:h-72 touch-none",
                  style: { 
                    width: '100%', 
                    height: canvasHeight,
                    touchAction: 'none',
                    display: 'block',
                    borderRadius: '0',
                    border: 'none',
                    outline: 'none'
                  }
                }}
              />
            </div>
          
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#4A2C2A] mb-3 sm:mb-4 text-center font-semibold">
              Παρακαλώ υπογράψτε παραπάνω για να επιβεβαιώσετε την αποδοχή των όρων
            </p>
          </div>

          {/* Preview Section */}
          {signaturePreview && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-5 lg:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#b3b18f] w-full">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#4A2C2A] mb-2 sm:mb-3 md:mb-4 text-center">
                Προεπισκόπηση Υπογραφής:
              </h3>
              <div className="flex justify-center">
                <img 
                  src={signaturePreview} 
                  alt="Signature Preview" 
                  className="border border-[#b3b18f] rounded-lg max-h-24 sm:max-h-32 md:max-h-40 lg:max-h-48 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col w-full max-w-xs gap-3 sm:max-w-sm md:max-w-md lg:max-w-lg sm:gap-4 sm:flex-row">
            <button
              onClick={clearSignature}
              className="flex-1 bg-white/80 hover:bg-white/90 text-[#4A2C2A] border-2 border-[#b3b18f] px-4 sm:px-6 py-2 sm:py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Καθαρισμός
            </button>
            <button
              onClick={saveSignature}
              disabled={isSubmitting}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] hover:from-[#A5957E] hover:to-[#b3b18f] text-white'
              }`}
            >
              {isSubmitting && (
                <svg className="inline w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Αποθήκευση...' : 'Υπογραφή & Συνέχεια'}
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base lg:text-lg text-[#4A2C2A] text-center font-semibold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            Με την υπογραφή επιβεβαιώνετε ότι αποδέχεστε τους όρους και προϋποθέσεις
          </div>
        </div>
      </div>
      </div>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </>
  );
}
