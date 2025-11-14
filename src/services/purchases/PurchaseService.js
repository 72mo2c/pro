/**
 * PurchaseService.js
 * خدمة إدارة المشتريات - متكاملة مع المخزون، الخزينة، والمحاسبة
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class PurchaseService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة فاتورة مشتريات جديدة
   * يحدث: المخزون، الخزينة (إذا كان هناك دفعة نقدية)، القيود المحاسبية
   */
  async addPurchaseInvoice(invoice) {
    try {
      // التحقق من البيانات المطلوبة
      if (!invoice.supplier_id || !invoice.items || invoice.items.length === 0) {
        throw new Error('بيانات الفاتورة غير مكتملة');
      }

      // إنشاء معرف فريد للفاتورة
      const invoiceId = `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newInvoice = {
        id: invoiceId,
        invoice_number: invoice.invoice_number || this.generateInvoiceNumber(),
        supplier_id: invoice.supplier_id,
        supplier_name: invoice.supplier_name,
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
      await this.db.add('purchaseInvoices', newInvoice);

      // تحديث المخزون (إضافة الكميات المشتراة)
      await this.updateInventoryForPurchase(invoice.items, invoice.warehouse_id);

      // إضافة قيد محاسبي تلقائي
      await this.journalService.createPurchaseInvoiceEntry(newInvoice);

      // إذا كان هناك دفعة نقدية، تحديث الخزينة
      if (newInvoice.paid_amount > 0) {
        await this.recordCashDisbursement(newInvoice);
      }

      // تحديث حساب المورد
      await this.updateSupplierAccount(newInvoice.supplier_id, newInvoice.total, newInvoice.paid_amount);

      return newInvoice;
    } catch (error) {
      console.error('خطأ في إضافة فاتورة المشتريات:', error);
      throw error;
    }
  }

  /**
   * تحديث فاتورة مشتريات موجودة
   */
  async updatePurchaseInvoice(invoiceId, updates) {
    try {
      const oldInvoice = await this.db.get('purchaseInvoices', invoiceId);
      if (!oldInvoice) {
        throw new Error('الفاتورة غير موجودة');
      }

      // عكس التأثيرات القديمة
      await this.reverseInventoryUpdate(oldInvoice.items, oldInvoice.warehouse_id);
      await this.journalService.reverseEntry(`PURCHASE-${invoiceId}`);

      // تطبيق التحديثات الجديدة
      const updatedInvoice = {
        ...oldInvoice,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('purchaseInvoices', invoiceId, updatedInvoice);

      // تطبيق التأثيرات الجديدة
      await this.updateInventoryForPurchase(updatedInvoice.items, updatedInvoice.warehouse_id);
      await this.journalService.createPurchaseInvoiceEntry(updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      console.error('خطأ في تحديث فاتورة المشتريات:', error);
      throw error;
    }
  }

  /**
   * حذف فاتورة مشتريات
   */
  async deletePurchaseInvoice(invoiceId) {
    try {
      const invoice = await this.db.get('purchaseInvoices', invoiceId);
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة');
      }

      // عكس التأثيرات على المخزون
      await this.reverseInventoryUpdate(invoice.items, invoice.warehouse_id);

      // عكس القيد المحاسبي
      await this.journalService.reverseEntry(`PURCHASE-${invoiceId}`);

      // تحديث حساب المورد
      await this.updateSupplierAccount(invoice.supplier_id, -invoice.total, -invoice.paid_amount);

      // حذف الفاتورة
      await this.db.delete('purchaseInvoices', invoiceId);

      return true;
    } catch (error) {
      console.error('خطأ في حذف فاتورة المشتريات:', error);
      throw error;
    }
  }

  /**
   * إضافة مرتجع مشتريات
   */
  async addPurchaseReturn(returnData) {
    try {
      const returnId = `PR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newReturn = {
        id: returnId,
        return_number: returnData.return_number || this.generateReturnNumber(),
        invoice_id: returnData.invoice_id,
        supplier_id: returnData.supplier_id,
        supplier_name: returnData.supplier_name,
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
      await this.db.add('purchase_returns', newReturn);

      // خصم المخزون
      await this.removeInventoryFromPurchase(returnData.items, returnData.warehouse_id);

      // قيد محاسبي للمرتجع
      await this.journalService.createPurchaseReturnEntry(newReturn);

      // إذا تم استرداد نقدي، تحديث الخزينة
      if (newReturn.refund_amount > 0 && newReturn.refund_method === 'cash') {
        await this.recordCashReceipt(newReturn);
      }

      return newReturn;
    } catch (error) {
      console.error('خطأ في إضافة مرتجع المشتريات:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع فواتير المشتريات
   */
  async getAllPurchaseInvoices(filters = {}) {
    try {
      let invoices = await this.db.getAll('purchaseInvoices');

      // تطبيق الفلاتر
      if (filters.supplier_id) {
        invoices = invoices.filter(inv => inv.supplier_id === filters.supplier_id);
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
      console.error('خطأ في الحصول على فواتير المشتريات:', error);
      throw error;
    }
  }

  /**
   * الحصول على فاتورة مشتريات بالمعرف
   */
  async getPurchaseInvoiceById(invoiceId) {
    try {
      return await this.db.get('purchaseInvoices', invoiceId);
    } catch (error) {
      console.error('خطأ في الحصول على فاتورة المشتريات:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الدفع
   */
  async updatePaymentStatus(invoiceId, paidAmount) {
    try {
      const invoice = await this.db.get('purchaseInvoices', invoiceId);
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

      await this.db.update('purchaseInvoices', invoiceId, updatedInvoice);

      // تسجيل الدفعة النقدية
      if (paidAmount > 0) {
        await this.recordCashDisbursement({
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
   * تحديث المخزون عند الشراء (إضافة الكميات)
   */
  async updateInventoryForPurchase(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) {
          // إذا كان المنتج غير موجود، نتخطاه
          console.warn(`المنتج ${item.product_id} غير موجود`);
          continue;
        }

        // إضافة الكمية للمخزون
        const newQuantity = (product.quantity || 0) + item.quantity;
        
        // تحديث سعر الشراء الأخير
        const purchasePrice = item.price || product.purchase_price || 0;
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          purchase_price: purchasePrice,
          updated_at: new Date().toISOString(),
        });

        // تسجيل حركة المخزون
        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'in',
          quantity: item.quantity,
          reason: 'purchase',
          warehouse_id: warehouseId,
          reference_type: 'purchase_invoice',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث المخزون:', error);
      throw error;
    }
  }

  /**
   * عكس تحديث المخزون (خصم الكميات)
   */
  async reverseInventoryUpdate(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) continue;

        const newQuantity = Math.max(0, (product.quantity || 0) - item.quantity);
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'out',
          quantity: item.quantity,
          reason: 'purchase_reversal',
          warehouse_id: warehouseId,
          reference_type: 'purchase_invoice_reversal',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في عكس تحديث المخزون:', error);
      throw error;
    }
  }

  /**
   * خصم المخزون من المرتجعات
   */
  async removeInventoryFromPurchase(items, warehouseId) {
    try {
      for (const item of items) {
        const product = await this.db.get('products', item.product_id);
        if (!product) continue;

        const newQuantity = Math.max(0, (product.quantity || 0) - item.quantity);
        
        await this.db.update('products', item.product_id, {
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

        await this.recordInventoryMovement({
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'out',
          quantity: item.quantity,
          reason: 'purchase_return',
          warehouse_id: warehouseId,
          reference_type: 'purchase_return',
          date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('خطأ في خصم المخزون:', error);
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
   * تسجيل مصروف نقدي
   */
  async recordCashDisbursement(invoice) {
    try {
      const disbursementId = `CD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const disbursement = {
        id: disbursementId,
        reference_type: 'purchase_invoice',
        reference_id: invoice.id,
        supplier_id: invoice.supplier_id,
        supplier_name: invoice.supplier_name,
        amount: invoice.paid_amount,
        payment_method: invoice.payment_method,
        date: new Date().toISOString(),
        notes: `دفعة لفاتورة رقم ${invoice.invoice_number}`,
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_disbursements', disbursement);

      // قيد محاسبي للمصروف
      await this.journalService.createCashDisbursementEntry(disbursement);
    } catch (error) {
      console.error('خطأ في تسجيل المصروف النقدي:', error);
    }
  }

  /**
   * تسجيل إيصال نقدي (لمرتجع المشتريات)
   */
  async recordCashReceipt(returnData) {
    try {
      const receiptId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const receipt = {
        id: receiptId,
        reference_type: 'purchase_return',
        reference_id: returnData.id,
        supplier_id: returnData.supplier_id,
        supplier_name: returnData.supplier_name,
        amount: returnData.refund_amount,
        payment_method: returnData.refund_method,
        date: new Date().toISOString(),
        notes: `استرداد من مرتجع رقم ${returnData.return_number}`,
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_receipts', receipt);
    } catch (error) {
      console.error('خطأ في تسجيل الإيصال النقدي:', error);
    }
  }

  /**
   * تحديث حساب المورد
   */
  async updateSupplierAccount(supplierId, totalAmount, paidAmount) {
    try {
      const supplier = await this.db.get('suppliers', supplierId);
      if (!supplier) return;

      const balance = (supplier.balance || 0) + totalAmount - paidAmount;

      await this.db.update('suppliers', supplierId, {
        balance: balance,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('خطأ في تحديث حساب المورد:', error);
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
    return `PINV-${timestamp}-${random}`;
  }

  /**
   * توليد رقم مرتجع تلقائي
   */
  generateReturnNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PRET-${timestamp}-${random}`;
  }

  /**
   * إحصائيات المشتريات
   */
  async getPurchaseStatistics(period = 'month') {
    try {
      const invoices = await this.getAllPurchaseInvoices();
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
        total_purchases: periodInvoices.reduce((sum, inv) => sum + inv.total, 0),
        total_invoices: periodInvoices.length,
        paid_amount: periodInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0),
        remaining_amount: periodInvoices.reduce((sum, inv) => sum + inv.remaining_amount, 0),
        average_invoice: periodInvoices.length > 0 
          ? periodInvoices.reduce((sum, inv) => sum + inv.total, 0) / periodInvoices.length 
          : 0,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات المشتريات:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getPurchaseServiceInstance = () => {
  if (!instance) {
    instance = new PurchaseService();
  }
  return instance;
};

export default PurchaseService;
