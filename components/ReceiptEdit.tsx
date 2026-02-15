
import React, { useState } from 'react';
import { ReceiptData, Category } from '../types';

interface ReceiptEditProps {
  initialData: Partial<ReceiptData>;
  onSave: (data: ReceiptData) => void;
  onCancel: () => void;
}

/**
 * A form view for users to review and manually correct extracted receipt data.
 * This is critical for data accuracy before syncing to the "sheet".
 */
const ReceiptEdit: React.FC<ReceiptEditProps> = ({ initialData, onSave, onCancel }) => {
  // Local state for the editable form fields
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    merchant: initialData.merchant || '',
    total: initialData.total?.toString() || '',
    category: initialData.category || Category.OTHER,
    paymentSource: initialData.paymentSource || 'Credit Card',
  });

  /**
   * Validates and bundles the form data into a full ReceiptData object.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData.id || Date.now().toString(),
      ...formData,
      total: parseFloat(formData.total) || 0,
      status: 'pending',
      imageUrl: initialData.imageUrl
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f7]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={onCancel} className="text-blue-600 font-medium">Cancel</button>
        <h2 className="font-semibold text-lg">Verify Details</h2>
        <button onClick={handleSubmit} className="text-blue-600 font-semibold">Done</button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Receipt Image Preview for context during editing */}
        {initialData.imageUrl && (
          <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
            <img src={initialData.imageUrl} alt="Receipt" className="w-full h-full object-cover" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Transaction Details Section */}
          <div className="bg-white rounded-xl divide-y overflow-hidden border">
            <div className="flex items-center px-4 py-3">
              <label className="w-24 text-gray-500 font-medium">Merchant</label>
              <input 
                type="text" 
                value={formData.merchant}
                onChange={e => setFormData({...formData, merchant: e.target.value})}
                className="flex-1 outline-none text-right font-medium" 
                placeholder="Where did you spend?"
              />
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="w-24 text-gray-500 font-medium">Total</label>
              <div className="flex-1 flex justify-end items-center">
                <span className="mr-1 text-gray-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.total}
                  onChange={e => setFormData({...formData, total: e.target.value})}
                  className="outline-none text-right font-semibold text-lg w-24" 
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="w-24 text-gray-500 font-medium">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="flex-1 outline-none text-right bg-transparent" 
              />
            </div>
          </div>

          {/* Classification Section */}
          <div className="bg-white rounded-xl divide-y overflow-hidden border">
            <div className="flex items-center px-4 py-3">
              <label className="w-24 text-gray-500 font-medium">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="flex-1 outline-none text-right bg-transparent appearance-none text-blue-600"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center px-4 py-3">
              <label className="w-24 text-gray-500 font-medium">Source</label>
              <input 
                type="text" 
                value={formData.paymentSource}
                onChange={e => setFormData({...formData, paymentSource: e.target.value})}
                className="flex-1 outline-none text-right" 
                placeholder="Cash, Visa, etc."
              />
            </div>
          </div>
        </form>

        <p className="text-xs text-center text-gray-400 px-6">
          Double check the total and merchant name. This information will be synced to your primary expense sheet.
        </p>
      </div>
    </div>
  );
};

export default ReceiptEdit;
