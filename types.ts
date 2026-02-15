
/**
 * Interface representing the structure of a processed receipt.
 */
export interface ReceiptData {
  id: string;
  date: string;
  merchant: string;
  total: number;
  paymentSource: string;
  category: string;
  status: 'pending' | 'synced' | 'error';
  imageUrl?: string;
}

/**
 * Available navigation views in the application.
 */
export type View = 'scan' | 'history' | 'edit' | 'settings';

/**
 * Common expense categories for auto-classification.
 */
export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}
