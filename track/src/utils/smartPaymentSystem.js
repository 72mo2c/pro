// ======================================
// نظام الدفع الذكي - Smart Payment System
// إدارة تلقائية للفواتير والديون والخزينة
// ======================================

/**
 * حساب رصيد عميل شامل مع تفاصيل الفواتير
 */
export const calculateCustomerBalanceWithDetails = (customerId, salesInvoices, salesReturns, cashReceipts) => {
  let balance = 0;
  const invoiceDetails = [];
  
  // تجميع جميع فواتير العميل
  const customerInvoices = salesInvoices
    .filter(invoice => invoice.customerId === customerId)
    .map(invoice => ({
      ...invoice,
      remainingAmount: 0,
      paidAmount: 0,
      status: 'unpaid',
      payments: []
    }));
  
  // إضافة المرتجعات
  const customerReturns = salesReturns.filter(returnRecord => {
    const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
    return invoice && invoice.customerId === customerId;
  });
  
  // تجميع المدفوعات
  const customerReceipts = cashReceipts.filter(receipt => 
    receipt.fromType === 'customer' && receipt.fromId === customerId
  );
  
  // حساب المرتجعات لكل فاتورة
  const returnsByInvoice = {};
  customerReturns.forEach(returnRecord => {
    if (!returnsByInvoice[returnRecord.invoiceId]) {
      returnsByInvoice[returnRecord.invoiceId] = 0;
    }
    returnsByInvoice[returnRecord.invoiceId] += parseFloat(returnRecord.totalAmount || 0);
  });
  
  // حساب المدفوعات لكل فاتورة
  const paymentsByInvoice = {};
  customerReceipts.forEach(receipt => {
    if (receipt.invoiceId) {
      if (!paymentsByInvoice[receipt.invoiceId]) {
        paymentsByInvoice[receipt.invoiceId] = 0;
      }
      paymentsByInvoice[receipt.invoiceId] += parseFloat(receipt.amount || 0);
    }
  });
  
  // حساب الرصيد لكل فاتورة
  customerInvoices.forEach(invoice => {
    const originalAmount = parseFloat(invoice.total || 0);
    const returnAmount = returnsByInvoice[invoice.id] || 0;
    const paidAmount = paymentsByInvoice[invoice.id] || 0;
    const netAmount = originalAmount - returnAmount;
    
    const invoiceDetail = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      originalAmount,
      returnAmount,
      paidAmount,
      remainingAmount: Math.max(0, netAmount - paidAmount),
      status: netAmount - paidAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partially_paid' : 'unpaid'),
      date: invoice.date,
      invoice: invoice
    };
    
    invoiceDetails.push(invoiceDetail);
    balance += invoiceDetail.remainingAmount;
  });
  
  // ترتيب الفواتير حسب التاريخ (الأقدم أولاً)
  invoiceDetails.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    customerId,
    totalBalance: balance,
    invoiceDetails,
    totalInvoices: invoiceDetails.length,
    paidInvoices: invoiceDetails.filter(i => i.status === 'paid').length,
    partiallyPaidInvoices: invoiceDetails.filter(i => i.status === 'partially_paid').length,
    unpaidInvoices: invoiceDetails.filter(i => i.status === 'unpaid').length
  };
};

/**
 * حساب رصيد مورد شامل مع تفاصيل الفواتير
 */
export const calculateSupplierBalanceWithDetails = (supplierId, purchaseInvoices, purchaseReturns, cashDisbursements) => {
  let balance = 0;
  const invoiceDetails = [];
  
  // تجميع جميع فواتير المورد
  const supplierInvoices = purchaseInvoices
    .filter(invoice => invoice.supplierId === supplierId)
    .map(invoice => ({
      ...invoice,
      remainingAmount: 0,
      paidAmount: 0,
      status: 'unpaid',
      payments: []
    }));
  
  // إضافة المرتجعات
  const supplierReturns = purchaseReturns.filter(returnRecord => {
    const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
    return invoice && invoice.supplierId === supplierId;
  });
  
  // تجميع المدفوعات
  const supplierPayments = cashDisbursements.filter(payment => 
    payment.toType === 'supplier' && payment.toId === supplierId
  );
  
  // حساب المرتجعات لكل فاتورة
  const returnsByInvoice = {};
  supplierReturns.forEach(returnRecord => {
    if (!returnsByInvoice[returnRecord.invoiceId]) {
      returnsByInvoice[returnRecord.invoiceId] = 0;
    }
    returnsByInvoice[returnRecord.invoiceId] += parseFloat(returnRecord.totalAmount || 0);
  });
  
  // حساب المدفوعات لكل فاتورة
  const paymentsByInvoice = {};
  supplierPayments.forEach(payment => {
    if (payment.invoiceId) {
      if (!paymentsByInvoice[payment.invoiceId]) {
        paymentsByInvoice[payment.invoiceId] = 0;
      }
      paymentsByInvoice[payment.invoiceId] += parseFloat(payment.amount || 0);
    }
  });
  
  // حساب الرصيد لكل فاتورة
  supplierInvoices.forEach(invoice => {
    const originalAmount = parseFloat(invoice.total || 0);
    const returnAmount = returnsByInvoice[invoice.id] || 0;
    const paidAmount = paymentsByInvoice[invoice.id] || 0;
    const netAmount = originalAmount - returnAmount;
    
    const invoiceDetail = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      originalAmount,
      returnAmount,
      paidAmount,
      remainingAmount: Math.max(0, netAmount - paidAmount),
      status: netAmount - paidAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partially_paid' : 'unpaid'),
      date: invoice.date,
      invoice: invoice
    };
    
    invoiceDetails.push(invoiceDetail);
    balance += invoiceDetail.remainingAmount;
  });
  
  // ترتيب الفواتير حسب التاريخ (الأقدم أولاً)
  invoiceDetails.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    supplierId,
    totalBalance: balance,
    invoiceDetails,
    totalInvoices: invoiceDetails.length,
    paidInvoices: invoiceDetails.filter(i => i.status === 'paid').length,
    partiallyPaidInvoices: invoiceDetails.filter(i => i.status === 'partially_paid').length,
    unpaidInvoices: invoiceDetails.filter(i => i.status === 'unpaid').length
  };
};

/**
 * خوارزمية ذكية لسداد الفواتير مع العميل
 */
export const processCustomerPaymentSmartly = (customerId, paymentAmount, salesInvoices, salesReturns, cashReceipts) => {
  const balanceDetails = calculateCustomerBalanceWithDetails(customerId, salesInvoices, salesReturns, cashReceipts);
  const invoiceDetails = balanceDetails.invoiceDetails.filter(invoice => invoice.remainingAmount > 0);
  
  if (invoiceDetails.length === 0) {
    return {
      success: false,
      message: 'لا توجد فواتير مستحقة للعميل',
      distribution: []
    };
  }
  
  let remainingPayment = paymentAmount;
  const distribution = [];
  const paymentRecords = [];
  
  // ترتيب الفواتير (الأقدم أولاً)
  invoiceDetails.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  for (const invoice of invoiceDetails) {
    if (remainingPayment <= 0) break;
    
    const amountToPay = Math.min(remainingPayment, invoice.remainingAmount);
    const isFullPayment = amountToPay >= invoice.remainingAmount;
    
    const payment = {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: amountToPay,
      isFullPayment,
      previousRemaining: invoice.remainingAmount,
      newRemaining: invoice.remainingAmount - amountToPay,
      paymentDate: new Date().toISOString()
    };
    
    distribution.push(payment);
    paymentRecords.push({
      invoiceId: invoice.invoiceId,
      amount: amountToPay,
      isFullPayment
    });
    
    remainingPayment -= amountToPay;
  }
  
  return {
    success: true,
    totalPaid: paymentAmount - remainingPayment,
    remainingAmount: remainingPayment,
    distribution,
    paymentRecords,
    message: remainingPayment > 0 
      ? `تم سداد ${paymentRecords.length} فاتورة جزئياً، والمتبقي ${remainingPayment} ريال سيتم إضافته للخزينة`
      : `تم سداد ${paymentRecords.length} فاتورة بالكامل`
  };
};

/**
 * خوارزمية ذكية لسداد الفواتير مع المورد
 */
export const processSupplierPaymentSmartly = (supplierId, paymentAmount, purchaseInvoices, purchaseReturns, cashDisbursements) => {
  const balanceDetails = calculateSupplierBalanceWithDetails(supplierId, purchaseInvoices, purchaseReturns, cashDisbursements);
  const invoiceDetails = balanceDetails.invoiceDetails.filter(invoice => invoice.remainingAmount > 0);
  
  if (invoiceDetails.length === 0) {
    return {
      success: false,
      message: 'لا توجد فواتير مستحقة للمورد',
      distribution: []
    };
  }
  
  let remainingPayment = paymentAmount;
  const distribution = [];
  const paymentRecords = [];
  
  // ترتيب الفواتير (الأقدم أولاً)
  invoiceDetails.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  for (const invoice of invoiceDetails) {
    if (remainingPayment <= 0) break;
    
    const amountToPay = Math.min(remainingPayment, invoice.remainingAmount);
    const isFullPayment = amountToPay >= invoice.remainingAmount;
    
    const payment = {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: amountToPay,
      isFullPayment,
      previousRemaining: invoice.remainingAmount,
      newRemaining: invoice.remainingAmount - amountToPay,
      paymentDate: new Date().toISOString()
    };
    
    distribution.push(payment);
    paymentRecords.push({
      invoiceId: invoice.invoiceId,
      amount: amountToPay,
      isFullPayment
    });
    
    remainingPayment -= amountToPay;
  }
  
  return {
    success: true,
    totalPaid: paymentAmount - remainingPayment,
    remainingAmount: remainingPayment,
    distribution,
    paymentRecords,
    message: remainingPayment > 0 
      ? `تم سداد ${paymentRecords.length} فاتورة جزئياً، والمتبقي ${remainingPayment} ريال سيتم إضافته للخزينة`
      : `تم سداد ${paymentRecords.length} فاتورة بالكامل`
  };
};

/**
 * تحديث حالة الفاتورة بعد الدفع
 */
export const updateInvoiceStatusAfterPayment = (invoiceId, paymentRecords, invoices, setInvoices) => {
  const updatedInvoices = invoices.map(invoice => {
    const paymentRecord = paymentRecords.find(p => p.invoiceId === invoice.id);
    if (paymentRecord) {
      const newAmountPaid = (parseFloat(invoice.amountPaid || 0) + paymentRecord.amount);
      const newRemaining = parseFloat(invoice.total) - newAmountPaid;
      
      return {
        ...invoice,
        amountPaid: newAmountPaid,
        remainingAmount: newRemaining,
        status: newRemaining <= 0 ? 'paid' : (newAmountPaid > 0 ? 'partially_paid' : 'unpaid'),
        paidDate: newRemaining <= 0 ? new Date().toISOString() : invoice.paidDate,
        lastPaymentDate: new Date().toISOString()
      };
    }
    return invoice;
  });
  
  setInvoices(updatedInvoices);
  return updatedInvoices;
};

/**
 * تسجيل عملية دفع ذكية في سجل العمليات
 */
export const logSmartPaymentOperation = (operationType, details) => {
  const logEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    operationType,
    details,
    userId: details.userId || 'system',
    description: `${operationType}: ${details.message || 'عملية دفع ذكية'}`
  };
  
  // حفظ في localStorage (يمكن تطويره لقاعدة بيانات لاحقاً)
  const existingLogs = JSON.parse(localStorage.getItem('smart_payment_logs') || '[]');
  existingLogs.unshift(logEntry);
  
  // الاحتفاظ بآخر 100 سجل فقط
  if (existingLogs.length > 100) {
    existingLogs.splice(100);
  }
  
  localStorage.setItem('smart_payment_logs', JSON.stringify(existingLogs));
  return logEntry;
};

/**
 * توليد رقم إيصال ذكي
 */
export const generateSmartReceiptNumber = (type = 'receipt') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  
  const prefix = type === 'receipt' ? 'REC' : 'PAY';
  return `${prefix}-${year}${month}${day}-${timestamp}`;
};

/**
 * التحقق من صحة عملية الدفع
 */
export const validatePaymentOperation = (paymentData) => {
  const errors = [];
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push('مبلغ الدفع غير صحيح');
  }
  
  if (!paymentData.fromType || !['customer', 'supplier'].includes(paymentData.fromType)) {
    errors.push('نوع الطرف المدفوع له غير صحيح');
  }
  
  if (!paymentData.fromId) {
    errors.push('معرف الطرف المدفوع له مطلوب');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * إنشاء تقرير ذكي عن حالة المدفوعات
 */
export const generatePaymentStatusReport = (customerId, salesInvoices, salesReturns, cashReceipts) => {
  const balanceDetails = calculateCustomerBalanceWithDetails(customerId, salesInvoices, salesReturns, cashReceipts);
  
  return {
    customerId,
    reportDate: new Date().toISOString(),
    summary: {
      totalInvoices: balanceDetails.totalInvoices,
      totalBalance: balanceDetails.totalBalance,
      paidInvoices: balanceDetails.paidInvoices,
      partiallyPaidInvoices: balanceDetails.partiallyPaidInvoices,
      unpaidInvoices: balanceDetails.unpaidInvoices
    },
    invoices: balanceDetails.invoiceDetails,
    recommendations: generatePaymentRecommendations(balanceDetails)
  };
};

/**
 * توصيات ذكية للمدفوعات
 */
const generatePaymentRecommendations = (balanceDetails) => {
  const recommendations = [];
  
  if (balanceDetails.unpaidInvoices > 0) {
    recommendations.push(`لديك ${balanceDetails.unpaidInvoices} فاتورة غير مدفوعة`);
  }
  
  if (balanceDetails.partiallyPaidInvoices > 0) {
    recommendations.push(`لديك ${balanceDetails.partiallyPaidInvoices} فاتورة مدفوعة جزئياً`);
  }
  
  if (balanceDetails.totalBalance > 0) {
    const oldestInvoice = balanceDetails.invoiceDetails.find(inv => inv.status === 'unpaid');
    if (oldestInvoice) {
      const daysDiff = Math.floor((new Date() - new Date(oldestInvoice.date)) / (1000 * 60 * 60 * 24));
      recommendations.push(`أقدم فاتورة مستحقة منذ ${daysDiff} يوم`);
    }
  }
  
  return recommendations;
};