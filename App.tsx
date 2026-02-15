
import React, { useState, useEffect, useCallback } from 'react';
import { View, ReceiptData } from './types';
import CameraView from './components/CameraView';
import ReceiptEdit from './components/ReceiptEdit';
import HistoryView from './components/HistoryView';
import { processReceipt } from './services/geminiService';

/**
 * Main Application Component.
 * Manages global state including data persistence, navigation, and background AI tasks.
 */
const App: React.FC = () => {
  // Navigation and data state
  const [activeView, setActiveView] = useState<View>('history');
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  
  // UI States
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Transient state for data currently being reviewed by the user
  const [currentEdit, setCurrentEdit] = useState<Partial<ReceiptData> | null>(null);

  /**
   * Persistence: Load previous scan history from browser local storage on startup.
   */
  useEffect(() => {
    const saved = localStorage.getItem('scansheet_data');
    if (saved) {
      setReceipts(JSON.parse(saved));
    }
  }, []);

  /**
   * Persistence: Automatically sync local storage whenever the receipts array changes.
   */
  useEffect(() => {
    localStorage.setItem('scansheet_data', JSON.stringify(receipts));
  }, [receipts]);

  /**
   * Core logic for handling image data (from camera or file upload).
   * Passes the image to Gemini for processing and then moves to the edit view.
   */
  const handleCapture = async (base64: string) => {
    setIsScanning(false);
    setIsProcessing(true);
    try {
      // Use the Gemini service to extract data from the image
      const extractedData = await processReceipt(base64);
      // Prepare the edit view with the extracted data and the original image
      setCurrentEdit({ ...extractedData, imageUrl: base64, id: Date.now().toString() });
      setActiveView('edit');
    } catch (err) {
      alert("Failed to analyze receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Processes an uploaded file (from gallery or drag-drop).
   * Converts the file to Base64 before starting the extraction process.
   */
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        handleCapture(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Finalizes the data and adds it to the master list.
   */
  const saveReceipt = (data: ReceiptData) => {
    setReceipts(prev => [data, ...prev]);
    setCurrentEdit(null);
    setActiveView('history');
  };

  /**
   * Placeholder for Google Sheets API integration.
   */
  const simulateSync = () => {
    if (receipts.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setReceipts(prev => prev.map(r => ({ ...r, status: 'synced' as const })));
      setIsProcessing(false);
      alert("Successfully synced with Google Sheets!");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f2f2f7] shadow-2xl overflow-hidden safe-area-top">
      {/* Main content switches based on navigation state */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'history' && (
          <HistoryView 
            receipts={receipts} 
            onSync={simulateSync} 
            onUpload={handleFileUpload}
          />
        )}
        
        {activeView === 'edit' && currentEdit && (
          <ReceiptEdit 
            initialData={currentEdit} 
            onSave={saveReceipt}
            onCancel={() => setActiveView('history')}
          />
        )}

        {/* Global Modal View for Camera */}
        {isScanning && (
          <CameraView 
            onCapture={handleCapture}
            onCancel={() => setIsScanning(false)}
          />
        )}

        {/* Global Processing Spinner */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900">Processing Receipt</h3>
            <p className="text-gray-500 mt-2">Gemini AI is extracting merchant, date, and totals...</p>
          </div>
        )}
      </main>

      {/* Persistent Bottom Tab Bar */}
      <nav className="h-20 bg-white/90 backdrop-blur-md border-t flex items-center justify-around px-6 safe-area-bottom z-40">
        <button 
          onClick={() => setActiveView('history')}
          className={`flex flex-col items-center space-y-1 ${activeView === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-medium">Sheet</span>
        </button>

        {/* Floating Action Button (FAB) for Camera */}
        <button 
          onClick={() => setIsScanning(true)}
          className="relative -top-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button 
          onClick={() => alert("Setting up Google Sheets OAuth integration...")}
          className="flex flex-col items-center space-y-1 text-gray-400"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-medium">Setup</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
