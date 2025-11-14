/**
 * SalesService.js
 * خدمة إدارة المبيعات - متكاملة مع المخزون، الخزينة، والمحاسبة
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class SalesService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة فاتورة مبيعات جديدة
   * يحدث: المخزون، الخزينة (إذا كان هناك دفعة نقدية)، القيود المحاسبية
   */
  async addSalesInvoice(invoice) {
    try {
      // التحقق من البيانات المطلوبة
      if (!invoice.customer_id || !invoice.items || invoice.items.length === 0) {
        throw new Error('بيانات الفاتورة غير مكتملة');
      }

      // إنشاء معرف فريد للفاتورة
      const invoiceId = `SI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newInvoice = {
        id: invoiceId,
        invoice_number: invoice.invoice_number || this.generateInvoiceNumber(),
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        date: invoice.date || new Date().toISOString(),
        due_date: invoice.due_date,
        items: invoice.items,
        subtotal: invoice.subtotal || this.calculateSubtotal(invoice.items),
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        total: invoice.total || (invoice.subtotal - invoice.discount + invoice.tax),
        paid_amount: invoice.paid_amount || 0,
        remaining_amount: invoice.remaining_amount || (invoice.total - (invoice.paid_amount || 0)),
        payment_method: invoice.payment_method || 'cash',
        status: invoice.status || (invoice.paid_amount >= invoice.total ? 'paid' : 'pending'),
        notes: invoice.notes || '',
        warehouse_id: invoice.warehouse_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // حفظ الفاتورة في قاعدة البيانات
      await this.db.add('salesInvoices', newInvoice);

      // تحديث المخزون (خصم الكميات المباعة)
      await this.updateInventoryForSale(invoice.items, invoice.warehouse_id);

      // إضافة قيد محاسبي تلقائي
      await this.journalService.createSalesInvoiceEntry(newInvoice);

      // إذا كان هناك دفعة نقدية، تحديث الخزينة
      if (newInvoice.paid_amount > 0) {
        await this.recordCashReceipt(newInvoice);
      }

      // تحديث حساب العميل
      await this.updateCustomerAccount(newInvoice.customer_id, newInvoice.total, newInvoice.paid_amount);

      return newInvoice;
    } catch (error) {
      console.error('خطأ في إضافة فاتورة المبيعات:', error);
      throw error;
    }
  }

  /**
   * تحديث فاتورة مبيعات موجودة
   */
  async updateSalesInvoice(invoiceId, updates) {
    try {
      const oldInvoice = await this.db.get('salesInvoices', invoiceId);
      if (!oldInvoice) {
        throw new Error('الفاتورة غير موجودة');
      }

      // عكس التأثيرات القديمة
      await this.reverseInventoryUpdate(oldInvoice.items, oldInvoice.warehouse_id);
      await this.journalService.reverseEntry(`SALES-${invoiceId}`);

      // تطبيق التحديثات الجديدة
      const updatedInvoice = {
        ...oldInvoice,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('salesInvoices', invoiceId, updatedInvoice);

      // تطبيق التأثيرات الجديدة
      await this.updateInventoryForSale(updatedInvoice.items, updatedInvoice.warehouse_id);
      await this.journalService.createSalesInvoiceEntry(updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      console.error('خطأ في تحديث فاتورة المبيعات:', error);
      throw error;
    }
  }

  /**
   * حذف فاتورة مبيعات
   */
  async deleteSalesInvoice(invoiceId) {
    try {
      const invoice = await this.db.get('salesInvoices', invoiceId);
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة');
      }

      // عكس التأثيرات على المخزون
      await this.reverseInventoryUpdate(invoice.items, invoice.warehouse_id);

      // عكس القيد المحاسبي
      await this.journalService.reverseEntry(`SALES-${invoiceId}`);

      // تحديث حساب العميل
      await this.updateCustomerAccount(invoice.customer_id, -invoice.total, -invoice.paid_amount);

      // حذف الفاتورة
      await this.db.delete('salesInvoices', invoiceId);

      return true;
    } catch (error) {
      console.error('خطأ في حذف فاتورة المبيعات:', error);
      throw error;
    }
  }

  /**
   * إضافة مرتجع مبيعات
   */
  async addSalesReturn(returnData) {
    try {
      const returnId = `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newReturn = {
        id: returnId,
        return_number: returnData.return_number || this.generateReturnNumber(),
        invoice_id: returnData.invoice_id,
        customer_id: returnData.customer_id,
        customer_name: returnData.customer_name,
        date: returnData.date || new Date().toISOString(),
        items: returnData.items,
        subtotal: returnData.subtotal || this.calculateSubtotal(returnData.items),
        tax: returnData.tax || 0,
        total: returnData.total || (returnData.subtotal + returnData.tax),
        refund_amount: returnData.refund_amount || returnData.total,
        refund_method: returnData.refund_method || 'cash',
        reason: returnData.reason || '',
        notes: returnData.notes || '',
        warehouse_id: returnData.warehouse_id,
        created_at: new Date().toISOString(),
      };

      // حفظ المرتجع
      await this.db.add('sales_returns', newReturn);

      // إرجاع المخزون
      await this.returnInventoryFromSale(returnData.items, returnData.warehouse_id);

      // قيد محاسبي للمرتجع
      await this.journalService.createSalesReturnEntry(newReturn);

      // إذا تم استرداد نقدي، تحديث الخزينة
      if (newReturn.refund_amount > 0 && newReturn.refund_method === 'cash') {
        await this.recordCashRefund(newReturn);
      }

      return newReturn;
    } catch (error) {
      console.error('خطأ في إضافة مرتجع المبيعات:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع فواتير المبيعات
   */
  async getAllSalesInvoices(filters = {}) {
    try {
      let invoices = await this.db.getAll('salesInvoices');

      // تطبيق الفلاتر
      if (filters.customer_id) {
        invoices = invoices.filter(inv => inv.customer_id === filters.customer_id);
      }
      if (filters.status) {
        invoices = invoices.filter(inv => inv.status === filters.status);
      }
      if (filters.from_date) {
        invoices = invoices.filter(inv => new Date(inv.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        invoices = invoices.filter(inv => new Date(inv.date) <= new Date(filters.to_date));
      }

      return invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على فواتير المبيعات:', error);
      throw error;
    }
  }

  /**
   * الحصول على فاتورة مبيعات بالمعرف
   */
  async getSalesInvoiceById(invoiceId) {
    try {
      return await this.db.get('salesInvoices', invoiceId);
    } catch (error) {
      console.error('خطأ في الحصول على فاتورة المبيعات:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الدفع
   */
  async updatePaymentStatus(invoiceId, paidAmount) {
    try {
      const invoice = await this.db.get('salesInvoices', invoiceId);
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة');
      }

      const totalPaid = invoice.paid_amount + paidAmount;
      const remaining = invoice.total - totalPaid;
      const status = remaining <= 0 ? 'paid' : remaining < invoice.total ? 'partial' : 'pending';

      const updatedInvoice = {
        ...invoice,
        paid_amount: totalPaid,
        remaining_amount: remaining,
        status: status,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('salesInvoices', invoiceId, updatedInvoice);

      // تسجيل الدفعة النقدية
      if (paidAmount > 0) {
        await this.recordCashReceipt({
          ...updatedInvoice,
          paid_amount: paidAmount
        });
      }

      return updatedInvoice;
    } catch (error) {
      console.error('خطأ في تحديث حالة الدفع:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * تحديث المخزون عند البيع (خصم الكميات)
   */
  async updateInventoryForSale(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) continue;

        // خصم الكمية من المخزون
        const newQuantity = (product.quantity || 0) - item.quantity;
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        // تسجيل حركة المخزون
        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'out',
          quantity: item.quantity,
          reason: 'sale',
          warehouse_id: warehouseId,
          reference_type: 'sales_invoice',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث المخزون:', error);
      throw error;
    }
  }

  /**
   * عكس تحديث المخزون (إرجاع الكميات)
   */
  async reverseInventoryUpdate(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) continue;

        const newQuantity = (product.quantity || 0) + item.quantity;
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'in',
          quantity: item.quantity,
          reason: 'sale_reversal',
          warehouse_id: warehouseId,
          reference_type: 'sales_invoice_reversal',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في عكس تحديث المخزون:', error);
      throw error;
    }
  }

  /**
   * إرجاع المخزون من المرتجعات
   */
  async returnInventoryFromSale(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) continue;

        const newQuantity = (product.quantity || 0) + item.quantity;
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'in',
          quantity: item.quantity,
          reason: 'sales_return',
          warehouse_id: warehouseId,
          reference_type: 'sales_return',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في إرجاع المخزون:', error);
      throw error;
    }
  }

  /**
   * تسجيل حركة المخزون
   */
  async recordInventoryMovement(movement) {
    try {
      const movementId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.db.add('inventory_movements', {
        id: movementId,
        ...movement,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('خطأ في تسجيل حركة المخزون:', error);
    }
  }

  /**
   * تسجيل إيصال نقدي
   */
  async recordCashReceipt(invoice) {
    try {
      const receiptId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const receipt = {
        id: receiptId,
        reference_type: 'sales_invoice',
        reference_id: invoice.id,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        amount: invoice.paid_amount,
        payment_method: invoice.payment_method,
        date: new Date().toISOString(),
        notes: `دفعة من فاتورة رقم ${invoice.invoice_number}`,
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_receipts', receipt);

      // قيد محاسبي للإيصال
      await this.journalService.createCashReceiptEntry(receipt);
    } catch (error) {
      console.error('خطأ في تسجيل الإيصال النقدي:', error);
    }
  }

  /**
   * تسجيل استرداد نقدي
   */
  async recordCashRefund(returnData) {
    try {
      const refundId = `CD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const refund = {
        id: refundId,
        reference_type: 'sales_return',
        reference_id: returnData.id,
        customer_id: returnData.customer_id,
        customer_name: returnData.customer_name,
        amount: returnData.refund_amount,
        payment_method: returnData.refund_method,
        date: new Date().toISOString(),
        notes: `استرداد من مرتجع رقم ${returnData.return_number}`,
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_disbursements', refund);
    } catch (error) {
      console.error('خطأ في تسجيل الاسترداد النقدي:', error);
    }
  }

  /**
   * تحديث حساب العميل
   */
  async updateCustomerAccount(customerId, totalAmount, paidAmount) {
    try {
      const customer = await this.db.get('customers', customerId);
      if (!customer) return;

      const balance = (customer.balance || 0) + totalAmount - paidAmount;

      await this.db.update('customers', customerId, {
        balance: balance,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('خطأ في تحديث حساب العميل:', error);
    }
  }

  /**
   * حساب الإجمالي الفرعي
   */
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * توليد رقم فاتورة تلقائي
   */
  generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * توليد رقم مرتجع تلقائي
   */
  generateReturnNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RET-${timestamp}-${random}`;
  }

  /**
   * إحصائيات المبيعات
   */
  async getSalesStatistics(period = 'month') {
    try {
      const invoices = await this.getAllSalesInvoices();
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

      const periodInvoices = invoices.filter(inv => new Date(inv.date) >= startDate);

      return {
        total_sales: periodInvoices.reduce((sum, inv) => sum + inv.total, 0),
        total_invoices: periodInvoices.length,
        paid_amount: periodInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0),
        remaining_amount: periodInvoices.reduce((sum, inv) => sum + inv.remaining_amount, 0),
        average_invoice: periodInvoices.length > 0 
          ? periodInvoices.reduce((sum, inv) => sum + inv.total, 0) / periodInvoices.length 
          : 0,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات المبيعات:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getSalesServiceInstance = () => {
  if (!instance) {
    instance = new SalesService();
  }
  return instance;
};

export default SalesService;
