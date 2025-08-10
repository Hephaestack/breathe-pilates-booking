'use client';

import { useTermsSignature } from '../hooks/useTermsSignature';

export default function TermsDebugInfo() {
  const { hasSignedTerms, isLoading, getSignatureData, clearTermsSignature } = useTermsSignature();

  if (isLoading) return <div>Loading...</div>;

  const signatureData = getSignatureData();
  
  // Get current user info
  const userData = localStorage.getItem('user');
  let currentUser = null;
  try {
    currentUser = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-xs z-50">
      <h3 className="font-bold text-sm mb-2">Debug Info:</h3>
      {currentUser && (
        <p className="text-xs mb-1">
          <strong>User ID:</strong> {currentUser.id}
        </p>
      )}
      <p className="text-xs">
        <strong>Signed (Backend):</strong> {hasSignedTerms ? 'Yes' : 'No'}
      </p>
      {signatureData.signatureDate && (
        <p className="text-xs">
          <strong>Signature Date:</strong> {new Date(signatureData.signatureDate).toLocaleDateString('el-GR')}
        </p>
      )}
      <button
        onClick={clearTermsSignature}
        className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
        title="This will only clear local data, not backend status"
      >
        Clear Local Data
      </button>
    </div>
  );
}
