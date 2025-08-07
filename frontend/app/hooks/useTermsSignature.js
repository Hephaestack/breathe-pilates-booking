import { useState, useEffect } from 'react';

export const useTermsSignature = () => {
  const [hasSignedTerms, setHasSignedTerms] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage to check backend status
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Use backend data for terms status, not localStorage
        setHasSignedTerms(user.has_accepted_terms || false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setHasSignedTerms(false);
      }
    } else {
      setHasSignedTerms(false);
    }
    setIsLoading(false);
  }, []);

  const markTermsAsSigned = (signatureData) => {
    // Update user data in localStorage to reflect terms acceptance
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.has_accepted_terms = true;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
    
    // Keep signature image for display purposes only
    localStorage.setItem("signatureImage", signatureData);
    localStorage.setItem("signatureDate", new Date().toISOString());
    setHasSignedTerms(true);
  };

  const clearTermsSignature = () => {
    // Update user data in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.has_accepted_terms = false;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
    
    // Remove signature display data
    localStorage.removeItem("signatureImage");
    localStorage.removeItem("signatureDate");
    setHasSignedTerms(false);
  };

  const getSignatureData = () => {
    const userData = localStorage.getItem('user');
    let hasAcceptedTerms = false;
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        hasAcceptedTerms = user.has_accepted_terms || false;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return {
      hasSignedTerms: hasAcceptedTerms,
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
