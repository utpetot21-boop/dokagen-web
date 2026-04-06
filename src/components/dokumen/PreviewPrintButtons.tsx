'use client';

import { useState } from 'react';

export default function PreviewPrintButtons({ pdfUrl }: { pdfUrl: string }) {
  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    const w = window.open(pdfUrl, '_blank');
    if (w) {
      w.addEventListener('load', () => w.print());
    }
  };

  return (
    <>
      {/* Tombol Preview */}
      <button
        onClick={() => setShowPreview(true)}
        className="flex items-center gap-2 border border-[#E8E8EE] bg-white text-textPrimary px-4 py-2
          rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
      </button>

      {/* Tombol Print */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 border border-[#E8E8EE] bg-white text-textPrimary px-4 py-2
          rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPreview(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-card shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E8EE] flex-shrink-0">
              <p className="font-semibold text-textPrimary text-sm">Preview Dokumen</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-button text-xs font-semibold hover:bg-[#163264] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E8EE] text-textPrimary rounded-button text-xs font-semibold hover:bg-bgLight transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 rounded-lg hover:bg-bgLight transition-colors text-textSecondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* PDF iframe */}
            <iframe
              src={pdfUrl}
              className="flex-1 w-full rounded-b-card"
              title="Preview PDF"
            />
          </div>
        </div>
      )}
    </>
  );
}
