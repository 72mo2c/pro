// ======================================
// Migration Script - ترحيل أرصدة العملاء والموردين
// ======================================

/**
 * سكريبت ترحيل البيانات لإضافة حقول balance للعملاء والموردين
 * يحسب الأرصدة من المعاملات القديمة ويحفظها
 */

export const migrateCustomerBalances = (customers, salesInvoices, salesReturns, cashReceipts) => {
  console.log('🔄 بدء ترحيل أرصدة العملاء...');
  
  const updatedCustomers = customers.map(customer => {
    // تخطي إذا كان الرصيد موجوداً بالفعل
    if (customer.balance !== undefined && customer.lastTransactionDate) {
      console.log(`⏭️ العميل ${customer.name} لديه رصيد محفوظ بالفعل`);
      return customer;
    }
    
    // حساب الرصيد من المعاملات
    let balance = 0;
    
    // 1. المبيعات (دين على العميل)
    salesInvoices.forEach(invoice => {
      if (invoice.customerId === customer.id) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // 2. المرتجعات (تخفض من دين العميل)
    salesReturns.forEach(returnRecord => {
      const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.customerId === customer.id) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // 3. الاستلامات من العميل (تخفض من دين العميل)
    cashReceipts.forEach(receipt => {
      if (receipt.fromType === 'customer' && receipt.fromId === customer.id) {
        balance -= parseFloat(receipt.amount || 0);
      }
    });
    
    console.log(`✅ العميل: ${customer.name} - الرصيد المحسوب: ${balance.toFixed(2)}`);
    
    return {
      ...customer,
      balance: balance,
      lastTransactionDate: new Date().toISOString(),
      lastTransactionType: 'migration'
    };
  });
  
  console.log('✅ تم ترحيل أرصدة العملاء بنجاح');
  return updatedCustomers;
};

export const migrateSupplierBalances = (suppliers, purchaseInvoices, purchaseReturns, cashDisbursements) => {
  console.log('🔄 بدء ترحيل أرصدة الموردين...');
  
  const updatedSuppliers = suppliers.map(supplier => {
    // تخطي إذا كان الرصيد موجوداً بالفعل
    if (supplier.balance !== undefined && supplier.lastTransactionDate) {
      console.log(`⏭️ المورد ${supplier.name} لديه رصيد محفوظ بالفعل`);
      return supplier;
    }
    
    // حساب الرصيد من المعاملات
    let balance = 0;
    
    // 1. المشتريات (دين علينا للمورد)
    purchaseInvoices.forEach(invoice => {
      if (invoice.supplierId === supplier.id) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // 2. المرتجعات (تخفض من ديوننا للمورد)
    purchaseReturns.forEach(returnRecord => {
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.supplierId === supplier.id) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // 3. الصرف للمورد (تخفض من ديوننا للمورد)
    cashDisbursements.forEach(disbursement => {
      if (disbursement.toType === 'supplier' && disbursement.toId === supplier.id) {
        balance -= parseFloat(disbursement.amount || 0);
      }
    });
    
    console.log(`✅ المورد: ${supplier.name} - الرصيد المحسوب: ${balance.toFixed(2)}`);
    
    return {
      ...supplier,
      balance: balance,
      lastTransactionDate: new Date().toISOString(),
      lastTransactionType: 'migration'
    };
  });
  
  console.log('✅ تم ترحيل أرصدة الموردين بنجاح');
  return updatedSuppliers;
};

/**
 * دالة شاملة لترحيل جميع البيانات
 */
export const migrateAllBalances = ({
  customers,
  suppliers,
  salesInvoices,
  salesReturns,
  cashReceipts,
  purchaseInvoices,
  purchaseReturns,
  cashDisbursements
}) => {
  console.log('🚀 بدء ترحيل جميع البيانات...');
  
  const updatedCustomers = migrateCustomerBalances(customers, salesInvoices, salesReturns, cashReceipts);
  const updatedSuppliers = migrateSupplierBalances(suppliers, purchaseInvoices, purchaseReturns, cashDisbursements);
  
  const report = {
    customersUpdated: updatedCustomers.filter(c => c.lastTransactionType === 'migration').length,
    suppliersUpdated: updatedSuppliers.filter(s => s.lastTransactionType === 'migration').length,
    totalBalance: {
      customers: updatedCustomers.reduce((sum, c) => sum + (c.balance || 0), 0),
      suppliers: updatedSuppliers.reduce((sum, s) => sum + (s.balance || 0), 0)
    }
  };
  
  console.log('📊 تقرير الترحيل:', report);
  
  return {
    updatedCustomers,
    updatedSuppliers,
    report
  };
};
