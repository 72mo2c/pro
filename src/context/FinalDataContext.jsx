// ======================================
// Final Simple Context - السياق النهائي المبسط
// يستخدم mockDataService للوصول لجميع البيانات
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import mockDataService from '../services/mockDataService';

const FinalDataContext = createContext();

// Hook لاستخدام Context
export const useFinalData = () => {
  const context = useContext(FinalDataContext);
  if (!context) {
    throw new Error('useFinalData must be used within FinalDataProvider');
  }
  return context;
};

export const FinalDataProvider = ({ children }) => {
  
  // تحميل البيانات عند بدء التطبيق
  const [data, setData] = useState({
    // المخازن
    warehouses: [],
    // المنتجات
    products: [],
    categories: [],
    // الموردين والعملاء
    suppliers: [],
    customers: [],
    // الفواتير
    purchaseInvoices: [],
    salesInvoices: [],
    // الخزينة
    treasury: { balance: 0, cashReceipts: [], cashDisbursements: [] },
    // المحاسبة
    accounts: [],
    journalEntries: [],
    // الموارد البشرية
    employees: [],
    departments: [],
    // التقارير
    dashboardStats: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل البيانات
    const loadData = async () => {
      setLoading(true);
      
      // محاكاة تأخير تحميل البيانات
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تحميل جميع البيانات من الخدمة
      setData({
        warehouses: mockDataService.getWarehouses(),
        products: mockDataService.getProducts(),
        categories: mockDataService.getCategories(),
        suppliers: mockDataService.getSuppliers(),
        customers: mockDataService.getCustomers(),
        purchaseInvoices: mockDataService.getPurchaseInvoices(),
        salesInvoices: mockDataService.getSalesInvoices(),
        treasury: mockDataService.getTreasury(),
        accounts: mockDataService.getAccounts(),
        journalEntries: mockDataService.getJournalEntries(),
        employees: mockDataService.getEmployees(),
        departments: mockDataService.getDepartments(),
        dashboardStats: mockDataService.getDashboardStats()
      });
      
      setLoading(false);
    };

    loadData();
  }, []);

  // ======== دوال البحث والفلترة ========
  
  const findProduct = (id) => mockDataService.getProduct(id);
  const findWarehouse = (id) => data.warehouses.find(w => w.id === id);
  const findCategory = (id) => data.categories.find(c => c.id === id);
  const findSupplier = (id) => data.suppliers.find(s => s.id === id);
  const findCustomer = (id) => data.customers.find(c => c.id === id);
  const findAccount = (id) => data.accounts.find(a => a.id === id);
  const findEmployee = (id) => data.employees.find(e => e.id === id);
  const findDepartment = (id) => data.departments.find(d => d.id === id);

  const getProductsByCategory = (categoryId) => data.products.filter(p => p.categoryId === categoryId);
  const getProductsByWarehouse = (warehouseId) => data.products.filter(p => p.warehouseId === warehouseId);
  const getLowStockProducts = () => data.products.filter(p => p.mainQuantity <= p.minStockLevel);
  const getInvoicesByCustomer = (customerId) => data.salesInvoices.filter(inv => inv.customerId === customerId);
  const getInvoicesBySupplier = (supplierId) => data.purchaseInvoices.filter(inv => inv.supplierId === supplierId);
  const getRecentInvoices = (limit = 10) => {
    const allInvoices = [...data.salesInvoices, ...data.purchaseInvoices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    return allInvoices;
  };

  // ======== دوال البحث النصي ========
  const searchProducts = (searchTerm) => mockDataService.searchProducts(searchTerm);
  const searchCustomers = (searchTerm) => mockDataService.searchCustomers(searchTerm);
  const searchSuppliers = (searchTerm) => mockDataService.searchSuppliers(searchTerm);

  // ======== دوال التقارير ========
  const getSalesReport = (startDate, endDate) => mockDataService.getSalesReport(startDate, endDate);
  const getPurchaseReport = (startDate, endDate) => mockDataService.getPurchaseReport(startDate, endDate);
  const getInventoryReport = () => mockDataService.getInventoryReport();

  // ======== دوال العمليات (للعرض فقط) ========
  const saveData = async () => await mockDataService.saveData();
  const updateData = async () => await mockDataService.updateData();
  const deleteData = async () => await mockDataService.deleteData();

  // ======== إحصائيات متقدمة ========
  const getAdvancedStats = () => {
    const stats = mockDataService.getSimpleStats();
    
    // إضافة إحصائيات إضافية للعرض
    return {
      ...stats,
      // إحصائيات إضافية
      totalInventoryValue: data.products.reduce((sum, p) => {
        return sum + ((p.mainQuantity || 0) * (p.mainPrice || 0)) + 
               ((p.subQuantity || 0) * (p.subPrice || 0));
      }, 0),
      
      // أكثر المنتجات مبيعاً
      topSellingProducts: data.dashboardStats?.topSellingProducts || [],
      
      // أفضل العملاء
      topCustomers: data.dashboardStats?.topCustomers || [],
      
      // معدل النمو
      monthlyGrowth: data.dashboardStats?.monthlyGrowth || 0,
      
      // آخر المعاملات
      recentTransactions: getRecentInvoices(5)
    };
  };

  // ======== معلومات النظام ========
  const getSystemInfo = () => mockDataService.getSystemInfo();

  // ======== قيم السياق النهائية ========
  const value = {
    // البيانات (للعرض فقط)
    ...data,
    
    // حالة التحميل
    loading,
    
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
    
    // دوال البحث النصي
    searchProducts,
    searchCustomers,
    searchSuppliers,
    
    // دوال التقارير
    getSalesReport,
    getPurchaseReport,
    getInventoryReport,
    
    // دوال العمليات (للعرض فقط)
    saveData,
    updateData,
    deleteData,
    
    // إحصائيات متقدمة
    getAdvancedStats,
    
    // معلومات النظام
    getSystemInfo,
    
    // رسالة توضيحية
    note: "هذه البيانات للعرض والتجربة فقط - لا تحتوي على منطق تجاري فعلي"
  };

  return (
    <FinalDataContext.Provider value={value}>
      {children}
    </FinalDataContext.Provider>
  );
};