// ======================================
// Simple Data Context - عرض البيانات فقط
// للتوضيح والتجربة - لا يحتوي على منطق تجاري
// ======================================

import React, { createContext, useContext, useState } from 'react';
import mockData from '../data/mockData';

// إنشاء Context
const SimpleDataContext = createContext();

// Hook لاستخدام Context
export const useSimpleData = () => {
  const context = useContext(SimpleDataContext);
  if (!context) {
    throw new Error('useSimpleData must be used within SimpleDataProvider');
  }
  return context;
};

export const SimpleDataProvider = ({ children }) => {
  
  // ======== بيانات المخازن (للعرض فقط) ========
  const [warehouses] = useState(mockData.warehouses);
  
  // ======== بيانات المنتجات (للعرض فقط) ========
  const [products] = useState(mockData.products);
  
  // ======== بيانات الفئات (للعرض فقط) ========
  const [categories] = useState(mockData.categories);
  
  // ======== بيانات الموردين (للعرض فقط) ========
  const [suppliers] = useState(mockData.suppliers);
  
  // ======== بيانات العملاء (للعرض فقط) ========
  const [customers] = useState(mockData.customers);
  
  // ======== بيانات فواتير المشتريات (للعرض فقط) ========
  const [purchaseInvoices] = useState(mockData.purchaseInvoices);
  
  // ======== بيانات فواتير المبيعات (للعرض فقط) ========
  const [salesInvoices] = useState(mockData.salesInvoices);
  
  // ======== بيانات التحويلات (للعرض فقط) ========
  const [transfers] = useState(mockData.transfers);
  
  // ======== بيانات الخزينة (للعرض فقط) ========
  const [treasury] = useState(mockData.treasury);
  
  // ======== بيانات الحسابات (للعرض فقط) ========
  const [accounts] = useState(mockData.accounts);
  
  // ======== بيانات القيود اليومية (للعرض فقط) ========
  const [journalEntries] = useState(mockData.journalEntries);
  
  // ======== بيانات الموظفين (للعرض فقط) ========
  const [employees] = useState(mockData.employees);
  
  // ======== بيانات الأقسام (للعرض فقط) ========
  const [departments] = useState(mockData.departments);
  
  // ======== بيانات التقارير (للعرض فقط) ========
  const [dashboardStats] = useState(mockData.dashboardStats);

  // ======== دوال البحث البسيطة (للعرض فقط) ========
  
  const findProduct = (id) => products.find(p => p.id === id);
  const findWarehouse = (id) => warehouses.find(w => w.id === id);
  const findCategory = (id) => categories.find(c => c.id === id);
  const findSupplier = (id) => suppliers.find(s => s.id === id);
  const findCustomer = (id) => customers.find(c => c.id === id);
  const findAccount = (id) => accounts.find(a => a.id === id);
  const findEmployee = (id) => employees.find(e => e.id === id);
  const findDepartment = (id) => departments.find(d => d.id === id);

  // ======== دوال الفلترة البسيطة (للعرض فقط) ========
  
  const getProductsByCategory = (categoryId) => products.filter(p => p.categoryId === categoryId);
  const getProductsByWarehouse = (warehouseId) => products.filter(p => p.warehouseId === warehouseId);
  const getLowStockProducts = () => products.filter(p => p.mainQuantity <= p.minStockLevel);
  const getInvoicesByCustomer = (customerId) => salesInvoices.filter(inv => inv.customerId === customerId);
  const getInvoicesBySupplier = (supplierId) => purchaseInvoices.filter(inv => inv.supplierId === supplierId);
  const getRecentInvoices = (limit = 10) => {
    const allInvoices = [...salesInvoices, ...purchaseInvoices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    return allInvoices;
  };

  // ======== إحصائيات بسيطة (للعرض فقط) ========
  
  const getSimpleStats = () => ({
    // إحصائيات المبيعات
    totalSalesInvoices: salesInvoices.length,
    totalSalesAmount: salesInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    pendingSalesInvoices: salesInvoices.filter(inv => inv.paymentStatus === 'pending').length,
    
    // إحصائيات المشتريات
    totalPurchaseInvoices: purchaseInvoices.length,
    totalPurchaseAmount: purchaseInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    pendingPurchaseInvoices: purchaseInvoices.filter(inv => inv.paymentType === 'deferred').length,
    
    // إحصائيات المخزون
    totalProducts: products.length,
    lowStockCount: getLowStockProducts().length,
    totalWarehouseValue: products.reduce((sum, p) => {
      return sum + ((p.mainQuantity || 0) * (p.mainPrice || 0)) + ((p.subQuantity || 0) * (p.subPrice || 0));
    }, 0),
    
    // إحصائيات العملاء والموردين
    totalCustomers: customers.length,
    totalSuppliers: suppliers.length,
    activeCustomers: customers.filter(c => c.isActive).length,
    activeSuppliers: suppliers.filter(s => s.isActive).length,
    
    // إحصائيات الخزينة
    treasuryBalance: treasury.balance,
    totalReceipts: treasury.cashReceipts.length,
    totalDisbursements: treasury.cashDisbursements.length,
    
    // إحصائيات الموظفين
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length
  });

  // ======== قيم السياق ========
  const value = {
    // البيانات (للعرض فقط)
    warehouses,
    products,
    categories,
    suppliers,
    customers,
    purchaseInvoices,
    salesInvoices,
    transfers,
    treasury,
    accounts,
    journalEntries,
    employees,
    departments,
    dashboardStats,
    
    // دوال البحث البسيطة
    findProduct,
    findWarehouse,
    findCategory,
    findSupplier,
    findCustomer,
    findAccount,
    findEmployee,
    findDepartment,
    
    // دوال الفلترة البسيطة
    getProductsByCategory,
    getProductsByWarehouse,
    getLowStockProducts,
    getInvoicesByCustomer,
    getInvoicesBySupplier,
    getRecentInvoices,
    
    // إحصائيات بسيطة
    getSimpleStats,
    
    // رسالة توضيحية
    note: "هذه البيانات للعرض والتجربة فقط - لا تحتوي على منطق تجاري فعلي"
  };

  return (
    <SimpleDataContext.Provider value={value}>
      {children}
    </SimpleDataContext.Provider>
  );
};