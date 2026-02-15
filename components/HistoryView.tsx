
import React, { useRef, useState } from 'react';
import { ReceiptData } from '../types';

interface HistoryViewProps {
  receipts: ReceiptData[];
  onSync: () => void;
  onUpload: (file: File) => void;
}

/**
 * The main "Dashboard" view showing a history of all scanned items.
 * Supports drag-and-drop file uploads and tabular data visualization.
 */
const HistoryView: React.FC<HistoryViewProps> = ({ receipts, onSync, onUpload }) => {
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- Drag and Drop Logic ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  /**
   * Triggered when the user picks a file from the native file browser.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full bg-[#f2f2f7] transition-colors ${isDragging ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* View Header with summary stats */}
      <header className="px-4 pt-8 pb-4 bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Receipts</h1>
            <p className="text-gray-500 font-medium">Total: ${totalSpent.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            {/* Native file picker trigger */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-full font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </button>
            <button 
              onClick={onSync}
              className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Sync
            </button>
          </div>
        </div>
      </header>

      {/* Hidden file input controlled by custom buttons */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex-1 overflow-auto">
        {/* Empty State / Drag & Drop Target Area */}
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <div 
              className={`w-full max-w-sm border-2 border-dashed rounded-2xl p-12 flex flex-col items-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-105' : 'border-gray-200 bg-white/50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg className={`w-16 h-16 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'opacity-20 text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold text-gray-900 mb-1">No receipts yet</h3>
              <p className="text-sm mb-6">Drop a receipt image here or use the scan button below.</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                Choose from gallery
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* "Spreadsheet" Tabular Data View */
          <div className="bg-white m-4 rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider">Merchant</th>
                    <th className="px-4 py-2 text-right text-gray-500 font-semibold uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-semibold uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-center text-gray-500 font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="active:bg-gray-50">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{receipt.date}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{receipt.merchant}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">${receipt.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {receipt.status === 'synced' ? (
                          <span className="text-green-500" title="Synced">●</span>
                        ) : (
                          <span className="text-orange-400 animate-pulse" title="Pending Sync">●</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Visual Drop Zone Feedback Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/20 backdrop-blur-[2px] z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center border-2 border-blue-500">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-bold text-blue-600">Drop to extract details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
