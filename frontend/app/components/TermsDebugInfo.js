'use client';

import { useTermsSignature } from '../hooks/useTermsSignature';

export default function TermsDebugInfo() {
  const { hasSignedTerms, isLoading, getSignatureData, clearTermsSignature } = useTermsSignature();

  if (isLoading) return <div>Loading...</div>;

  const signatureData = getSignatureData();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-xs z-50">
      <h3 className="font-bold text-sm mb-2">Debug Info:</h3>
      <p className="text-xs">
        <strong>Signed:</strong> {hasSignedTerms ? 'Yes' : 'No'}
      </p>
      {signatureData.signatureDate && (
        <p className="text-xs">
          <strong>Date:</strong> {new Date(signatureData.signatureDate).toLocaleDateString('el-GR')}
        </p>
      )}
      <button
        onClick={clearTermsSignature}
        className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
      >
        Clear Signature
      </button>
    </div>
  );
}
