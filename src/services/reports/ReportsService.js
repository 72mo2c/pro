/**
 * ReportsService.js
 * خدمة التقارير المالية - قائمة الدخل، الميزانية، التدفقات النقدية
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';

class ReportsService {
  constructor() {
    this.db = dbManager;
  }

  /**
   * قائمة الدخل (Income Statement / Profit & Loss)
   */
  async getIncomeStatement(fromDate, toDate) {
    try {
      const accounts = await this.db.getAll('accounts');
      const entries = await this.db.getAll('journal_entries');

      // فلترة القيود حسب الفترة
      const periodEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(fromDate) && entryDate <= new Date(toDate);
      });

      // الإيرادات
      const revenueAccounts = accounts.filter(acc => acc.type === 'revenue' && acc.is_active);
      const revenues = this.calculateAccountBalances(revenueAccounts, periodEntries);
      const totalRevenue = revenues.reduce((sum, item) => sum + item.balance, 0);

      // تكلفة المبيعات
      const costAccounts = accounts.filter(acc => 
        acc.type === 'expense' && acc.code.startsWith('51') && acc.is_active
      );
      const costs = this.calculateAccountBalances(costAccounts, periodEntries);
      const totalCost = costs.reduce((sum, item) => sum + item.balance, 0);

      // مجمل الربح
      const grossProfit = totalRevenue - totalCost;

      // المصروفات التشغيلية
      const operatingExpenseAccounts = accounts.filter(acc =>
        acc.type === 'expense' && !acc.code.startsWith('51') && acc.is_active
      );
      const operatingExpenses = this.calculateAccountBalances(operatingExpenseAccounts, periodEntries);
      const totalOperatingExpenses = operatingExpenses.reduce((sum, item) => sum + item.balance, 0);

      // صافي الربح
      const netProfit = grossProfit - totalOperatingExpenses;

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        revenue: {
          items: revenues,
          total: totalRevenue,
        },
        cost_of_sales: {
          items: costs,
          total: totalCost,
        },
        gross_profit: grossProfit,
        gross_profit_margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        operating_expenses: {
          items: operatingExpenses,
          total: totalOperatingExpenses,
        },
        net_profit: netProfit,
        net_profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      };
    } catch (error) {
      console.error('خطأ في إنشاء قائمة الدخل:', error);
      throw error;
    }
  }

  /**
   * الميزانية العمومية (Balance Sheet)
   */
  async getBalanceSheet(date = null) {
    try {
      const asOfDate = date || new Date().toISOString();
      const accounts = await this.db.getAll('accounts');
      const entries = await this.db.getAll('journal_entries');

      // فلترة القيود حتى التاريخ المحدد
      const periodEntries = entries.filter(entry => new Date(entry.date) <= new Date(asOfDate));

      // الأصول
      const assetAccounts = accounts.filter(acc => acc.type === 'asset' && acc.is_active);
      const currentAssets = this.calculateAccountBalances(
        assetAccounts.filter(acc => acc.subtype === 'current_asset'),
        periodEntries
      );
      const fixedAssets = this.calculateAccountBalances(
        assetAccounts.filter(acc => acc.subtype === 'fixed_asset' && acc.code !== '1240'),
        periodEntries
      );
      const accumulatedDepreciation = this.calculateAccountBalances(
        assetAccounts.filter(acc => acc.code === '1240'),
        periodEntries
      );

      const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.balance, 0);
      const totalFixedAssets = fixedAssets.reduce((sum, item) => sum + item.balance, 0);
      const totalAccumulatedDepreciation = accumulatedDepreciation.reduce((sum, item) => sum + item.balance, 0);
      const netFixedAssets = totalFixedAssets - Math.abs(totalAccumulatedDepreciation);
      const totalAssets = totalCurrentAssets + netFixedAssets;

      // الخصوم
      const liabilityAccounts = accounts.filter(acc => acc.type === 'liability' && acc.is_active);
      const currentLiabilities = this.calculateAccountBalances(
        liabilityAccounts.filter(acc => acc.subtype === 'current_liability'),
        periodEntries
      );
      const longTermLiabilities = this.calculateAccountBalances(
        liabilityAccounts.filter(acc => acc.subtype === 'long_term_liability'),
        periodEntries
      );

      const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.balance, 0);
      const totalLongTermLiabilities = longTermLiabilities.reduce((sum, item) => sum + item.balance, 0);
      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

      // حقوق الملكية
      const equityAccounts = accounts.filter(acc => acc.type === 'equity' && acc.is_active);
      const equity = this.calculateAccountBalances(equityAccounts, periodEntries);
      const totalEquity = equity.reduce((sum, item) => sum + item.balance, 0);

      // إضافة صافي الربح/الخسارة للسنة الحالية
      const yearStart = new Date(new Date(asOfDate).getFullYear(), 0, 1).toISOString();
      const incomeStatement = await this.getIncomeStatement(yearStart, asOfDate);
      const netProfitForPeriod = incomeStatement.net_profit;

      const totalEquityWithProfit = totalEquity + netProfitForPeriod;
      const totalLiabilitiesAndEquity = totalLiabilities + totalEquityWithProfit;

      return {
        date: asOfDate,
        assets: {
          current_assets: {
            items: currentAssets,
            total: totalCurrentAssets,
          },
          fixed_assets: {
            items: fixedAssets,
            total: totalFixedAssets,
            accumulated_depreciation: totalAccumulatedDepreciation,
            net_fixed_assets: netFixedAssets,
          },
          total_assets: totalAssets,
        },
        liabilities: {
          current_liabilities: {
            items: currentLiabilities,
            total: totalCurrentLiabilities,
          },
          long_term_liabilities: {
            items: longTermLiabilities,
            total: totalLongTermLiabilities,
          },
          total_liabilities: totalLiabilities,
        },
        equity: {
          items: equity,
          total_equity: totalEquity,
          net_profit_for_period: netProfitForPeriod,
          total_equity_with_profit: totalEquityWithProfit,
        },
        total_liabilities_and_equity: totalLiabilitiesAndEquity,
        balance_check: {
          is_balanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
          difference: totalAssets - totalLiabilitiesAndEquity,
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء الميزانية العمومية:', error);
      throw error;
    }
  }

  /**
   * قائمة التدفقات النقدية (Cash Flow Statement)
   */
  async getCashFlowStatement(fromDate, toDate) {
    try {
      const cashReceipts = await this.db.getAll('cash_receipts');
      const cashDisbursements = await this.db.getAll('cash_disbursements');

      // فلترة حسب الفترة
      const periodReceipts = cashReceipts.filter(rec => {
        const recDate = new Date(rec.date);
        return recDate >= new Date(fromDate) && recDate <= new Date(toDate);
      });

      const periodDisbursements = cashDisbursements.filter(dis => {
        const disDate = new Date(dis.date);
        return disDate >= new Date(fromDate) && disDate <= new Date(toDate);
      });

      // التدفقات النقدية من الأنشطة التشغيلية
      const operatingReceipts = periodReceipts.filter(rec =>
        ['sales_invoice', 'other'].includes(rec.reference_type)
      );
      const operatingDisbursements = periodDisbursements.filter(dis =>
        ['purchase_invoice', 'payroll', 'general'].includes(dis.reference_type)
      );

      const totalOperatingInflows = operatingReceipts.reduce((sum, rec) => sum + rec.amount, 0);
      const totalOperatingOutflows = operatingDisbursements.reduce((sum, dis) => sum + dis.amount, 0);
      const netOperatingCashFlow = totalOperatingInflows - totalOperatingOutflows;

      // التدفقات النقدية من الأنشطة الاستثمارية
      const investingDisbursements = periodDisbursements.filter(dis =>
        dis.category === 'asset_purchase'
      );
      const assetSales = await this.db.getAll('asset_sales');
      const periodAssetSales = assetSales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= new Date(fromDate) && saleDate <= new Date(toDate);
      });

      const totalInvestingOutflows = investingDisbursements.reduce((sum, dis) => sum + dis.amount, 0);
      const totalInvestingInflows = periodAssetSales.reduce((sum, sale) => sum + sale.sale_price, 0);
      const netInvestingCashFlow = totalInvestingInflows - totalInvestingOutflows;

      // التدفقات النقدية من الأنشطة التمويلية
      const financingReceipts = periodReceipts.filter(rec =>
        rec.reference_type === 'capital_contribution'
      );
      const financingDisbursements = periodDisbursements.filter(dis =>
        dis.category === 'dividends' || dis.category === 'loan_repayment'
      );

      const totalFinancingInflows = financingReceipts.reduce((sum, rec) => sum + rec.amount, 0);
      const totalFinancingOutflows = financingDisbursements.reduce((sum, dis) => sum + dis.amount, 0);
      const netFinancingCashFlow = totalFinancingInflows - totalFinancingOutflows;

      // صافي التغير في النقدية
      const netCashChange = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

      // رصيد النقدية
      const cashAtStart = await this.getCashBalance(fromDate);
      const cashAtEnd = cashAtStart + netCashChange;

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        operating_activities: {
          inflows: {
            items: operatingReceipts.map(rec => ({
              date: rec.date,
              description: rec.notes || 'إيصال نقدي',
              amount: rec.amount,
            })),
            total: totalOperatingInflows,
          },
          outflows: {
            items: operatingDisbursements.map(dis => ({
              date: dis.date,
              description: dis.notes || 'مصروف نقدي',
              amount: dis.amount,
            })),
            total: totalOperatingOutflows,
          },
          net_cash_from_operations: netOperatingCashFlow,
        },
        investing_activities: {
          inflows: {
            items: periodAssetSales.map(sale => ({
              date: sale.sale_date,
              description: `بيع أصل: ${sale.asset_name}`,
              amount: sale.sale_price,
            })),
            total: totalInvestingInflows,
          },
          outflows: {
            items: investingDisbursements.map(dis => ({
              date: dis.date,
              description: dis.notes || 'شراء أصل',
              amount: dis.amount,
            })),
            total: totalInvestingOutflows,
          },
          net_cash_from_investing: netInvestingCashFlow,
        },
        financing_activities: {
          inflows: {
            items: financingReceipts.map(rec => ({
              date: rec.date,
              description: rec.notes || 'تمويل',
              amount: rec.amount,
            })),
            total: totalFinancingInflows,
          },
          outflows: {
            items: financingDisbursements.map(dis => ({
              date: dis.date,
              description: dis.notes || 'مصروف تمويلي',
              amount: dis.amount,
            })),
            total: totalFinancingOutflows,
          },
          net_cash_from_financing: netFinancingCashFlow,
        },
        summary: {
          net_change_in_cash: netCashChange,
          cash_at_beginning: cashAtStart,
          cash_at_end: cashAtEnd,
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء قائمة التدفقات النقدية:', error);
      throw error;
    }
  }

  /**
   * تقرير المبيعات
   */
  async getSalesReport(fromDate, toDate) {
    try {
      const invoices = await this.db.getAll('salesInvoices');
      const periodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= new Date(fromDate) && invDate <= new Date(toDate);
      });

      const totalSales = periodInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalCost = periodInvoices.reduce((sum, inv) => {
        return sum + inv.items.reduce((itemSum, item) => {
          return itemSum + (item.quantity * (item.cost || 0));
        }, 0);
      }, 0);
      const grossProfit = totalSales - totalCost;

      // تصنيف حسب العميل
      const byCustomer = {};
      periodInvoices.forEach(inv => {
        const customerId = inv.customer_id || 'unknown';
        if (!byCustomer[customerId]) {
          byCustomer[customerId] = {
            customer_name: inv.customer_name,
            count: 0,
            total: 0,
          };
        }
        byCustomer[customerId].count++;
        byCustomer[customerId].total += inv.total;
      });

      // تصنيف حسب المنتج
      const byProduct = {};
      periodInvoices.forEach(inv => {
        inv.items.forEach(item => {
          const productId = item.product_id;
          if (!byProduct[productId]) {
            byProduct[productId] = {
              product_name: item.product_name,
              quantity: 0,
              total: 0,
            };
          }
          byProduct[productId].quantity += item.quantity;
          byProduct[productId].total += item.price * item.quantity;
        });
      });

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          total_invoices: periodInvoices.length,
          total_sales: totalSales,
          total_cost: totalCost,
          gross_profit: grossProfit,
          gross_margin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
        },
        by_customer: Object.values(byCustomer).sort((a, b) => b.total - a.total),
        by_product: Object.values(byProduct).sort((a, b) => b.total - a.total),
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير المبيعات:', error);
      throw error;
    }
  }

  /**
   * تقرير المشتريات
   */
  async getPurchaseReport(fromDate, toDate) {
    try {
      const invoices = await this.db.getAll('purchaseInvoices');
      const periodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= new Date(fromDate) && invDate <= new Date(toDate);
      });

      const totalPurchases = periodInvoices.reduce((sum, inv) => sum + inv.total, 0);

      // تصنيف حسب المورد
      const bySupplier = {};
      periodInvoices.forEach(inv => {
        const supplierId = inv.supplier_id || 'unknown';
        if (!bySupplier[supplierId]) {
          bySupplier[supplierId] = {
            supplier_name: inv.supplier_name,
            count: 0,
            total: 0,
          };
        }
        bySupplier[supplierId].count++;
        bySupplier[supplierId].total += inv.total;
      });

      // تصنيف حسب المنتج
      const byProduct = {};
      periodInvoices.forEach(inv => {
        inv.items.forEach(item => {
          const productId = item.product_id;
          if (!byProduct[productId]) {
            byProduct[productId] = {
              product_name: item.product_name,
              quantity: 0,
              total: 0,
            };
          }
          byProduct[productId].quantity += item.quantity;
          byProduct[productId].total += item.price * item.quantity;
        });
      });

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          total_invoices: periodInvoices.length,
          total_purchases: totalPurchases,
        },
        by_supplier: Object.values(bySupplier).sort((a, b) => b.total - a.total),
        by_product: Object.values(byProduct).sort((a, b) => b.total - a.total),
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير المشتريات:', error);
      throw error;
    }
  }

  /**
   * لوحة المعلومات (Dashboard)
   */
  async getDashboardData() {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // المبيعات والمشتريات
      const salesInvoices = await this.db.getAll('salesInvoices');
      const purchaseInvoices = await this.db.getAll('purchaseInvoices');

      const monthlySales = salesInvoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= new Date(monthStart) && invDate <= new Date(monthEnd);
      });

      const monthlyPurchases = purchaseInvoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= new Date(monthStart) && invDate <= new Date(monthEnd);
      });

      const totalMonthlySales = monthlySales.reduce((sum, inv) => sum + inv.total, 0);
      const totalMonthlyPurchases = monthlyPurchases.reduce((sum, inv) => sum + inv.total, 0);

      // المخزون
      const products = await this.db.getAll('products');
      const activeProducts = products.filter(p => p.status === 'active');
      const lowStockProducts = activeProducts.filter(p => p.quantity <= p.min_quantity);
      const totalInventoryValue = activeProducts.reduce((sum, p) => sum + (p.quantity * p.cost), 0);

      // الخزينة
      const cashBalance = await this.getCashBalance();

      // قائمة الدخل الشهرية
      const incomeStatement = await this.getIncomeStatement(monthStart, monthEnd);

      return {
        period: 'current_month',
        sales: {
          total: totalMonthlySales,
          count: monthlySales.length,
        },
        purchases: {
          total: totalMonthlyPurchases,
          count: monthlyPurchases.length,
        },
        inventory: {
          total_products: activeProducts.length,
          low_stock_count: lowStockProducts.length,
          total_value: totalInventoryValue,
        },
        cash: {
          balance: cashBalance,
        },
        profitability: {
          gross_profit: incomeStatement.gross_profit,
          net_profit: incomeStatement.net_profit,
          net_margin: incomeStatement.net_profit_margin,
        },
      };
    } catch (error) {
      console.error('خطأ في إنشاء بيانات لوحة المعلومات:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * حساب أرصدة الحسابات من القيود
   */
  calculateAccountBalances(accounts, entries) {
    return accounts.map(account => {
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
      if (['asset', 'expense'].includes(account.type)) {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        account_id: account.id,
        account_code: account.code,
        account_name: account.name,
        balance: balance,
      };
    }).filter(item => item.balance !== 0);
  }

  /**
   * حساب رصيد النقدية في تاريخ معين
   */
  async getCashBalance(date = null) {
    try {
      const endDate = date ? new Date(date) : new Date();

      const receipts = await this.db.getAll('cash_receipts');
      const disbursements = await this.db.getAll('cash_disbursements');

      const periodReceipts = receipts.filter(rec => new Date(rec.date) <= endDate);
      const periodDisbursements = disbursements.filter(dis => new Date(dis.date) <= endDate);

      const totalReceipts = periodReceipts.reduce((sum, rec) => sum + rec.amount, 0);
      const totalDisbursements = periodDisbursements.reduce((sum, dis) => sum + dis.amount, 0);

      return totalReceipts - totalDisbursements;
    } catch (error) {
      console.error('خطأ في حساب رصيد النقدية:', error);
      return 0;
    }
  }
}

// Singleton instance
let instance = null;

export const getReportsServiceInstance = () => {
  if (!instance) {
    instance = new ReportsService();
  }
  return instance;
};

export default ReportsService;
