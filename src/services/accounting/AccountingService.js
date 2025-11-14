/**
 * AccountingService.js
 * خدمة المحاسبة - إدارة الحسابات والقيود المحاسبية
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';

class AccountingService {
  constructor() {
    this.db = dbManager;
  }

  /**
   * إضافة حساب محاسبي جديد
   */
  async addAccount(account) {
    try {
      const accountId = `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newAccount = {
        id: accountId,
        code: account.code || this.generateAccountCode(account.type),
        name: account.name,
        name_en: account.name_en || '',
        type: account.type, // asset, liability, equity, revenue, expense
        subtype: account.subtype || '', // current_asset, fixed_asset, current_liability, etc.
        parent_id: account.parent_id || null,
        balance: account.balance || 0,
        debit_balance: 0,
        credit_balance: 0,
        is_active: account.is_active !== undefined ? account.is_active : true,
        description: account.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('accounts', newAccount);
      return newAccount;
    } catch (error) {
      console.error('خطأ في إضافة الحساب:', error);
      throw error;
    }
  }

  /**
   * تحديث حساب محاسبي
   */
  async updateAccount(accountId, updates) {
    try {
      const account = await this.db.get('accounts', accountId);
      if (!account) {
        throw new Error('الحساب غير موجود');
      }

      const updatedAccount = {
        ...account,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('accounts', updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.error('خطأ في تحديث الحساب:', error);
      throw error;
    }
  }

  /**
   * حذف حساب محاسبي
   */
  async deleteAccount(accountId) {
    try {
      // التحقق من عدم وجود قيود مرتبطة بالحساب
      const entries = await this.db.getAll('journalEntries');
      const hasEntries = entries.some(entry => 
        entry.lines.some(line => line.account_id === accountId)
      );

      if (hasEntries) {
        throw new Error('لا يمكن حذف حساب له قيود محاسبية');
      }

      await this.db.delete('accounts', accountId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الحساب:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الحسابات
   */
  async getAllAccounts(filters = {}) {
    try {
      let accounts = await this.db.getAll('accounts');

      if (filters.type) {
        accounts = accounts.filter(acc => acc.type === filters.type);
      }
      if (filters.is_active !== undefined) {
        accounts = accounts.filter(acc => acc.is_active === filters.is_active);
      }

      return accounts.sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
      console.error('خطأ في الحصول على الحسابات:', error);
      throw error;
    }
  }

  /**
   * الحصول على حساب بالمعرف
   */
  async getAccountById(accountId) {
    try {
      return await this.db.get('accounts', accountId);
    } catch (error) {
      console.error('خطأ في الحصول على الحساب:', error);
      throw error;
    }
  }

  /**
   * البحث عن حساب
   */
  async searchAccounts(searchTerm) {
    try {
      const accounts = await this.getAllAccounts({ is_active: true });
      const term = searchTerm.toLowerCase();

      return accounts.filter(acc =>
        acc.name.toLowerCase().includes(term) ||
        acc.name_en.toLowerCase().includes(term) ||
        acc.code.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('خطأ في البحث عن الحسابات:', error);
      throw error;
    }
  }

  /**
   * إضافة قيد يومية يدوي
   */
  async addJournalEntry(entry) {
    try {
      // التحقق من توازن القيد (المدين = الدائن)
      const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('القيد غير متوازن: المدين يجب أن يساوي الدائن');
      }

      const entryId = `JE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newEntry = {
        id: entryId,
        entry_number: entry.entry_number || this.generateEntryNumber(),
        date: entry.date || new Date().toISOString(),
        description: entry.description || '',
        reference_type: entry.reference_type || 'manual',
        reference_id: entry.reference_id || null,
        lines: entry.lines.map(line => ({
          account_id: line.account_id,
          account_name: line.account_name,
          debit: line.debit || 0,
          credit: line.credit || 0,
          description: line.description || '',
        })),
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'posted', // draft, posted
        created_at: new Date().toISOString(),
        created_by: entry.created_by || 'system',
      };

      await this.db.add('journalEntries', newEntry);

      // تحديث أرصدة الحسابات
      await this.updateAccountBalances(newEntry);

      return newEntry;
    } catch (error) {
      console.error('خطأ في إضافة قيد اليومية:', error);
      throw error;
    }
  }

  /**
   * تحديث أرصدة الحسابات بناءً على قيد
   */
  async updateAccountBalances(entry) {
    try {
      for (const line of entry.lines) {
        const account = await this.db.get('accounts', line.account_id);
        if (!account) continue;

        let newBalance = account.balance;
        const newDebitBalance = account.debit_balance + line.debit;
        const newCreditBalance = account.credit_balance + line.credit;

        // حساب الرصيد بناءً على نوع الحساب
        if (['asset', 'expense'].includes(account.type)) {
          // الأصول والمصروفات: المدين يزيد والدائن ينقص
          newBalance = newDebitBalance - newCreditBalance;
        } else {
          // الخصوم والإيرادات وحقوق الملكية: الدائن يزيد والمدين ينقص
          newBalance = newCreditBalance - newDebitBalance;
        }

        await this.db.update('accounts', {
          id: line.account_id,
          balance: newBalance,
          debit_balance: newDebitBalance,
          credit_balance: newCreditBalance,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث أرصدة الحسابات:', error);
      throw error;
    }
  }

  /**
   * حذف قيد يومية
   */
  async deleteJournalEntry(entryId) {
    try {
      const entry = await this.db.get('journal_entries', entryId);
      if (!entry) {
        throw new Error('القيد غير موجود');
      }

      // عكس تأثير القيد على الحسابات
      await this.reverseAccountBalances(entry);

      await this.db.delete('journalEntries', entryId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف قيد اليومية:', error);
      throw error;
    }
  }

  /**
   * عكس تأثير قيد على أرصدة الحسابات
   */
  async reverseAccountBalances(entry) {
    try {
      for (const line of entry.lines) {
        const account = await this.db.get('accounts', line.account_id);
        if (!account) continue;

        let newBalance = account.balance;
        const newDebitBalance = account.debit_balance - line.debit;
        const newCreditBalance = account.credit_balance - line.credit;

        if (['asset', 'expense'].includes(account.type)) {
          newBalance = newDebitBalance - newCreditBalance;
        } else {
          newBalance = newCreditBalance - newDebitBalance;
        }

        await this.db.update('accounts', {
          id: line.account_id,
          balance: newBalance,
          debit_balance: newDebitBalance,
          credit_balance: newCreditBalance,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في عكس أرصدة الحسابات:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع قيود اليومية
   */
  async getAllJournalEntries(filters = {}) {
    try {
      let entries = await this.db.getAll('journalEntries');

      if (filters.from_date) {
        entries = entries.filter(entry => new Date(entry.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        entries = entries.filter(entry => new Date(entry.date) <= new Date(filters.to_date));
      }
      if (filters.reference_type) {
        entries = entries.filter(entry => entry.reference_type === filters.reference_type);
      }

      return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على قيود اليومية:', error);
      throw error;
    }
  }

  /**
   * الحصول على دفتر أستاذ حساب
   */
  async getAccountLedger(accountId, fromDate = null, toDate = null) {
    try {
      const account = await this.getAccountById(accountId);
      if (!account) {
        throw new Error('الحساب غير موجود');
      }

      let entries = await this.getAllJournalEntries({
        from_date: fromDate,
        to_date: toDate,
      });

      // فلترة القيود التي تحتوي على هذا الحساب
      const accountEntries = entries
        .filter(entry => entry.lines.some(line => line.account_id === accountId))
        .map(entry => {
          const line = entry.lines.find(l => l.account_id === accountId);
          return {
            date: entry.date,
            entry_number: entry.entry_number,
            description: entry.description,
            debit: line.debit,
            credit: line.credit,
            balance: 0, // سيتم حسابه
          };
        });

      // حساب الرصيد التراكمي
      let runningBalance = 0;
      accountEntries.forEach(entry => {
        if (['asset', 'expense'].includes(account.type)) {
          runningBalance += entry.debit - entry.credit;
        } else {
          runningBalance += entry.credit - entry.debit;
        }
        entry.balance = runningBalance;
      });

      return {
        account: {
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          current_balance: account.balance,
        },
        period: {
          from: fromDate,
          to: toDate,
        },
        entries: accountEntries,
      };
    } catch (error) {
      console.error('خطأ في الحصول على دفتر أستاذ الحساب:', error);
      throw error;
    }
  }

  /**
   * ميزان المراجعة
   */
  async getTrialBalance(date = null) {
    try {
      const accounts = await this.getAllAccounts({ is_active: true });
      const endDate = date || new Date().toISOString();

      // الحصول على جميع القيود حتى التاريخ المحدد
      const entries = await this.getAllJournalEntries({ to_date: endDate });

      // حساب الأرصدة لكل حساب
      const trialBalanceItems = accounts.map(account => {
        let totalDebit = 0;
        let totalCredit = 0;

        entries.forEach(entry => {
          entry.lines.forEach(line => {
            if (line.account_id === account.id) {
              totalDebit += line.debit;
              totalCredit += line.credit;
            }
          });
        });

        let balance = 0;
        let debitBalance = 0;
        let creditBalance = 0;

        if (['asset', 'expense'].includes(account.type)) {
          balance = totalDebit - totalCredit;
          if (balance > 0) {
            debitBalance = balance;
          } else {
            creditBalance = Math.abs(balance);
          }
        } else {
          balance = totalCredit - totalDebit;
          if (balance > 0) {
            creditBalance = balance;
          } else {
            debitBalance = Math.abs(balance);
          }
        }

        return {
          account_code: account.code,
          account_name: account.name,
          account_type: account.type,
          debit_balance: debitBalance,
          credit_balance: creditBalance,
        };
      });

      // حساب المجاميع
      const totalDebit = trialBalanceItems.reduce((sum, item) => sum + item.debit_balance, 0);
      const totalCredit = trialBalanceItems.reduce((sum, item) => sum + item.credit_balance, 0);

      return {
        date: endDate,
        items: trialBalanceItems.filter(item => item.debit_balance !== 0 || item.credit_balance !== 0),
        totals: {
          total_debit: totalDebit,
          total_credit: totalCredit,
          difference: Math.abs(totalDebit - totalCredit),
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء ميزان المراجعة:', error);
      throw error;
    }
  }

  /**
   * إنشاء دليل الحسابات الافتراضي
   */
  async initializeDefaultChartOfAccounts() {
    try {
      const defaultAccounts = [
        // الأصول
        { code: '1000', name: 'الأصول', name_en: 'Assets', type: 'asset', parent_id: null },
        { code: '1100', name: 'الأصول المتداولة', name_en: 'Current Assets', type: 'asset', subtype: 'current_asset', parent_id: null },
        { code: '1110', name: 'الصندوق', name_en: 'Cash', type: 'asset', subtype: 'current_asset', parent_id: null },
        { code: '1120', name: 'البنك', name_en: 'Bank', type: 'asset', subtype: 'current_asset', parent_id: null },
        { code: '1130', name: 'العملاء', name_en: 'Accounts Receivable', type: 'asset', subtype: 'current_asset', parent_id: null },
        { code: '1140', name: 'المخزون', name_en: 'Inventory', type: 'asset', subtype: 'current_asset', parent_id: null },
        
        { code: '1200', name: 'الأصول الثابتة', name_en: 'Fixed Assets', type: 'asset', subtype: 'fixed_asset', parent_id: null },
        { code: '1210', name: 'الأراضي', name_en: 'Land', type: 'asset', subtype: 'fixed_asset', parent_id: null },
        { code: '1220', name: 'المباني', name_en: 'Buildings', type: 'asset', subtype: 'fixed_asset', parent_id: null },
        { code: '1230', name: 'الآلات والمعدات', name_en: 'Machinery & Equipment', type: 'asset', subtype: 'fixed_asset', parent_id: null },
        { code: '1240', name: 'مجمع الإهلاك', name_en: 'Accumulated Depreciation', type: 'asset', subtype: 'contra_asset', parent_id: null },

        // الخصوم
        { code: '2000', name: 'الخصوم', name_en: 'Liabilities', type: 'liability', parent_id: null },
        { code: '2100', name: 'الخصوم المتداولة', name_en: 'Current Liabilities', type: 'liability', subtype: 'current_liability', parent_id: null },
        { code: '2110', name: 'الموردون', name_en: 'Accounts Payable', type: 'liability', subtype: 'current_liability', parent_id: null },
        { code: '2120', name: 'رواتب مستحقة', name_en: 'Accrued Salaries', type: 'liability', subtype: 'current_liability', parent_id: null },

        // حقوق الملكية
        { code: '3000', name: 'حقوق الملكية', name_en: 'Equity', type: 'equity', parent_id: null },
        { code: '3100', name: 'رأس المال', name_en: 'Capital', type: 'equity', parent_id: null },
        { code: '3200', name: 'الأرباح المحتجزة', name_en: 'Retained Earnings', type: 'equity', parent_id: null },

        // الإيرادات
        { code: '4000', name: 'الإيرادات', name_en: 'Revenue', type: 'revenue', parent_id: null },
        { code: '4100', name: 'إيرادات المبيعات', name_en: 'Sales Revenue', type: 'revenue', parent_id: null },
        { code: '4200', name: 'إيرادات أخرى', name_en: 'Other Revenue', type: 'revenue', parent_id: null },

        // المصروفات
        { code: '5000', name: 'المصروفات', name_en: 'Expenses', type: 'expense', parent_id: null },
        { code: '5100', name: 'تكلفة المبيعات', name_en: 'Cost of Sales', type: 'expense', parent_id: null },
        { code: '5200', name: 'مصروفات الرواتب', name_en: 'Salaries Expense', type: 'expense', parent_id: null },
        { code: '5300', name: 'مصروف الإهلاك', name_en: 'Depreciation Expense', type: 'expense', parent_id: null },
        { code: '5400', name: 'مصروفات إدارية', name_en: 'Administrative Expenses', type: 'expense', parent_id: null },
        { code: '5500', name: 'مصروفات تشغيلية', name_en: 'Operating Expenses', type: 'expense', parent_id: null },
      ];

      for (const account of defaultAccounts) {
        await this.addAccount(account);
      }

      return true;
    } catch (error) {
      console.error('خطأ في إنشاء دليل الحسابات:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * توليد رمز حساب تلقائي
   */
  generateAccountCode(type) {
    const timestamp = Date.now().toString().slice(-4);
    const typePrefix = {
      asset: '1',
      liability: '2',
      equity: '3',
      revenue: '4',
      expense: '5',
    };
    return `${typePrefix[type] || '9'}${timestamp}`;
  }

  /**
   * توليد رقم قيد تلقائي
   */
  generateEntryNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `JE-${timestamp}-${random}`;
  }
}

// Singleton instance
let instance = null;

export const getAccountingServiceInstance = () => {
  if (!instance) {
    instance = new AccountingService();
  }
  return instance;
};

export default AccountingService;
