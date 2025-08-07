import { useState, useEffect } from 'react';

export const useTermsSignature = () => {
  const [hasSignedTerms, setHasSignedTerms] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for terms signature
    const signed = localStorage.getItem("hasSignedTerms");
    const signatureDate = localStorage.getItem("signatureDate");
    
    setHasSignedTerms(signed === "true");
    setIsLoading(false);
  }, []);

  const markTermsAsSigned = (signatureData) => {
    localStorage.setItem("hasSignedTerms", "true");
    localStorage.setItem("signatureImage", signatureData);
    localStorage.setItem("signatureDate", new Date().toISOString());
    setHasSignedTerms(true);
  };

  const clearTermsSignature = () => {
    localStorage.removeItem("hasSignedTerms");
    localStorage.removeItem("signatureImage");
    localStorage.removeItem("signatureDate");
    setHasSignedTerms(false);
  };

  const getSignatureData = () => {
    return {
      hasSignedTerms: localStorage.getItem("hasSignedTerms") === "true",
      signatureImage: localStorage.getItem("signatureImage"),
      signatureDate: localStorage.getItem("signatureDate")
    };
  };

  return {
    hasSignedTerms,
    isLoading,
    markTermsAsSigned,
    clearTermsSignature,
    getSignatureData
  };
};
