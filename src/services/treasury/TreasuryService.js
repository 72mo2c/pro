/**
 * TreasuryService.js
 * خدمة إدارة الخزينة - متكاملة مع المحاسبة
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class TreasuryService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة إيصال نقدي (قبض)
   */
  async addCashReceipt(receipt) {
    try {
      const receiptId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newReceipt = {
        id: receiptId,
        receipt_number: receipt.receipt_number || this.generateReceiptNumber(),
        reference_type: receipt.reference_type || 'other', // sales_invoice, other
        reference_id: receipt.reference_id || null,
        customer_id: receipt.customer_id || null,
        customer_name: receipt.customer_name || '',
        amount: receipt.amount,
        payment_method: receipt.payment_method || 'cash', // cash, bank_transfer, check
        date: receipt.date || new Date().toISOString(),
        notes: receipt.notes || '',
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_receipts', newReceipt);

      // تسجيل قيد محاسبي
      await this.journalService.createCashReceiptEntry(newReceipt);

      return newReceipt;
    } catch (error) {
      console.error('خطأ في إضافة إيصال نقدي:', error);
      throw error;
    }
  }

  /**
   * إضافة مصروف نقدي (صرف)
   */
  async addCashDisbursement(disbursement) {
    try {
      const disbursementId = `CD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newDisbursement = {
        id: disbursementId,
        disbursement_number: disbursement.disbursement_number || this.generateDisbursementNumber(),
        reference_type: disbursement.reference_type || 'other', // purchase_invoice, payroll, other
        reference_id: disbursement.reference_id || null,
        supplier_id: disbursement.supplier_id || null,
        supplier_name: disbursement.supplier_name || '',
        amount: disbursement.amount,
        payment_method: disbursement.payment_method || 'cash',
        category: disbursement.category || 'general', // general, salaries, utilities, rent, etc.
        date: disbursement.date || new Date().toISOString(),
        notes: disbursement.notes || '',
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_disbursements', newDisbursement);

      // تسجيل قيد محاسبي
      await this.journalService.createCashDisbursementEntry(newDisbursement);

      return newDisbursement;
    } catch (error) {
      console.error('خطأ في إضافة مصروف نقدي:', error);
      throw error;
    }
  }

  /**
   * حذف إيصال نقدي
   */
  async deleteCashReceipt(receiptId) {
    try {
      const receipt = await this.db.get('cash_receipts', receiptId);
      if (!receipt) {
        throw new Error('الإيصال غير موجود');
      }

      // عكس القيد المحاسبي
      await this.journalService.reverseEntry(`RECEIPT-${receiptId}`);

      await this.db.delete('cash_receipts', receiptId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف إيصال نقدي:', error);
      throw error;
    }
  }

  /**
   * حذف مصروف نقدي
   */
  async deleteCashDisbursement(disbursementId) {
    try {
      const disbursement = await this.db.get('cash_disbursements', disbursementId);
      if (!disbursement) {
        throw new Error('المصروف غير موجود');
      }

      // عكس القيد المحاسبي
      await this.journalService.reverseEntry(`DISBURSEMENT-${disbursementId}`);

      await this.db.delete('cash_disbursements', disbursementId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف مصروف نقدي:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الإيصالات النقدية
   */
  async getAllCashReceipts(filters = {}) {
    try {
      let receipts = await this.db.getAll('cashReceipts');

      if (filters.from_date) {
        receipts = receipts.filter(rec => new Date(rec.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        receipts = receipts.filter(rec => new Date(rec.date) <= new Date(filters.to_date));
      }
      if (filters.customer_id) {
        receipts = receipts.filter(rec => rec.customer_id === filters.customer_id);
      }

      return receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على الإيصالات النقدية:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع المصروفات النقدية
   */
  async getAllCashDisbursements(filters = {}) {
    try {
      let disbursements = await this.db.getAll('cashDisbursements');

      if (filters.from_date) {
        disbursements = disbursements.filter(dis => new Date(dis.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        disbursements = disbursements.filter(dis => new Date(dis.date) <= new Date(filters.to_date));
      }
      if (filters.category) {
        disbursements = disbursements.filter(dis => dis.category === filters.category);
      }
      if (filters.supplier_id) {
        disbursements = disbursements.filter(dis => dis.supplier_id === filters.supplier_id);
      }

      return disbursements.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على المصروفات النقدية:', error);
      throw error;
    }
  }

  /**
   * حساب رصيد الخزينة (getCurrentBalance alias)
   */
  async getCurrentBalance() {
    try {
      return await this.getCashBalance();
    } catch (error) {
      console.error('خطأ في حساب رصيد الخزينة:', error);
      return 0;
    }
  }

  /**
   * حساب رصيد الخزينة
   */
  async getCashBalance(toDate = null) {
    try {
      const endDate = toDate ? new Date(toDate) : new Date();

      const receipts = await this.getAllCashReceipts({
        to_date: endDate.toISOString(),
      });

      const disbursements = await this.getAllCashDisbursements({
        to_date: endDate.toISOString(),
      });

      const totalReceipts = receipts.reduce((sum, rec) => sum + rec.amount, 0);
      const totalDisbursements = disbursements.reduce((sum, dis) => sum + dis.amount, 0);

      return {
        total_receipts: totalReceipts,
        total_disbursements: totalDisbursements,
        balance: totalReceipts - totalDisbursements,
        as_of_date: endDate.toISOString(),
      };
    } catch (error) {
      console.error('خطأ في حساب رصيد الخزينة:', error);
      throw error;
    }
  }

  /**
   * تقرير التدفقات النقدية
   */
  async getCashFlowReport(fromDate, toDate) {
    try {
      const receipts = await this.getAllCashReceipts({
        from_date: fromDate,
        to_date: toDate,
      });

      const disbursements = await this.getAllCashDisbursements({
        from_date: fromDate,
        to_date: toDate,
      });

      // تصنيف الإيصالات حسب النوع
      const receiptsByType = {};
      receipts.forEach(rec => {
        const type = rec.reference_type || 'other';
        if (!receiptsByType[type]) {
          receiptsByType[type] = { count: 0, amount: 0 };
        }
        receiptsByType[type].count++;
        receiptsByType[type].amount += rec.amount;
      });

      // تصنيف المصروفات حسب الفئة
      const disbursementsByCategory = {};
      disbursements.forEach(dis => {
        const category = dis.category || 'other';
        if (!disbursementsByCategory[category]) {
          disbursementsByCategory[category] = { count: 0, amount: 0 };
        }
        disbursementsByCategory[category].count++;
        disbursementsByCategory[category].amount += dis.amount;
      });

      const totalReceipts = receipts.reduce((sum, rec) => sum + rec.amount, 0);
      const totalDisbursements = disbursements.reduce((sum, dis) => sum + dis.amount, 0);
      const netCashFlow = totalReceipts - totalDisbursements;

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        cash_inflows: {
          by_type: receiptsByType,
          total: totalReceipts,
          count: receipts.length,
        },
        cash_outflows: {
          by_category: disbursementsByCategory,
          total: totalDisbursements,
          count: disbursements.length,
        },
        net_cash_flow: netCashFlow,
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير التدفقات النقدية:', error);
      throw error;
    }
  }

  /**
   * تقرير الخزينة اليومي
   */
  async getDailyCashReport(date = null) {
    try {
      const reportDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999)).toISOString();

      return await this.getCashFlowReport(startOfDay, endOfDay);
    } catch (error) {
      console.error('خطأ في إنشاء تقرير الخزينة اليومي:', error);
      throw error;
    }
  }

  /**
   * إضافة حساب بنكي
   */
  async addBankAccount(account) {
    try {
      const accountId = `BANK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newAccount = {
        id: accountId,
        account_number: account.account_number,
        account_name: account.account_name,
        bank_name: account.bank_name,
        branch: account.branch || '',
        currency: account.currency || 'SAR',
        initial_balance: account.initial_balance || 0,
        current_balance: account.initial_balance || 0,
        status: account.status || 'active',
        notes: account.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('bank_accounts', newAccount);
      return newAccount;
    } catch (error) {
      console.error('خطأ في إضافة حساب بنكي:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الحسابات البنكية
   */
  async getAllBankAccounts() {
    try {
      return await this.db.getAll('bank_accounts');
    } catch (error) {
      console.error('خطأ في الحصول على الحسابات البنكية:', error);
      throw error;
    }
  }

  /**
   * تحديث رصيد حساب بنكي
   */
  async updateBankAccountBalance(accountId, amount, type = 'add') {
    try {
      const account = await this.db.get('bank_accounts', accountId);
      if (!account) {
        throw new Error('الحساب البنكي غير موجود');
      }

      const newBalance = type === 'add' 
        ? account.current_balance + amount 
        : account.current_balance - amount;

      await this.db.update('bank_accounts', accountId, {
        current_balance: newBalance,
        updated_at: new Date().toISOString(),
      });

      return newBalance;
    } catch (error) {
      console.error('خطأ في تحديث رصيد الحساب البنكي:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * توليد رقم إيصال تلقائي
   */
  generateReceiptNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `REC-${timestamp}-${random}`;
  }

  /**
   * توليد رقم مصروف تلقائي
   */
  generateDisbursementNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DIS-${timestamp}-${random}`;
  }

  /**
   * إحصائيات الخزينة
   */
  async getTreasuryStatistics(period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const endDate = new Date();

      const flowReport = await this.getCashFlowReport(
        startDate.toISOString(),
        endDate.toISOString()
      );

      const currentBalance = await this.getCashBalance();

      return {
        period: period,
        current_balance: currentBalance.balance,
        total_receipts: flowReport.cash_inflows.total,
        total_disbursements: flowReport.cash_outflows.total,
        net_cash_flow: flowReport.net_cash_flow,
        receipts_count: flowReport.cash_inflows.count,
        disbursements_count: flowReport.cash_outflows.count,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات الخزينة:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getTreasuryServiceInstance = () => {
  if (!instance) {
    instance = new TreasuryService();
  }
  return instance;
};

export default TreasuryService;
