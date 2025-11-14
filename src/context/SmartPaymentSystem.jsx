// ======================================
// Smart Payment System - النظام الذكي للمدفوعات
// ======================================

import { useData } from './DataContext';

// دوال النظام الذكي للمدفوعات
export const useSmartPaymentSystem = () => {
  const {
    customers,
    suppliers,
    salesInvoices,
    purchaseInvoices,
    cashReceipts,
    cashDisbursements,
    getCustomerBalance,
    getSupplierBalance,
    setCustomers,
    setSuppliers,
    setSalesInvoices,
    setPurchaseInvoices,
    setCashReceipts,
    setCashDisbursements,
    setTreasuryBalance,
    saveData
  } = useData();

  // ==================== إدارة الأرصدة المسبقة ====================

  /**
   * الحصول على الأرصدة المسبقة للعميل
   * @param {number} customerId - معرف العميل
   * @returns {number} - الرصيد المسبق (موجب = دفع مسبق، سالب = دين مسبق)
   */
  const getCustomerAdvanceBalance = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.advanceBalance || 0;
  };

  /**
   * الحصول على الأرصدة المسبقة للمورد
   * @param {number} supplierId - معرف المورد
   * @returns {number} - الرصيد المسبق (موجب = دفع مسبق، سالب = دين مسبق)
   */
  const getSupplierAdvanceBalance = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.advanceBalance || 0;
  };

  /**
   * تحديث الأرصدة المسبقة للعميل
   * @param {number} customerId - معرف العميل
   * @param {number} amount - المبلغ (موجب = إضافة دفع مسبق، سالب = خصم من الدفع المسبق)
   * @param {string} reason - سبب التحديث
   */
  const updateCustomerAdvanceBalance = (customerId, amount, reason = '') => {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('العميل غير موجود');
    }

    const currentAdvance = customers[customerIndex].advanceBalance || 0;
    const newAdvance = currentAdvance + amount;

    if (newAdvance < -100000) { // حد أدنى للرصيد المسبق (يمكن تعديله)
      throw new Error(`لا يمكن أن يكون الرصيد المسبق أقل من -100,000 ج.م`);
    }

    const updatedCustomers = [...customers];
    updatedCustomers[customerIndex] = {
      ...updatedCustomers[customerIndex],
      advanceBalance: newAdvance,
      advanceBalanceHistory: [
        ...(updatedCustomers[customerIndex].advanceBalanceHistory || []),
        {
          id: Date.now(),
          amount: amount,
          reason: reason,
          previousBalance: currentAdvance,
          newBalance: newAdvance,
          date: new Date().toISOString()
        }
      ]
    };

    setCustomers(updatedCustomers);
    saveData('bero_customers', updatedCustomers);

    console.log(`✅ تم تحديث الرصيد المسبق للعميل ${customerId}:`, {
      amount: amount,
      reason: reason,
      previousBalance: currentAdvance,
      newBalance: newAdvance
    });
  };

  /**
   * تحديث الأرصدة المسبقة للمورد
   * @param {number} supplierId - معرف المورد
   * @param {number} amount - المبلغ (موجب = إضافة دفع مسبق، سالب = خصم من الدفع المسبق)
   * @param {string} reason - سبب التحديث
   */
  const updateSupplierAdvanceBalance = (supplierId, amount, reason = '') => {
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    if (supplierIndex === -1) {
      throw new Error('المورد غير موجود');
    }

    const currentAdvance = suppliers[supplierIndex].advanceBalance || 0;
    const newAdvance = currentAdvance + amount;

    if (newAdvance < -100000) { // حد أدنى للرصيد المسبق
      throw new Error(`لا يمكن أن يكون الرصيد المسبق أقل من -100,000 ج.م`);
    }

    const updatedSuppliers = [...suppliers];
    updatedSuppliers[supplierIndex] = {
      ...updatedSuppliers[supplierIndex],
      advanceBalance: newAdvance,
      advanceBalanceHistory: [
        ...(updatedSuppliers[supplierIndex].advanceBalanceHistory || []),
        {
          id: Date.now(),
          amount: amount,
          reason: reason,
          previousBalance: currentAdvance,
          newBalance: newAdvance,
          date: new Date().toISOString()
        }
      ]
    };

    setSuppliers(updatedSuppliers);
    saveData('bero_suppliers', updatedSuppliers);

    console.log(`✅ تم تحديث الرصيد المسبق للمورد ${supplierId}:`, {
      amount: amount,
      reason: reason,
      previousBalance: currentAdvance,
      newBalance: newAdvance
    });
  };

  // ==================== النظام الذكي للتسوية ====================

  /**
   * الحصول على الفواتير الآجلة للعميل مرتبة حسب الأولوية
   * @param {number} customerId - معرف العميل
   * @returns {Array} - قائمة الفواتير مرتبة (الأقدم أولاً)
   */
  const getCustomerPendingInvoices = (customerId) => {
    return salesInvoices
      .filter(invoice => 
        invoice.customerId === customerId && 
        invoice.paymentType !== 'cash' &&
        (invoice.remaining || 0) > 0
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // الأقدم أولاً
      .map(invoice => ({
        ...invoice,
        remainingAmount: invoice.remaining || 0
      }));
  };

  /**
   * الحصول على الفواتير الآجلة للمورد مرتبة حسب الأولوية
   * @param {number} supplierId - معرف المورد
   * @returns {Array} - قائمة الفواتير مرتبة (الأقدم أولاً)
   */
  const getSupplierPendingInvoices = (supplierId) => {
    return purchaseInvoices
      .filter(invoice => 
        invoice.supplierId === supplierId && 
        invoice.paymentType !== 'cash' &&
        (invoice.remaining || 0) > 0
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // الأقدم أولاً
      .map(invoice => ({
        ...invoice,
        remainingAmount: invoice.remaining || 0
      }));
  };

  /**
   * النظام الذكي لتسوية دين العميل
   * @param {number} customerId - معرف العميل
   * @param {number} amount - المبلغ المراد تسويته
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Object} - نتيجة التسوية
   */
  const settleCustomerDebtIntelligently = (customerId, amount, paymentData = {}) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('العميل غير موجود');
    }

    const currentDebt = getCustomerBalance(customerId);
    const currentAdvance = getCustomerAdvanceBalance(customerId);
    const paymentAmount = parseFloat(amount);

    if (paymentAmount <= 0) {
      throw new Error('مبلغ الدفع يجب أن يكون أكبر من صفر');
    }

    let remainingPayment = paymentAmount;
    const settledInvoices = [];
    const settlementDetails = [];

    // 1. استخدام الرصيد المسبق أولاً (إن وجد)
    if (currentAdvance > 0) {
      const advanceToUse = Math.min(remainingPayment, currentAdvance);
      if (advanceToUse > 0) {
        updateCustomerAdvanceBalance(customerId, -advanceToUse, `استخدام رصيد مسبق في التسوية - إيصال ${paymentData.receiptNumber || ''}`);
        remainingPayment -= advanceToUse;
        settlementDetails.push({
          type: 'advance_used',
          amount: advanceToUse,
          description: `تم استخدام الرصيد المسبق بقيمة ${advanceToUse.toFixed(2)} ج.م`
        });
        console.log(`✅ تم استخدام رصيد مسبق: ${advanceToUse} ج.م`);
      }
    }

    // 2. تسوية الفواتير الآجلة (إذا تبقى مبلغ للدفع)
    if (remainingPayment > 0 && currentDebt > 0) {
      const pendingInvoices = getCustomerPendingInvoices(customerId);
      
      for (const invoice of pendingInvoices) {
        if (remainingPayment <= 0) break;

        const invoiceDebt = invoice.remainingAmount;
        const paymentForInvoice = Math.min(remainingPayment, invoiceDebt);
        
        if (paymentForInvoice > 0) {
          // سداد الفاتورة
          settledInvoices.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.id,
            originalAmount: invoice.total,
            debtAmount: invoiceDebt,
            paymentAmount: paymentForInvoice,
            fullyPaid: paymentForInvoice >= invoiceDebt,
            settlementDate: new Date().toISOString()
          });

          // تحديث حالة الفاتورة
          const updatedInvoices = salesInvoices.map(inv => {
            if (inv.id === invoice.id) {
              const newPaid = (inv.paid || 0) + paymentForInvoice;
              const newRemaining = Math.max(0, (inv.remaining || 0) - paymentForInvoice);
              const newStatus = newRemaining <= 0 ? 'paid' : 'partial';
              
              return {
                ...inv,
                paid: newPaid,
                remaining: newRemaining,
                paymentStatus: newStatus,
                lastPaymentDate: new Date().toISOString(),
                paymentHistory: [
                  ...(inv.paymentHistory || []),
                  {
                    date: new Date().toISOString(),
                    amount: paymentForInvoice,
                    paymentMethod: paymentData.paymentMethod || 'cash',
                    receiptNumber: paymentData.receiptNumber || '',
                    settlementType: 'intelligent'
                  }
                ]
              };
            }
            return inv;
          });

          setSalesInvoices(updatedInvoices);
          saveData('bero_sales_invoices', updatedInvoices);

          remainingPayment -= paymentForInvoice;
          
          settlementDetails.push({
            type: 'invoice_settlement',
            invoiceId: invoice.id,
            invoiceNumber: invoice.id,
            amount: paymentForInvoice,
            fullyPaid: paymentForInvoice >= invoiceDebt,
            description: `سداد فاتورة #${invoice.id} بمبلغ ${paymentForInvoice.toFixed(2)} ج.م`
          });

          console.log(`✅ تم سداد فاتورة #${invoice.id} بمبلغ: ${paymentForInvoice} ج.م`);
        }
      }
    }

    // 3. إضافة أي مبلغ زائد للرصيد المسبق
    let treasuryIncrease = 0;
    if (remainingPayment > 0) {
      // إذا لم يكن هناك دين، كل المبلغ يضاف للخزينة
      if (currentDebt <= 0) {
        treasuryIncrease = remainingPayment;
        settlementDetails.push({
          type: 'direct_treasury',
          amount: remainingPayment,
          description: `إيداع مباشر في الخزينة ${remainingPayment.toFixed(2)} ج.م`
        });
      } else {
        // إذا كان هناك دين لكن تم سداده، المبلغ الزائد يضاف للرصيد المسبق
        updateCustomerAdvanceBalance(customerId, remainingPayment, `رصيد مسبق من التسوية - إيصال ${paymentData.receiptNumber || ''}`);
        settlementDetails.push({
          type: 'advance_credit',
          amount: remainingPayment,
          description: `إضافة رصيد مسبق للعميل بقيمة ${remainingPayment.toFixed(2)} ج.م`
        });
      }
      remainingPayment = 0;
    }

    const finalResult = {
      success: true,
      customerId: customerId,
      customerName: customer.name,
      originalPayment: paymentAmount,
      advanceUsed: paymentAmount - remainingPayment,
      treasuryIncrease: treasuryIncrease,
      advanceCredit: currentDebt > 0 ? 0 : (treasuryIncrease === 0 ? paymentAmount - (paymentAmount - remainingPayment) : 0),
      settledInvoices: settledInvoices,
      settlementDetails: settlementDetails,
      remainingAdvanceBalance: getCustomerAdvanceBalance(customerId),
      remainingDebtBalance: Math.max(0, currentDebt - (paymentAmount - remainingPayment)),
      timestamp: new Date().toISOString()
    };

    console.log('🎯 نتيجة التسوية الذكية للعميل:', finalResult);
    return finalResult;
  };

  /**
   * النظام الذكي لتسوية دين المورد
   * @param {number} supplierId - معرف المورد
   * @param {number} amount - المبلغ المراد تسويته
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Object} - نتيجة التسوية
   */
  const settleSupplierDebtIntelligently = (supplierId, amount, paymentData = {}) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      throw new Error('المورد غير موجود');
    }

    const currentDebt = getSupplierBalance(supplierId);
    const currentAdvance = getSupplierAdvanceBalance(supplierId);
    const paymentAmount = parseFloat(amount);

    if (paymentAmount <= 0) {
      throw new Error('مبلغ الدفع يجب أن يكون أكبر من صفر');
    }

    let remainingPayment = paymentAmount;
    const settledInvoices = [];
    const settlementDetails = [];

    // 1. استخدام الرصيد المسبق أولاً (إن وجد)
    if (currentAdvance > 0) {
      const advanceToUse = Math.min(remainingPayment, currentAdvance);
      if (advanceToUse > 0) {
        updateSupplierAdvanceBalance(supplierId, -advanceToUse, `استخدام رصيد مسبق في التسوية - إيصال ${paymentData.receiptNumber || ''}`);
        remainingPayment -= advanceToUse;
        settlementDetails.push({
          type: 'advance_used',
          amount: advanceToUse,
          description: `تم استخدام الرصيد المسبق بقيمة ${advanceToUse.toFixed(2)} ج.م`
        });
        console.log(`✅ تم استخدام رصيد مسبق: ${advanceToUse} ج.م`);
      }
    }

    // 2. تسوية الفواتير الآجلة (إذا تبقى مبلغ للدفع)
    if (remainingPayment > 0 && currentDebt > 0) {
      const pendingInvoices = getSupplierPendingInvoices(supplierId);
      
      for (const invoice of pendingInvoices) {
        if (remainingPayment <= 0) break;

        const invoiceDebt = invoice.remainingAmount;
        const paymentForInvoice = Math.min(remainingPayment, invoiceDebt);
        
        if (paymentForInvoice > 0) {
          settledInvoices.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.id,
            originalAmount: invoice.total,
            debtAmount: invoiceDebt,
            paymentAmount: paymentForInvoice,
            fullyPaid: paymentForInvoice >= invoiceDebt,
            settlementDate: new Date().toISOString()
          });

          // تحديث حالة الفاتورة
          const updatedInvoices = purchaseInvoices.map(inv => {
            if (inv.id === invoice.id) {
              const newPaid = (inv.paid || 0) + paymentForInvoice;
              const newRemaining = Math.max(0, (inv.remaining || 0) - paymentForInvoice);
              const newStatus = newRemaining <= 0 ? 'paid' : 'partial';
              
              return {
                ...inv,
                paid: newPaid,
                remaining: newRemaining,
                paymentStatus: newStatus,
                lastPaymentDate: new Date().toISOString(),
                paymentHistory: [
                  ...(inv.paymentHistory || []),
                  {
                    date: new Date().toISOString(),
                    amount: paymentForInvoice,
                    paymentMethod: paymentData.paymentMethod || 'cash',
                    receiptNumber: paymentData.receiptNumber || '',
                    settlementType: 'intelligent'
                  }
                ]
              };
            }
            return inv;
          });

          setPurchaseInvoices(updatedInvoices);
          saveData('bero_purchase_invoices', updatedInvoices);

          remainingPayment -= paymentForInvoice;
          
          settlementDetails.push({
            type: 'invoice_settlement',
            invoiceId: invoice.id,
            invoiceNumber: invoice.id,
            amount: paymentForInvoice,
            fullyPaid: paymentForInvoice >= invoiceDebt,
            description: `سداد فاتورة #${invoice.id} بمبلغ ${paymentForInvoice.toFixed(2)} ج.م`
          });

          console.log(`✅ تم سداد فاتورة #${invoice.id} بمبلغ: ${paymentForInvoice} ج.م`);
        }
      }
    }

    // 3. إضافة أي مبلغ زائد للرصيد المسبق
    let treasuryIncrease = 0;
    if (remainingPayment > 0) {
      if (currentDebt <= 0) {
        treasuryIncrease = remainingPayment;
        settlementDetails.push({
          type: 'direct_treasury',
          amount: remainingPayment,
          description: `إيداع مباشر في الخزينة ${remainingPayment.toFixed(2)} ج.م`
        });
      } else {
        updateSupplierAdvanceBalance(supplierId, remainingPayment, `رصيد مسبق من التسوية - إيصال ${paymentData.receiptNumber || ''}`);
        settlementDetails.push({
          type: 'advance_credit',
          amount: remainingPayment,
          description: `إضافة رصيد مسبق للمورد بقيمة ${remainingPayment.toFixed(2)} ج.م`
        });
      }
      remainingPayment = 0;
    }

    const finalResult = {
      success: true,
      supplierId: supplierId,
      supplierName: supplier.name,
      originalPayment: paymentAmount,
      advanceUsed: paymentAmount - remainingPayment,
      treasuryIncrease: treasuryIncrease,
      settledInvoices: settledInvoices,
      settlementDetails: settlementDetails,
      remainingAdvanceBalance: getSupplierAdvanceBalance(supplierId),
      remainingDebtBalance: Math.max(0, currentDebt - (paymentAmount - remainingPayment)),
      timestamp: new Date().toISOString()
    };

    console.log('🎯 نتيجة التسوية الذكية للمورد:', finalResult);
    return finalResult;
  };

  // ==================== الدوال المساعدة ====================

  /**
   * حساب الرصيد الشامل للعميل (دين + رصيد مسبق)
   * @param {number} customerId - معرف العميل
   * @returns {Object} - تفاصيل الرصيد الشامل
   */
  const getCustomerComprehensiveBalance = (customerId) => {
    const debtBalance = getCustomerBalance(customerId);
    const advanceBalance = getCustomerAdvanceBalance(customerId);
    
    return {
      customerId: customerId,
      debtBalance: debtBalance, // موجب = دين على العميل، سالب = رصيد مدين للعميل
      advanceBalance: advanceBalance, // موجب = دفع مسبق للعميل، سالب = دين مسبق
      netBalance: debtBalance - advanceBalance, // صافي الرصيد (موجب = دين على العميل)
      canUseAdvance: advanceBalance > 0,
      totalDebt: Math.max(0, debtBalance),
      totalAdvance: Math.max(0, advanceBalance)
    };
  };

  /**
   * حساب الرصيد الشامل للمورد (دين + رصيد مسبق)
   * @param {number} supplierId - معرف المورد
   * @returns {Object} - تفاصيل الرصيد الشامل
   */
  const getSupplierComprehensiveBalance = (supplierId) => {
    const debtBalance = getSupplierBalance(supplierId);
    const advanceBalance = getSupplierAdvanceBalance(supplierId);
    
    return {
      supplierId: supplierId,
      debtBalance: debtBalance, // موجب = دين على الشركة، سالب = رصيد مدين للشركة
      advanceBalance: advanceBalance, // موجب = دفع مسبق للمورد، سالب = دين مسبق
      netBalance: debtBalance - advanceBalance, // صافي الرصيد (موجب = دين على الشركة)
      canUseAdvance: advanceBalance > 0,
      totalDebt: Math.max(0, debtBalance),
      totalAdvance: Math.max(0, advanceBalance)
    };
  };

  return {
    // إدارة الأرصدة المسبقة
    getCustomerAdvanceBalance,
    getSupplierAdvanceBalance,
    updateCustomerAdvanceBalance,
    updateSupplierAdvanceBalance,
    
    // النظام الذكي للتسوية
    settleCustomerDebtIntelligently,
    settleSupplierDebtIntelligently,
    getCustomerPendingInvoices,
    getSupplierPendingInvoices,
    
    // الدوال المساعدة
    getCustomerComprehensiveBalance,
    getSupplierComprehensiveBalance
  };
};

export default useSmartPaymentSystem;