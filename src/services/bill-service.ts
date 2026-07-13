import { type BillProvider, type BillDetails, type BillStatus } from '@/types';
import { BILL_CATEGORIES } from '@/lib/bill-categories';
import { delay, generateId } from '@/lib/utils';

export const BillService = {
  /**
   * Get all bill providers for a specific category
   */
  getProviders(categoryId: string): BillProvider[] {
    const category = BILL_CATEGORIES.find((cat) => cat.id === categoryId);
    return category ? category.providers : [];
  },

  /**
   * Validate a consumer number for a given category
   */
  validateConsumerNumber(categoryId: string, consumerNumber: string): { valid: boolean; error?: string } {
    const category = BILL_CATEGORIES.find((cat) => cat.id === categoryId);
    if (!category) return { valid: false, error: 'Invalid category' };

    if (!consumerNumber || consumerNumber.trim() === '') {
      return { valid: false, error: `${category.consumerNumberLabel} is required` };
    }

    if (category.consumerNumberPattern) {
      const regex = new RegExp(category.consumerNumberPattern);
      if (!regex.test(consumerNumber)) {
        return {
          valid: false,
          error: `Invalid format. Please verify the ${category.consumerNumberLabel}`,
        };
      }
    }

    return { valid: true };
  },

  /**
   * Simulates fetching real-time bill details from a provider
   */
  async fetchBill(providerId: string, consumerNumber: string): Promise<BillDetails> {
    await delay(1200); // Realistic network delay

    // Find the provider details
    let provider: BillProvider | undefined;
    for (const cat of BILL_CATEGORIES) {
      const found = cat.providers.find((p) => p.id === providerId);
      if (found) {
        provider = found;
        break;
      }
    }

    if (!provider) {
      throw new Error('Utility provider not found');
    }

    // Mock realistic bill names
    const mockNames = [
      'Ankit Kumar',
      'Ankit Kumar', // Default user
      'Vijay Shekhar',
      'Nandan Nilekani',
      'Kunwar Singh',
    ];
    const consumerName = mockNames[Math.floor(Math.random() * mockNames.length)];

    // Generate random mock amount (utility bills usually range from 200 to 5000 INR)
    const amount = Math.floor(Math.random() * 4500) + 300;

    // Set due date 10 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const billDate = new Date();
    billDate.setDate(billDate.getDate() - 20);
    const billDateStr = billDate.toISOString().split('T')[0];

    const statuses: BillStatus[] = ['unpaid', 'unpaid', 'unpaid', 'overdue'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      provider,
      consumerNumber,
      consumerName,
      amount,
      currency: 'INR',
      dueDate: dueDateStr,
      billDate: billDateStr,
      billNumber: generateId('BILL'),
      status,
      additionalInfo: {
        BillingCycle: 'Monthly',
        TariffRate: 'Domestic LT-1',
        MeterNumber: `MTR-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    };
  },
};
