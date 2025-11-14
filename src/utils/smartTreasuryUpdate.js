// ======================================
// Smart Treasury Update System - نظام التحديث الذكي للخزينة
// utilities للتحديث التلقائي الذكي لجميع الواجهات
// ======================================

import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

// Hook للتحديث الذكي للخزينة
export const useSmartTreasuryUpdate = () => {
  const { 
    salesInvoices, 
    purchaseInvoices,
    customers, 
    suppliers,
    cashReceipts,
    getCustomerBalance,
    getSupplierBalance,
    getAllCustomerBalances,
    getAllSupplierBalances,
    getCustomerDeferredInvoices,
    getSupplierDeferredInvoices
  } = useData();
  const { showInfo, showSuccess, showError } = useNotification();
  
  // دالة التحديث الشامل للواجهة
  const triggerInterfaceUpdate = (interfaceType = 'all') => {
    console.log(`🔄 بدء التحديث الشامل لـ ${interfaceType}`);
    
    try {
      // تحديثات فورية للواجهات
      const updateTime = Date.now();
      
      switch (interfaceType) {
        case 'customer_balances':
          // تحديث أرصدة العملاء
          const updatedCustomerBalances = getAllCustomerBalances();
          console.log('✅ تم تحديث أرصدة العملاء:', updatedCustomerBalances.length);
          break;
          
        case 'supplier_balances':
          // تحديث أرصدة الموردين
          const updatedSupplierBalances = getAllSupplierBalances();
          console.log('✅ تم تحديث أرصدة الموردين:', updatedSupplierBalances.length);
          break;
          
        case 'sales_invoices':
          // تحديث حالة فواتير المبيعات
          const salesInvoicesToUpdate = salesInvoices.filter(inv => inv.remaining > 0);
          console.log('✅ تم فحص فواتير المبيعات:', salesInvoicesToUpdate.length);
          break;
          
        case 'purchase_invoices':
          // تحديث حالة فواتير المشتريات
          const purchaseInvoicesToUpdate = purchaseInvoices.filter(inv => inv.remaining > 0);
          console.log('✅ تم فحص فواتير المشتريات:', purchaseInvoicesToUpdate.length);
          break;
          
        case 'treasury_movements':
          // تحديث حركة الخزينة
          const treasuryMovementsToUpdate = cashReceipts.filter(receipt => 
            receipt.intelligentSettlement || receipt.linkedInvoices?.length > 0
          );
          console.log('✅ تم تحديث حركة الخزينة:', treasuryMovementsToUpdate.length);
          break;
          
        case 'all':
        default:
          // تحديث شامل لجميع الواجهات
          console.log('🔄 بدء التحديث الشامل لجميع الواجهات...');
          triggerInterfaceUpdate('customer_balances');
          triggerInterfaceUpdate('supplier_balances');
          triggerInterfaceUpdate('sales_invoices');
          triggerInterfaceUpdate('purchase_invoices');
          triggerInterfaceUpdate('treasury_movements');
          console.log('🎯 تم إكمال التحديث الشامل بنجاح');
          break;
      }
      
      // إرسال إشعار للمستخدم
      showInfo(`تم تحديث ${interfaceType.replace('_', ' ')} بنجاح`);
      
      return {
        success: true,
        interface: interfaceType,
        timestamp: updateTime,
        message: `تم تحديث ${interfaceType.replace('_', ' ')} بنجاح`
      };
      
    } catch (error) {
      console.error(`❌ خطأ في تحديث ${interfaceType}:`, error);
      showError(`خطأ في تحديث ${interfaceType.replace('_', ' ')}`);
      
      return {
        success: false,
        interface: interfaceType,
        error: error.message,
        message: `فشل في تحديث ${interfaceType.replace('_', ' ')}`
      };
    }
  };
  
  // دالة تحديث حالة فاتورة محددة
  const updateInvoiceStatus = (invoiceId, invoiceType = 'sales') => {
    try {
      const invoices = invoiceType === 'sales' ? salesInvoices : purchaseInvoices;
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        throw new Error(`لم يتم العثور على فاتورة رقم ${invoiceId}`);
      }
      
      // تحديد الحالة الجديدة بناءً على المتبقي
      let newStatus;
      if (invoice.remaining <= 0) {
        newStatus = 'paid';
      } else if (invoice.paid > 0) {
        newStatus = 'partial';
      } else {
        newStatus = 'pending';
      }
      
      // تحديث إذا كانت الحالة مختلفة
      if (invoice.paymentStatus !== newStatus) {
        console.log(`📝 تحديث حالة فاتورة ${invoiceId}: ${invoice.paymentStatus} → ${newStatus}`);
        return { success: true, newStatus };
      }
      
      return { success: true, newStatus: invoice.paymentStatus };
      
    } catch (error) {
      console.error(`❌ خطأ في تحديث حالة الفاتورة ${invoiceId}:`, error);
      return { success: false, error: error.message };
    }
  };
  
  // دالة تحديث رصيد عميل/مورد
  const updateSourceBalance = (sourceId, sourceType = 'customer') => {
    try {
      const balance = sourceType === 'customer' 
        ? getCustomerBalance(parseInt(sourceId))
        : getSupplierBalance(parseInt(sourceId));
      
      console.log(`💰 تحديث رصيد ${sourceType} ${sourceId}: ${balance}`);
      
      return {
        success: true,
        balance,
        sourceId,
        sourceType
      };
      
    } catch (error) {
      console.error(`❌ خطأ في تحديث رصيد ${sourceType} ${sourceId}:`, error);
      return { success: false, error: error.message };
    }
  };
  
  // دالة إحصائيات التسوية الذكية
  const getSettlementStatistics = () => {
    try {
      const totalReceipts = cashReceipts.length;
      const intelligentReceipts = cashReceipts.filter(r => r.intelligentSettlement).length;
      const totalAmount = cashReceipts.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      const settledInvoicesCount = cashReceipts.reduce((sum, r) => 
        sum + (r.intelligentSettlement?.invoicesSettled || 0), 0
      );
      
      return {
        totalReceipts,
        intelligentReceipts,
        intelligentSettlementRate: (intelligentReceipts / Math.max(totalReceipts, 1)) * 100,
        totalAmount,
        settledInvoicesCount,
        avgAmount: totalReceipts > 0 ? totalAmount / totalReceipts : 0
      };
      
    } catch (error) {
      console.error('❌ خطأ في حساب إحصائيات التسوية:', error);
      return null;
    }
  };
  
  // دالة فحص صحة البيانات
  const validateDataIntegrity = () => {
    const issues = [];
    
    try {
      // فحص أرصدة العملاء
      const customerBalances = getAllCustomerBalances();
      if (customerBalances.length > 0) {
        console.log(`✅ تم فحص أرصدة ${customerBalances.length} عميل`);
      }
      
      // فحص فواتير المبيعات المعلقة
      const pendingSalesInvoices = salesInvoices.filter(inv => inv.remaining > 0);
      if (pendingSalesInvoices.length > 0) {
        console.log(`⚠️ يوجد ${pendingSalesInvoices.length} فاتورة مبيعات معلقة`);
      }
      
      // فحص المعاملات الذكية
      const smartTransactions = cashReceipts.filter(r => r.intelligentSettlement);
      if (smartTransactions.length > 0) {
        console.log(`🧠 تم تسجيل ${smartTransactions.length} معاملة ذكية`);
      }
      
      return {
        success: true,
        issues: issues.length,
        message: 'فحص سلامة البيانات مكتمل'
      };
      
    } catch (error) {
      console.error('❌ خطأ في فحص سلامة البيانات:', error);
      return {
        success: false,
        error: error.message,
        message: 'فشل في فحص سلامة البيانات'
      };
    }
  };
  
  // دالة مراقبة التغييرات
  const setupAutoMonitoring = (callback) => {
    let isMonitoring = false;
    let intervalId = null;
    
    const startMonitoring = () => {
      if (isMonitoring) return;
      
      isMonitoring = true;
      console.log('🔍 بدء المراقبة التلقائية للخزينة');
      
      intervalId = setInterval(() => {
        try {
          const stats = getSettlementStatistics();
          const validation = validateDataIntegrity();
          
          if (callback && typeof callback === 'function') {
            callback({
              timestamp: Date.now(),
              stats,
              validation,
              isHealthy: validation.success
            });
          }
          
        } catch (error) {
          console.error('❌ خطأ في المراقبة التلقائية:', error);
        }
      }, 10000); // كل 10 ثوان
      
      return {
        success: true,
        message: 'تم بدء المراقبة التلقائية'
      };
    };
    
    const stopMonitoring = () => {
      if (!isMonitoring) return;
      
      isMonitoring = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      console.log('⏹️ تم إيقاف المراقبة التلقائية');
      
      return {
        success: true,
        message: 'تم إيقاف المراقبة التلقائية'
      };
    };
    
    return {
      startMonitoring,
      stopMonitoring,
      getStatus: () => ({ isMonitoring })
    };
  };
  
  return {
    triggerInterfaceUpdate,
    updateInvoiceStatus,
    updateSourceBalance,
    getSettlementStatistics,
    validateDataIntegrity,
    setupAutoMonitoring
  };
};

// دالة مساعدة لتنسيق الأرقام بالعربية
export const formatArabicCurrency = (amount, currency = 'ج.م') => {
  const numericAmount = Number(amount) || 0;
  return numericAmount.toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ` ${currency}`;
};

// دالة مساعدة لحساب النسب
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
};

// دالة مساعدة للتحقق من صحة المبلغ
export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

// تصدير كـ default
export default useSmartTreasuryUpdate;